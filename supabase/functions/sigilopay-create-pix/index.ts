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
    const docDigits = (b.document || "").replace(/\D/g, "");
    if (docDigits.length !== 11 && docDigits.length !== 14) return json({ error: "Documento inválido" }, 400);
    const phoneDigits = (b.phone || "").replace(/\D/g, "");
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

    const payload = {
      identifier,
      amount: Number(totalAmount.toFixed(2)),
      client: {
        name: b.name.trim(),
        email: b.email.trim(),
        phone: b.phone,
        document: b.document,
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

    // Persist order with service_role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    await supabase.from("orders").insert({
      identifier,
      transaction_id: sigiloData.transactionId,
      status: sigiloData.status || "PENDING",
      amount: totalAmount,
      product_name: body.product_name,
      buyer_name: b.name,
      buyer_email: b.email,
      buyer_document: b.document,
      buyer_phone: b.phone,
      pix_code: sigiloData?.pix?.code || null,
      pix_image: sigiloData?.pix?.image || null,
      metadata: { bumps: body.bumps || [] },
    });

    return json({
      identifier,
      transactionId: sigiloData.transactionId,
      status: sigiloData.status,
      pix: sigiloData.pix,
      amount: totalAmount,
    });
  } catch (err) {
    console.error("create-pix exception:", err);
    return json({ error: (err as Error).message }, 500);
  }
});
