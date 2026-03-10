import React from 'react'
import './global.css'
import Footer from '@/components/Footer'
import Header from '@/components/Header'

export const metadata = {
  description: 'Os Båtklubb sin hjemmeside',
  title: 'Os Båtklubb',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body className="bg-background">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
