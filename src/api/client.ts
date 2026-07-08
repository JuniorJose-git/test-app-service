// API client for the Function App. Auth flow:
// Easy Auth on this App Service logs the user in with Entra ID and stores an
// access token for the Function App's API. We read it from /.auth/me and send
// it as a Bearer header. Locally (no Easy Auth) requests go out without a token.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

type AuthMeEntry = {
  access_token: string
  expires_on: string
}

let cached: AuthMeEntry | null = null

function isUsable(entry: AuthMeEntry | null): entry is AuthMeEntry {
  // treat tokens within a minute of expiry as expired
  return !!entry && new Date(entry.expires_on).getTime() > Date.now() + 60_000
}

async function fetchAuthMe(): Promise<AuthMeEntry | null> {
  const res = await fetch('/.auth/me')
  if (!res.ok) return null
  const entries: AuthMeEntry[] = await res.json()
  return entries[0] ?? null
}

export async function getAccessToken(): Promise<string | null> {
  if (!isUsable(cached)) {
    cached = await fetchAuthMe()
    if (cached && !isUsable(cached)) {
      // stored token expired — Easy Auth renews it with the refresh token
      // (requires offline_access in the login scopes)
      await fetch('/.auth/refresh')
      cached = await fetchAuthMe()
    }
  }
  return cached?.access_token ?? null
}

export async function callApi(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken()
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(`${API_BASE_URL}${path}`, { ...init, headers })
}
