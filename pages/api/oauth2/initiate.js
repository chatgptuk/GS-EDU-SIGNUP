import { v4 as uuidv4 } from 'uuid'

export default function handler(req, res) {
  const state = uuidv4()
  res.setHeader('Set-Cookie', `oauthState=${state}; Path=/; HttpOnly; Secure; SameSite=Lax`)
  const redirectUri = encodeURIComponent(process.env.OAUTH_REDIRECT_URI)
  const authUrl =
    `${process.env.AUTHORIZATION_ENDPOINT}` +
    `?client_id=${process.env.CLIENT_ID}` +
    `&response_type=code` +
    `&redirect_uri=${redirectUri}` +
    `&state=${state}`
  res.redirect(authUrl)
}
