// pages/api/reset-password.js
import cookie from 'cookie'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).send('Method Not Allowed')
  }

  const { password } = req.body
  if (!password) {
    return res.status(400).send('Password required')
  }

  // 验证身份
  const cookies = cookie.parse(req.headers.cookie || '')
  const username = cookies.oauthUsername
  const trust = parseInt(cookies.oauthTrustLevel || '0', 10)
  if (!username || trust < 3) {
    return res.status(403).send('Forbidden')
  }

  // 构建 email
  const rawDom = process.env.EMAIL_DOMAIN || 'chatgpt.org.uk'
  const domain = rawDom.startsWith('@') ? rawDom : '@' + rawDom
  const studentEmail = username.includes('@')
    ? username
    : `${username}${domain}`

  // 获取 Google Access Token
  const tokRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type:    'refresh_token'
    })
  })
  if (!tokRes.ok) {
    const errText = await tokRes.text()
    console.error('Token fetch error:', errText)
    return res.status(500).send('Failed to fetch access token')
  }
  const { access_token } = await tokRes.json()

  // 调用 Admin SDK 更新用户密码
  const updateRes = await fetch(
    `https://admin.googleapis.com/admin/directory/v1/users/${encodeURIComponent(studentEmail)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    }
  )

  if (!updateRes.ok) {
    // 尝试解析返回的 JSON 错误信息
    let message = 'Password reset failed'
    try {
      const errData = await updateRes.json()
      if (errData.error?.message) {
        message = errData.error.message
      }
    } catch (e) {
      // 无法解析 JSON，就保持默认消息
    }
    console.error('Reset password error:', message)
    return res.status(updateRes.status === 400 ? 400 : 500).send(message)
  }

  // 成功
  return res.status(200).send('OK')
}
