import { useState } from 'react'
import { callApi } from './api/client'

const endpoints = ['/test', '/whoami', '/reportsAdmin']

type ApiResult = {
  endpoint: string
  status: number | null
  body: string
}

function ApiTester() {
  const [result, setResult] = useState<ApiResult | null>(null)
  const [pending, setPending] = useState<string | null>(null)

  async function callEndpoint(endpoint: string) {
    setPending(endpoint)
    try {
      const res = await callApi(endpoint)
      const text = await res.text()
      let body = text
      try {
        body = JSON.stringify(JSON.parse(text), null, 2)
      } catch {
        // not JSON, show the raw text
      }
      setResult({ endpoint, status: res.status, body })
    } catch (err) {
      setResult({ endpoint, status: null, body: String(err) })
    } finally {
      setPending(null)
    }
  }

  return (
    <section id="api-tester">
      <h2>Function App API test</h2>
      <p>
        Each button calls the Function App with the Easy Auth access token
      </p>
      <div className="endpoints">
        {endpoints.map((endpoint) => (
          <button
            key={endpoint}
            type="button"
            className="counter"
            disabled={pending !== null}
            onClick={() => callEndpoint(endpoint)}
          >
            {pending === endpoint ? 'Calling…' : `GET ${endpoint}`}
          </button>
        ))}
        <a href="/.auth/me" target="_blank" rel="noreferrer">
          View /.auth/me
        </a>
      </div>
      {result && (
        <pre className={result.status === 200 ? 'result ok' : 'result fail'}>
          {`GET ${result.endpoint} → ${result.status ?? 'network error'}\n${result.body}`}
        </pre>
      )}
    </section>
  )
}

export default ApiTester
