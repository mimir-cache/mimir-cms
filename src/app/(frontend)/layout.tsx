import React from 'react'
import './styles.css'

export const metadata = {
  description:
    'MIMIR — Adaptive Predictive Semantic Cache Framework for Cost-Efficient LLM Applications',
  title: 'MIMIR Dashboard',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
