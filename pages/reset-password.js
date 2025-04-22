// pages/reset-password.js
import Head from 'next/head'
import { parse } from 'cookie'
import { useState } from 'react'

async function fetchGoogleToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type:    'refresh_token'
    })
  })
  if (!res.ok) return null
  const { access_token } = await res.json()
  return access_token
}

export async function getServerSideProps({ req }) {
  const cookies       = parse(req.headers.cookie||'')
  const oauthUsername = cookies.oauthUsername
  const trustLevel    = parseInt(cookies.oauthTrustLevel||'0',10)
  if (!oauthUsername||trustLevel<3) {
    return { redirect:{ destination:'/', permanent:false } }
  }
  const rawDom = process.env.EMAIL_DOMAIN||'chatgpt.org.uk'
  const domain = rawDom.startsWith('@')?rawDom: '@'+rawDom
  const studentEmail = oauthUsername.includes('@')?oauthUsername:`${oauthUsername}${domain}`
  // 确保用户存在
  const token = await fetchGoogleToken()
  let exists = false
  if (token) {
    const res = await fetch(
      `https://admin.googleapis.com/admin/directory/v1/users/${encodeURIComponent(studentEmail)}`,
      { headers:{ Authorization:`Bearer ${token}`} }
    )
    exists = res.ok
  }
  if (!exists) {
    return { redirect:{ destination:'/register', permanent:false } }
  }
  return { props:{ studentEmail } }
}

export default function ResetPassword({ studentEmail }) {
  const [pwd, setPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const handleSubmit = async e => {
    e.preventDefault()
    if (!pwd) return alert('Please enter a new password.')
    if (pwd !== confirm) return alert('Passwords do not match.')
    const res = await fetch('/api/reset-password', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ password: pwd })
    })
    if (res.ok) {
      alert('Password reset successful!')
      window.location.href = '/student-portal'
    } else {
      const text = await res.text()
      alert('Reset failed: '+text)
    }
  }

  return (
    <>
      <Head><title>Reset Password</title></Head>
      <div className="container">
        <h1>Reset Your Google Workspace Password</h1>
        <p>Your account: <strong>{studentEmail}</strong></p>
        <form onSubmit={handleSubmit}>
          <label>New Password:</label>
          <input
            type="password"
            value={pwd}
            onChange={e=>setPwd(e.target.value)}
            required
          />
          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirm}
            onChange={e=>setConfirm(e.target.value)}
            required
          />
          <button type="submit">Reset Password</button>
        </form>
        <p style={{textAlign:'center',marginTop:20}}>
          <a href="/student-portal">← Back to Portal</a>
        </p>
      </div>
      <style jsx>{`
        .container { max-width:480px; margin:40px auto; padding:0 20px; }
        h1 { text-align:center; color:#333; }
        form { display:flex; flex-direction:column; gap:12px; margin-top:20px; }
        label { font-weight:bold; }
        input { padding:10px; border:1px solid #ccc; border-radius:4px; }
        button {
          padding:12px; background:#0070f3; color:#fff;
          border:none; border-radius:6px; font-size:16px; cursor:pointer;
        }
        button:hover { background:#005bb5; }
        a { color:#0070f3; text-decoration:none; }
        a:hover { text-decoration:underline; }
      `}</style>
    </>
  )
}
