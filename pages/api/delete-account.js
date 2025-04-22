// pages/api/delete-account.js
import cookie from 'cookie'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  // parse oauth cookies
  const cookies = cookie.parse(req.headers.cookie || '')
  const oauthUsername = cookies.oauthUsername
  const trustLevel    = parseInt(cookies.oauthTrustLevel || '0', 10)

  if (!oauthUsername || trustLevel < 3) {
    return res.status(403).end('Forbidden')
  }

  // build student email
  const rawDom = process.env.EMAIL_DOMAIN
  const domain = rawDom.startsWith('@') ? rawDom : '@' + rawDom
  const studentEmail = oauthUsername.includes('@')
    ? oauthUsername
    : `${oauthUsername}${domain}`

  // get Google access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type:    'refresh_token',
    }),
  })
  if (!tokenRes.ok) {
    console.error('Error fetching Google token:', await tokenRes.text())
    return res.status(500).end('Token Error')
  }
  const { access_token } = await tokenRes.json()

  // delete the user
  const delRes = await fetch(
    `https://admin.googleapis.com/admin/directory/v1/users/${encodeURIComponent(studentEmail)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${access_token}` },
    }
  )
  if (!delRes.ok) {
    console.error('Error deleting user:', await delRes.text())
    return res.status(500).end('Deletion Failed')
  }

  // clear cookies
  res.setHeader('Set-Cookie', [
    cookie.serialize('oauthUsername', '', { path: '/', expires: new Date(0) }),
    cookie.serialize('oauthUserId',   '', { path: '/', expires: new Date(0) }),
    cookie.serialize('oauthTrustLevel','', { path: '/', expires: new Date(0) }),
  ])

  // done
  res.status(200).json({ success: true })
}
