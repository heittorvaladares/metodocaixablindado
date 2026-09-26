// Recebe o formulário e envia para a planilha "Pipeline Caixa Blindado"
// (via Google Apps Script). Cada envio vira UMA LINHA NOVA na planilha.
import type { APIRoute } from "astro";

export const prerender = false;

const MAX_PER_HOUR = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 3600_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_HOUR;
}

const clean = (v: unknown, max = 200) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  // Robô preencheu o campo escondido: responde "ok" e descarta.
  if (clean(body.empresa_site)) return json({ ok: true });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || clientAddress || "unknown";
  if (rateLimited(ip)) return json({ ok: false, error: "rate_limited" }, 429);

  const digits = clean(body.whatsapp).replace(/\D/g, "");
  const lead = {
    nome: clean(body.nome, 120),
    whatsapp: digits ? `+55${digits}` : "",
    loja: clean(body.loja, 120),
    cidade: clean(body.cidade, 120),
    cargo: clean(body.cargo, 60),
    faturamento: clean(body.faturamento, 60),
    erp: clean(body.erp, 120),
    utm_source: clean(body.utm_source, 120),
    utm_medium: clean(body.utm_medium, 120),
    utm_campaign: clean(body.utm_campaign, 120),
    utm_content: clean(body.utm_content, 120),
    consentimentoTexto: clean(body.consentimentoTexto, 400),
  };

  const errors: string[] = [];
  if (lead.nome.length < 3) errors.push("nome");
  if (digits.length < 10 || digits.length > 11) errors.push("whatsapp");
  if (!lead.loja) errors.push("loja");
  if (!lead.cidade) errors.push("cidade");
  if (!lead.cargo) errors.push("cargo");
  if (!lead.faturamento) errors.push("faturamento");
  if (body.consentimento !== true) errors.push("consentimento");
  if (errors.length) return json({ ok: false, error: "invalid", fields: errors }, 400);

  const url = import.meta.env.SHEETS_WEBHOOK_URL || process.env.SHEETS_WEBHOOK_URL;
  const secret = import.meta.env.SHEETS_SECRET || process.env.SHEETS_SECRET;
  if (!url || !secret) {
    console.error("SHEETS_WEBHOOK_URL ou SHEETS_SECRET não configurados", lead);
    return json({ ok: false, error: "not_configured" }, 500);
  }

  const payload = JSON.stringify({ secret, lead });
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        redirect: "follow",
      });
      const text = await res.text();
      if (res.ok && text.includes('"ok":true')) return json({ ok: true });
      console.error(`Planilha respondeu com erro (tentativa ${attempt})`, res.status, text.slice(0, 300));
    } catch (err) {
      console.error(`Falha ao gravar na planilha (tentativa ${attempt})`, err);
    }
  }
  console.error("LEAD NÃO GRAVADO NA PLANILHA", lead);
  return json({ ok: false, error: "sheet_failed" }, 502);
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
