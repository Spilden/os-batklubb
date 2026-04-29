export const dynamic = 'force-dynamic'

import React from 'react'
import './global.css'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { Metadata } from 'next'

export const metadata: Metadata = {
  description: 'Os Båtklubb sin hjemmeside',
  title: 'Os Båtklubb',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body className="bg-background flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 max-w-[1920px] w-full mx-auto p-4">{children}</main>
        <Footer />
      </body>
    </html>
  )
}