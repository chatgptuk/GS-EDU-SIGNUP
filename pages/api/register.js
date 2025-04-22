import { parse } from 'cookie'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow','POST')
    return res.status(405).end('Method Not Allowed')
  }

  const cookies       = parse(req.headers.cookie || '')
  const oauthUsername = cookies.oauthUsername
  const trustLevel    = parseInt(cookies.oauthTrustLevel||'0',10)

  if (!oauthUsername||trustLevel<3) {
    return res.status(403).end('Forbidden')
  }

  const { fullName, semester, program, personalEmail, password } = req.body
  if (!fullName||!semester||!program||!personalEmail||!password) {
    return res.status(400).end('Missing fields')
  }

  // 学生邮箱
  const rawDom = process.env.EMAIL_DOMAIN||'chatgpt.org.uk'
  const domain = rawDom.startsWith('@')?rawDom:'@'+rawDom
  const studentEmail = oauthUsername.includes('@')
    ? oauthUsername
    : `${oauthUsername}${domain}`

  // 防重复注册：询问 Google 目录
  const tokenRes = await fetch('https://oauth2.googleapis.com/token',{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type:    'refresh_token'
    })
  })
  const { access_token } = await tokenRes.json()
  const dirRes = await fetch(
    `https://admin.googleapis.com/admin/directory/v1/users/${encodeURIComponent(studentEmail)}`,
    { headers:{ Authorization:`Bearer ${access_token}` } }
  )
  if (dirRes.ok) {
    return res.status(400).end('This student is already registered')
  }

  // 拆分名字
  let [givenName,...rest] = fullName.trim().split(' ')
  const familyName = rest.join(' ')||givenName

  // 创建 G Suite 用户
  const createRes = await fetch(
    'https://admin.googleapis.com/admin/directory/v1/users',
    {
      method:'POST',
      headers:{
        Authorization:`Bearer ${access_token}`,
        'Content-Type':'application/json'
      },
      body: JSON.stringify({
        name:{givenName,familyName},
        password,
        primaryEmail: studentEmail,
        recoveryEmail: personalEmail
      })
    }
  )
  if (!createRes.ok) {
    console.error('Create user error:',await createRes.text())
    return res.status(500).end('Could not create student account')
  }

  // 完成后直奔 portal
  res.redirect(302, '/student-portal')
}
