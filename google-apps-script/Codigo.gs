/**
 * Método Caixa Blindado — recebe os cadastros do site e grava na planilha.
 * REGRA: cada cadastro vira UMA LINHA NOVA na aba "Leads". Nada é sobrescrito.
 *
 * Como instalar: veja o GUIA-DE-PUBLICACAO.md (passo 2).
 */

var ABA_LEADS = "Leads";
var ABA_RESUMO = "Resumo";
var FUSO = "America/Sao_Paulo";
var STATUS = ["Novo", "Contatado", "Dados recebidos", "Raio-X entregue", "Reunião marcada", "Proposta enviada", "Fechado", "Perdido"];
var CABECALHO = [
  "Data/hora", "Nome", "WhatsApp", "Loja", "Cidade/UF", "Cargo", "Faturamento", "ERP",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "Consentimento", "Lead repetido",
  "Status", "Próxima ação", "Data da próxima ação", "Valor fechado", "Observações"
];

/** Rode UMA VEZ pelo editor: cria as abas, o cabeçalho e a senha secreta. */
function configurar() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var leads = ss.getSheetByName(ABA_LEADS) || ss.insertSheet(ABA_LEADS, 0);
  leads.getRange(1, 1, 1, CABECALHO.length).setValues([CABECALHO])
    .setFontWeight("bold").setBackground("#15130F").setFontColor("#F6F1E7");
  leads.setFrozenRows(1);

  var regra = SpreadsheetApp.newDataValidation().requireValueInList(STATUS, true).setAllowInvalid(false).build();
  leads.getRange(2, 15, leads.getMaxRows() - 1, 1).setDataValidation(regra);
  leads.getRange(2, 17, leads.getMaxRows() - 1, 1).setNumberFormat("dd/mm/yyyy");
  leads.getRange(2, 18, leads.getMaxRows() - 1, 1).setNumberFormat("R$ #,##0.00");
  leads.setColumnWidths(1, CABECALHO.length, 140);

  var resumo = ss.getSheetByName(ABA_RESUMO) || ss.insertSheet(ABA_RESUMO);
  resumo.clear();
  resumo.getRange("A1").setValue("Funil por status").setFontWeight("bold");
  resumo.getRange(2, 1, STATUS.length, 1).setValues(STATUS.map(function (s) { return [s]; }));
  for (var i = 0; i < STATUS.length; i++) {
    resumo.getRange(2 + i, 2).setFormula('=COUNTIF(Leads!O:O;A' + (2 + i) + ')');
  }
  resumo.getRange("D1").setValue("Leads por campanha").setFontWeight("bold");
  resumo.getRange("D2").setFormula('=IFERROR(QUERY(Leads!A:O;"select K, count(B) where B is not null group by K label K \'Campanha\', count(B) \'Leads\'";1);"")');
  resumo.getRange("G1").setValue("Total de leads").setFontWeight("bold");
  resumo.getRange("G2").setFormula('=COUNTA(Leads!B2:B)');

  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty("SECRET");
  if (!secret) {
    secret = Utilities.getUuid().replace(/-/g, "");
    props.setProperty("SECRET", secret);
  }
  if (!props.getProperty("NOTIFY_EMAIL")) props.setProperty("NOTIFY_EMAIL", Session.getActiveUser().getEmail());

  Logger.log("PRONTO. Copie esta senha para a Vercel (SHEETS_SECRET): " + secret);
  Logger.log("Os avisos de novo lead vão para: " + props.getProperty("NOTIFY_EMAIL"));
}

/** Recebe o cadastro enviado pelo site. */
function doPost(e) {
  var props = PropertiesService.getScriptProperties();
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return resposta({ ok: false, error: "json" });
  }
  if (!body || body.secret !== props.getProperty("SECRET")) return resposta({ ok: false, error: "auth" });

  var l = body.lead || {};
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA_LEADS);
    var agora = new Date();
    var dataHora = Utilities.formatDate(agora, FUSO, "dd/MM/yyyy HH:mm");

    var repetido = "NÃO";
    var ultima = sheet.getLastRow();
    if (ultima > 1 && l.whatsapp) {
      var numeros = sheet.getRange(2, 3, ultima - 1, 1).getValues();
      for (var i = 0; i < numeros.length; i++) {
        if (String(numeros[i][0]) === String(l.whatsapp)) { repetido = "SIM"; break; }
      }
    }

    var consentimento = dataHora + " — " + (l.consentimentoTexto || "aceito no formulário");
    // appendRow SEMPRE adiciona uma linha nova no final.
    sheet.appendRow([
      dataHora, l.nome, l.whatsapp, l.loja, l.cidade, l.cargo, l.faturamento, l.erp,
      l.utm_source, l.utm_medium, l.utm_campaign, l.utm_content, consentimento, repetido,
      "Novo", "", "", "", ""
    ]);
    // Garante que o WhatsApp fique como texto (sem virar número).
    sheet.getRange(sheet.getLastRow(), 3).setNumberFormat("@").setValue(l.whatsapp);
  } finally {
    lock.releaseLock();
  }

  try {
    var para = props.getProperty("NOTIFY_EMAIL");
    if (para) {
      var zap = String(l.whatsapp || "").replace(/\D/g, "");
      MailApp.sendEmail({
        to: para,
        subject: "Novo lead Caixa Blindado: " + l.nome + " — " + l.loja + (repetido === "SIM" ? " (repetido)" : ""),
        htmlBody:
          "<p><b>" + esc(l.nome) + "</b> · " + esc(l.cargo) + "<br>" +
          esc(l.loja) + " — " + esc(l.cidade) + "<br>" +
          "Faturamento: " + esc(l.faturamento) + " · ERP: " + esc(l.erp || "—") + "<br>" +
          "Origem: " + esc(l.utm_source || "direto") + " / " + esc(l.utm_campaign || "—") + "</p>" +
          '<p><a href="https://wa.me/' + zap + '">Abrir conversa no WhatsApp</a></p>'
      });
    }
  } catch (err) {
    // Se o e-mail falhar, o lead já está salvo na planilha.
  }

  return resposta({ ok: true });
}

function esc(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
