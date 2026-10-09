import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <div className="home">
      <div className="content">
        <h1>MIMIR</h1>
        <p>Adaptive Predictive Semantic Cache Framework for Cost-Efficient LLM Applications</p>
        {user && 'email' in user ? <p>Signed in as {user.email}</p> : null}
        <div className="links">
          <a className="admin" href={payloadConfig.routes.admin} rel="noopener noreferrer">
            Open analytics dashboard
          </a>
        </div>
      </div>
      <div className="footer">
        <p>EER6689 Final Year Project — Open University of Sri Lanka, Group 9</p>
      </div>
    </div>
  )
}
