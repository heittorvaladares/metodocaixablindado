# Guia de publicação — metodocaixablindado.com.br

Siga na ordem. Cada passo leva de 5 a 15 minutos. Se travar em algum, me mande um print da tela.

---

## Passo 1 — Colocar o site no GitHub

1. Descompacte o arquivo `metodocaixablindado.zip` no seu computador.
2. No GitHub, abra o repositório **privado** `metodocaixablindado` que você criou (vazio).
3. Clique em **"uploading an existing file"** (ou **Add file → Upload files**).
4. Abra a pasta descompactada, selecione **tudo o que está dentro dela** e arraste para a página do GitHub.
   - No Mac, aperte `Cmd + Shift + .` na pasta para mostrar os arquivos ocultos (`.gitignore` e `.env.example`) e arraste-os também.
5. Em "Commit changes", escreva `Primeira versão do site` e clique em **Commit changes**.

✅ Pronto quando: você vê as pastas `src`, `public` e `google-apps-script` e o arquivo `package.json` na página do repositório.

---

## Passo 2 — Ligar a planilha "Pipeline Caixa Blindado"

1. Abra a planilha **Pipeline Caixa Blindado** no Google Drive.
2. Menu **Extensões → Apps Script**.
3. Apague o que estiver escrito e cole **todo** o conteúdo do arquivo `google-apps-script/Codigo.gs`. Clique no ícone de disquete (Salvar).
4. No topo, ao lado de "Depurar", escolha a função **`configurar`** e clique em **Executar**.
   - O Google vai pedir autorização: **Revisar permissões → sua conta → Avançado → Acessar (não seguro) → Permitir**. É normal: o script é seu.
5. Embaixo, no "Registro de execução", aparece:
   `PRONTO. Copie esta senha para a Vercel (SHEETS_SECRET): xxxxxxxx`
   **Copie essa senha** e guarde.
6. Volte à planilha: agora existem as abas **Leads** (com cabeçalho) e **Resumo**.
7. No Apps Script, clique em **Implantar → Nova implantação**.
   - Engrenagem ao lado de "Selecionar tipo" → **App da Web**.
   - Executar como: **Eu**.
   - Quem pode acessar: **Qualquer pessoa**.
   - Clique em **Implantar** e **copie a URL do App da Web** (termina em `/exec`).

> "Qualquer pessoa" é necessário para o site conseguir enviar os dados. Ninguém consegue gravar nada sem a senha do item 5.

✅ Pronto quando: você tem a **senha** e a **URL /exec** guardadas.

---

## Passo 3 — Publicar na Vercel

1. Na Vercel: **Add New… → Project**.
2. Em "Import Git Repository", conecte sua conta do GitHub (se pedir) e escolha **metodocaixablindado** → **Import**.
3. A Vercel detecta **Astro** sozinha. Não mude nada em Build.
4. Abra **Environment Variables** e cadastre:

   | Name | Value |
   |---|---|
   | `SHEETS_WEBHOOK_URL` | a URL `/exec` do passo 2 |
   | `SHEETS_SECRET` | a senha do passo 2 |

5. Clique em **Deploy** e espere terminar (1 a 2 minutos).
6. Abra o endereço provisório que a Vercel mostra (`metodocaixablindado-xxxx.vercel.app`).
7. **Teste:** preencha o formulário com seus dados e envie.
   - Deve abrir o WhatsApp com a mensagem pronta.
   - Deve aparecer **uma linha nova** na aba **Leads**.
   - Deve chegar um e-mail "Novo lead Caixa Blindado".
   - Envie de novo com o mesmo WhatsApp: deve aparecer **outra linha**, com "Lead repetido = SIM".

> Plano da Vercel: o plano gratuito (Hobby) é para uso pessoal. Como o site é comercial, o correto é o **Pro** (cerca de US$ 20/mês). Dá para começar os testes no gratuito e mudar antes de rodar os anúncios.

✅ Pronto quando: o teste gerou as linhas na planilha e o e-mail chegou.

---

## Passo 4 — Colocar no domínio metodocaixablindado.com.br

1. Na Vercel, dentro do projeto: **Settings → Domains → Add**.
2. Adicione `metodocaixablindado.com.br` e depois `www.metodocaixablindado.com.br`.
3. A Vercel mostra os **registros de DNS** que faltam (tipo, nome e valor). Deixe essa tela aberta.
4. No Registro.br: entre, clique no domínio → **DNS → Configurar zona DNS** (se aparecer, ative o "modo avançado").
5. Crie exatamente os registros que a Vercel mostrou (geralmente um registro **A** para o domínio sem www e um **CNAME** para o `www`). Salve.
6. Volte à Vercel e espere os dois domínios ficarem com status **Valid** (de minutos a algumas horas).

✅ Pronto quando: https://metodocaixablindado.com.br abre o site com cadeado.

---

## Passo 5 — Ajustar o número do WhatsApp

O número está com um valor provisório (`5562999999999`). Para trocar, peça ao Claude (passo 7) ou faça no GitHub:

1. Abra `src/content/site.json` no GitHub e clique no lápis (Editar).
2. Troque o número em `"whatsapp"` (formato: 55 + DDD + número, só dígitos).
3. **Commit changes**. A Vercel publica sozinha em 1 a 2 minutos.

---

## Passo 6 — Pixel do Meta e Google Analytics (antes dos anúncios)

1. Pegue o **ID do Pixel** no Gerenciador de Eventos do Meta e, se quiser, o **ID do GA4** (G-XXXX).
2. Na Vercel: **Settings → Environment Variables** → cadastre `PUBLIC_META_PIXEL_ID` e/ou `PUBLIC_GA4_ID`.
3. **Deployments → último deploy → ⋯ → Redeploy**.
4. O aviso de cookies passa a aparecer; o Pixel só carrega para quem aceitar.

---

## Passo 7 — Fazer alterações com o Claude

1. Em **claude.ai/code**, conecte sua conta do GitHub e escolha o repositório `metodocaixablindado`.
2. Peça em português: *"Troque o título do topo para …"*, *"Coloque a foto heittor.webp na seção Sobre"*, *"Mostre a seção de depoimentos"*.
3. O Claude cria a alteração num **Pull Request**. A Vercel gera uma **prévia**; abra e confira.
4. Gostou? No GitHub, clique em **Merge pull request**. Em 1 a 2 minutos está no ar.

Para fotos: envie o arquivo junto com o pedido e diga em qual lugar ela entra.

**Proteção recomendada (uma vez só):** GitHub → repositório → **Settings → Branches → Add rule** para `main` → marque **Require a pull request before merging**. Assim nenhuma mudança vai ao ar sem você aprovar.

---

## Se algo der errado

| Problema | O que fazer |
|---|---|
| Formulário mostra "Não conseguimos enviar agora" | Confira as duas variáveis na Vercel e faça **Redeploy**. Confira se a implantação do Apps Script está como "Qualquer pessoa". |
| Mudei o `Codigo.gs` e parou de gravar | No Apps Script: **Implantar → Gerenciar implantações → editar (lápis) → Versão: Nova versão → Implantar**. A URL continua a mesma. |
| Não chega o e-mail | O lead já está na planilha. O e-mail vai para a conta Google dona do script; veja o spam. |
| Site fora do ar depois de uma mudança | Vercel → **Deployments** → escolha o deploy anterior que funcionava → **⋯ → Promote to Production**. |
