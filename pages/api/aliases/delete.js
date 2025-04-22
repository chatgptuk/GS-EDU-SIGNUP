// pages/api/aliases/delete.js
import cookie from 'cookie'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow','POST')
    return res.status(405).end('Method Not Allowed')
  }
  const { alias } = req.body
  if (!alias) return res.status(400).end('Alias required')

  const cookies  = cookie.parse(req.headers.cookie||'')
  const username = cookies.oauthUsername
  const trust    = parseInt(cookies.oauthTrustLevel||'0',10)
  if (!username||trust<3) return res.status(403).end('Forbidden')

  // 获取 Access Token
  const tokRes = await fetch('https://oauth2.googleapis.com/token',{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type:    'refresh_token'
    })
  })
  if (!tokRes.ok) return res.status(500).end('Token error')
  const { access_token } = await tokRes.json()

  // 删除别名
  const email = username.includes('@')
    ? username
    : `${username}@${(process.env.EMAIL_DOMAIN||'chatgpt.org.uk').replace(/^@/,'')}`

  const delRes = await fetch(
    `https://admin.googleapis.com/admin/directory/v1/users/${encodeURIComponent(email)}/aliases/${encodeURIComponent(alias)}`,
    { method:'DELETE', headers:{ Authorization:`Bearer ${access_token}` } }
  )
  if (!delRes.ok) {
    const text = await delRes.text()
    return res.status(500).end(text)
  }
  res.status(200).end('OK')
}
