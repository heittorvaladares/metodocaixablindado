# CLAUDE.md — metodocaixablindado.com.br

Landing page do **Método Caixa Blindado**, de Heittor Lopes Valadares. O dono não é programador: ele pede alterações em português simples. Responda em português, faça exatamente a alteração pedida e abra um Pull Request.

## Idioma

- **O site é 100% em português do Brasil.** Todo texto novo ou alterado deve soar natural, direto, de dono de loja para dono de loja.
- Títulos e descrições de Pull Request em português, para o dono entender.

## Como trabalhar aqui

1. **Nunca faça commit direto na `main`.** Crie uma branch (`ajuste/<descricao-curta>`), faça a alteração e abra um Pull Request com um resumo simples do que mudou.
2. A Vercel gera uma **URL de prévia** para o PR. Passe essa URL ao dono e peça que ele confira antes de aprovar (merge).
3. Rode `npm run build` antes de abrir o PR. Se falhar, corrija.
4. Mude só o que foi pedido. Sem refatorar, sem atualizar dependências, sem mexer no design sem pedido explícito.

## Onde fica cada coisa

| Quero mudar… | Arquivo |
|---|---|
| Qualquer texto, número, pergunta frequente, preço, links, vídeo, WhatsApp e mensagem do WhatsApp | `src/content/site.json` |
| Mostrar/ocultar seções (`mostrarDores`, `mostrarPainelExemplo`, `mostrarDepoimentos`, `mostrarPreco`) | `secoes` em `src/content/site.json` |
| Negrito em um texto | use `**assim**` dentro do texto no `site.json` (funciona no subtítulo do topo, na história e no "sobre") |
| Formação (no "Quem ensina") e matérias da imprensa (`mostrarImprensa`) | `sobre.formacao` e `imprensa.itens` em `src/content/site.json` |
| Fotos | coloque o arquivo em `public/images/` (WebP ou JPG, até ~300 KB) e escreva o nome do arquivo no campo `arquivo`/`foto` correspondente no `site.json`. Campo vazio = aparece o espaço reservado |
| Vídeo do topo | cole o link do YouTube em `hero.videoUrl` |
| Cores e fontes | `src/styles/tokens.css` |
| Layout e espaçamentos | `src/styles/global.css` |
| Topo e menu | `src/components/Header.astro` |
| Primeira dobra (título, vídeo, números) | `src/components/Hero.astro` |
| Dores, história, método, IA, oferta, depoimentos, sobre | `src/components/Sections.astro` |
| Formulário | `src/components/LeadForm.astro` |
| Perguntas frequentes, chamada final, botão fixo do celular | `src/components/Closing.astro` |
| Rodapé | `src/components/Footer.astro` |
| Página de obrigado (redireciona ao WhatsApp) | `src/pages/obrigado.astro` |
| Política de privacidade | `src/pages/privacidade.astro` |
| Envio do formulário para a planilha | `src/pages/api/lead.ts` + `google-apps-script/Codigo.gs` (evite mexer; explique o risco antes) |

## Regras de conteúdo

- Não inventar números, depoimentos ou resultados. Todo número publicado vem do dono.
- Sobre a recuperação judicial da Valadares, manter a redação atual do `site.json`, salvo pedido explícito.
- O checkbox de consentimento (LGPD) fica no formulário, desmarcado por padrão.

## Nunca

- Colocar chaves, senhas ou tokens no código. Ficam nas variáveis de ambiente da Vercel (`SHEETS_WEBHOOK_URL`, `SHEETS_SECRET`, `PUBLIC_META_PIXEL_ID`, `PUBLIC_GA4_ID`).
- Remover o aviso de cookies, o Pixel ou o Analytics.
- Alterar a integração com a planilha de forma que ela atualize ou sobrescreva linhas. **Cada cadastro no site sempre cria uma linha nova.**
- Mudar as colunas que o formulário grava sem pedido explícito.
