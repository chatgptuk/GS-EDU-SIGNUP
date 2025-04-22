import cookie from 'cookie'

export default async function handler(req, res) {
  const { code, state } = req.query
  const cookies = cookie.parse(req.headers.cookie || '')
  if (cookies.oauthState !== state) {
    return res.status(400).send('Invalid state')
  }

  // 获取 OAuth2 Token
  const tokenRes = await fetch(process.env.TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  process.env.OAUTH_REDIRECT_URI,
      client_id:     process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    })
  })
  if (!tokenRes.ok) return res.status(500).send('Token error')
  const { access_token } = await tokenRes.json()

  // 获取用户信息
  const userRes = await fetch(process.env.USER_ENDPOINT, {
    headers: { Authorization: `Bearer ${access_token}` }
  })
  if (!userRes.ok) return res.status(500).send('User info error')
  const { id, username, trust_level } = await userRes.json()

  // 写入 OAuth Cookie
  res.setHeader('Set-Cookie', [
    cookie.serialize('oauthUsername',   username,            { path:'/', httpOnly:true, secure:true, sameSite:'lax' }),
    cookie.serialize('oauthUserId',     String(id),         { path:'/', httpOnly:true, secure:true, sameSite:'lax' }),
    cookie.serialize('oauthTrustLevel', String(trust_level), { path:'/', httpOnly:true, secure:true, sameSite:'lax' }),
  ])

  res.redirect('/register')
}
