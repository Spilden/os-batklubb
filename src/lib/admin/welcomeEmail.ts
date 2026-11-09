function escapeHTML(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function welcomeEmailHTML(name: string, url: string): string {
  return `
  <!doctype html>
  <html lang="no">
    <body>
      <h2>Velkommen til Os Båtklubb, ${escapeHTML(name)}!</h2>
      <p>Du har fått en bruker på medlemssidene våre. Klikk lenken under for å lage ditt eget passord:</p>
      <p><a href="${url}">${url}</a></p>
      <p>Lenken virker i 7 dager. Hvis den har gått ut, kan du bruke «Glemt passord» eller be styret sende en ny.</p>
    </body>
  </html>
  `
}
