export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&raquo;/gi, '»')
    .replace(/&laquo;/gi, '«')
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, ' ')
    .trim()
}

export function buildReportText(title: string, contentHtml: string): string {
  const cleanTitle = title.trim()
  const cleanContent = stripHtml(contentHtml)
  return cleanContent ? `${cleanTitle}\n\n${cleanContent}` : cleanTitle
}
