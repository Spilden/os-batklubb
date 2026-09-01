export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

type Period = 'morgen' | 'ettermiddag' | 'kveld'

const PERIOD_KEYWORDS: Array<{ pattern: RegExp; period: Period }> = [
  { pattern: /formiddag/i, period: 'morgen' },
  { pattern: /morgen/i, period: 'morgen' },
  { pattern: /ettermiddag/i, period: 'ettermiddag' },
  { pattern: /\bdag\b/i, period: 'ettermiddag' },
  { pattern: /kveld/i, period: 'kveld' },
  { pattern: /natt/i, period: 'kveld' },
]

export function guessPeriod(title: string): Period | undefined {
  for (const { pattern, period } of PERIOD_KEYWORDS) {
    if (pattern.test(title)) return period
  }
  return undefined
}

export function buildReportText(title: string, contentHtml: string): string {
  const cleanTitle = title.trim()
  const cleanContent = stripHtml(contentHtml)
  return cleanContent ? `${cleanTitle}\n\n${cleanContent}` : cleanTitle
}
