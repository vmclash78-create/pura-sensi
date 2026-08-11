import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SIGILO_BASE = "https://app.sigilopay.com.br/api/v1";

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

    const { transactionId } = await req.json();
    if (!transactionId || typeof transactionId !== "string") {
      return json({ error: "transactionId obrigatório" }, 400);
    }

    const res = await fetch(
      `${SIGILO_BASE}/gateway/transactions?id=${encodeURIComponent(transactionId)}`,
      {
        headers: {
          "x-public-key": pub,
          "x-secret-key": sec,
        },
      },
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("SigiloPay status error:", res.status, data);
      return json({ error: data?.message || "Falha ao consultar", details: data }, res.status);
    }

    const tx = Array.isArray(data) ? data[0] : data?.transaction || data;
    const status: string = tx?.status || "PENDING";

    if (status === "OK" || status === "PAID") {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      await supabase
        .from("orders")
        .update({ status, paid_at: new Date().toISOString() })
        .eq("transaction_id", transactionId);
    }

    return json({ status, transactionId });
  } catch (err) {
    console.error("check-status exception:", err);
    return json({ error: (err as Error).message }, 500);
  }
});
