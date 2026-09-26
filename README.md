# metodocaixablindado.com.br

Landing page do Método Caixa Blindado. Astro + Vercel.

- Conteúdo editável: `src/content/site.json`
- Cadastro → `/api/lead` → Google Apps Script (`google-apps-script/Codigo.gs`) → **uma linha nova** na aba `Leads` da planilha "Pipeline Caixa Blindado" + e-mail de aviso
- Depois do cadastro: `/obrigado` abre o WhatsApp com mensagem pronta

## Rodar localmente

```bash
npm install
cp .env.example .env   # preencha SHEETS_WEBHOOK_URL e SHEETS_SECRET
npm run dev
```

## Variáveis de ambiente (Vercel)

| Variável | Obrigatória | O que é |
|---|---|---|
| `SHEETS_WEBHOOK_URL` | sim | URL do App da Web do Google Apps Script |
| `SHEETS_SECRET` | sim | Senha gerada pela função `configurar()` do Apps Script |
| `PUBLIC_META_PIXEL_ID` | não | ID do Pixel do Meta |
| `PUBLIC_GA4_ID` | não | ID do Google Analytics 4 (G-XXXX) |

Veja `CLAUDE.md` para o mapa de arquivos e as regras de alteração.
