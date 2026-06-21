import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SIGILO_BASE = "https://app.sigilopay.com.br/api/v1";

interface CreatePixBody {
  amount: number;
  product_name: string;
  buyer: {
    name: string;
    email: string;
    document: string;
    phone: string;
  };
  bumps?: { id: string; name: string; price: number }[];
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const onlyDigits = (value = "") => value.replace(/\D/g, "");

const isSameDigitSequence = (value: string) => /^(\d)\1+$/.test(value);

const isValidCpf = (cpf: string) => {
  if (cpf.length !== 11 || isSameDigitSequence(cpf)) return false;

  const calcDigit = (length: number) => {
    const sum = cpf
      .slice(0, length)
      .split("")
      .reduce((acc, digit, index) => acc + Number(digit) * (length + 1 - index), 0);
    const digit = (sum * 10) % 11;
    return digit === 10 ? 0 : digit;
  };

  return calcDigit(9) === Number(cpf[9]) && calcDigit(10) === Number(cpf[10]);
};

const isValidCnpj = (cnpj: string) => {
  if (cnpj.length !== 14 || isSameDigitSequence(cnpj)) return false;

  const calcDigit = (base: string, weights: number[]) => {
    const sum = base
      .split("")
      .reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calcDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondDigit = calcDigit(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return firstDigit === Number(cnpj[12]) && secondDigit === Number(cnpj[13]);
};

const isValidDocument = (document: string) =>
  document.length === 11 ? isValidCpf(document) : document.length === 14 ? isValidCnpj(document) : false;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const pub = Deno.env.get("SIGILOPAY_PUBLIC_KEY");
    const sec = Deno.env.get("SIGILOPAY_SECRET_KEY");
    if (!pub || !sec) return json({ error: "SigiloPay não configurado" }, 500);

    const body = (await req.json()) as CreatePixBody;

    // Validation
    if (!body?.amount || body.amount <= 0) return json({ error: "Valor inválido" }, 400);
    if (!body.product_name) return json({ error: "Produto obrigatório" }, 400);
    const b = body.buyer || ({} as CreatePixBody["buyer"]);
    if (!b.name || b.name.trim().length < 3) return json({ error: "Nome inválido" }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email || "")) return json({ error: "E-mail inválido" }, 400);
    const docDigits = onlyDigits(b.document || "");
    if (!isValidDocument(docDigits)) return json({ error: "Informe um CPF ou CNPJ válido" }, 400);
    const phoneDigits = onlyDigits(b.phone || "");
    if (phoneDigits.length < 10) return json({ error: "Telefone inválido" }, 400);

    const identifier = `ps_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

    const products = [
      { id: "main", name: body.product_name, quantity: 1, price: Number(body.amount.toFixed(2)) },
      ...(body.bumps || []).map((bp) => ({
        id: bp.id,
        name: bp.name,
        quantity: 1,
        price: Number(bp.price.toFixed(2)),
      })),
    ];

    const totalAmount = products.reduce((s, p) => s + p.price * p.quantity, 0);
    if (totalAmount < 1) return json({ error: "Valor mínimo para transação é de R$ 1,00" }, 400);

    const payload = {
      identifier,
      amount: Number(totalAmount.toFixed(2)),
      client: {
        name: b.name.trim(),
        email: b.email.trim(),
        phone: phoneDigits,
        document: docDigits,
      },
      products,
      metadata: { source: "pura-sensi-linkinbio" },
    };

    const sigiloRes = await fetch(`${SIGILO_BASE}/gateway/pix/receive`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-public-key": pub,
        "x-secret-key": sec,
      },
      body: JSON.stringify(payload),
    });

    const sigiloData = await sigiloRes.json().catch(() => ({}));

    if (!sigiloRes.ok) {
      console.error("SigiloPay error:", sigiloRes.status, sigiloData);
      return json(
        { error: sigiloData?.message || "Falha ao gerar PIX", details: sigiloData },
        sigiloRes.status,
      );
    }

    const sigiloCharge = sigiloData?.data ?? sigiloData;
    const transactionId = sigiloCharge?.transactionId ?? sigiloCharge?.transaction_id ?? sigiloCharge?.id;
    const pixData = sigiloCharge?.pix ?? {};
    const pixCode = pixData?.code ?? pixData?.copy_paste ?? pixData?.qr_code ?? sigiloCharge?.pix_code;
    const pixImage = pixData?.image ?? pixData?.qr_code_base64 ?? sigiloCharge?.pix_image;

    if (!pixCode) {
      console.error("SigiloPay response without PIX code:", sigiloData);
      return json({ error: "PIX gerado sem código de pagamento", details: sigiloData }, 502);
    }

    // Persist order with service_role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error: insertError } = await supabase.from("orders").insert({
      identifier,
      transaction_id: transactionId,
      status: sigiloCharge?.status || "PENDING",
      amount: totalAmount,
      product_name: body.product_name,
      buyer_name: b.name,
      buyer_email: b.email,
      buyer_document: docDigits,
      buyer_phone: phoneDigits,
      pix_code: pixCode,
      pix_image: pixImage || null,
      metadata: { bumps: body.bumps || [] },
    });

    if (insertError) console.error("Order insert error:", insertError);

    return json({
      identifier,
      transactionId,
      status: sigiloCharge?.status,
      pix: { ...pixData, code: pixCode, image: pixImage },
      amount: totalAmount,
    });
  } catch (err) {
    console.error("create-pix exception:", err);
    return json({ error: (err as Error).message }, 500);
  }
});
