import React from 'react'
import './global.css'

export const metadata = {
  description: 'Os Båtklubb sin hjemmeside',
  title: 'Os Båtklubb',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body className="bg-background">
        <main>{children}</main>
      </body>
    </html>
  )
}
