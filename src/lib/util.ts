// Pequenas funções de apoio usadas pelos componentes.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Converte **negrito** do site.json em <strong>, com o resto do texto escapado. */
export function rich(text: string): string {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

/** Extrai o ID de um link do YouTube (watch, youtu.be, shorts ou embed). */
export function youtubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

/** Caminho de uma imagem em public/images, ou null se ainda não houver arquivo. */
export function img(arquivo: string): string | null {
  return arquivo ? `/images/${arquivo}` : null;
}
