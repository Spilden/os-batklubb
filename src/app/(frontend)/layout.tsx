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
      <body className="bg-background flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
