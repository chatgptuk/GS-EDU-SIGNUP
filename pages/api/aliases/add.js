// pages/api/aliases/add.js
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

  // 必须以 chatgpt_ 开头
  const rawDom = process.env.EMAIL_DOMAIN
  const domain = rawDom.startsWith('@') ? rawDom.slice(1) : rawDom
  const re = new RegExp(`^chatgpt_[^@]+@${domain}$`)
  if (!re.test(alias)) {
    return res.status(400).end(`Alias must match "chatgpt_<something>@${domain}"`)
  }

  // 获取 Google Token
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

  // 要添加的用户主邮箱
  const email = username.includes('@') 
    ? username 
    : `${username}@${domain}`

  // 添加别名
  const addRes = await fetch(
    `https://admin.googleapis.com/admin/directory/v1/users/${encodeURIComponent(email)}/aliases`,
    {
      method:'POST',
      headers:{
        Authorization:`Bearer ${access_token}`,
        'Content-Type':'application/json'
      },
      body: JSON.stringify({ alias })
    }
  )
  if (!addRes.ok) {
    const text = await addRes.text()
    return res.status(500).end(text)
  }

  res.status(200).end('OK')
}
