import Head from 'next/head'
import { parse } from 'cookie'

async function fetchGoogleUser(email) {
  // 刷新 token
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
  if (!tokenRes.ok) return null
  const { access_token } = await tokenRes.json()
  // 查询 Directory
  const userRes = await fetch(
    `https://admin.googleapis.com/admin/directory/v1/users/${encodeURIComponent(email)}`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  )
  if (!userRes.ok) return null
  return await userRes.json()
}

export async function getServerSideProps({ req }) {
  const cookies       = parse(req.headers.cookie || '')
  const oauthUsername = cookies.oauthUsername
  const trustLevel    = parseInt(cookies.oauthTrustLevel || '0', 10)

  // 必须先 OAuth2 且信任等级 ≥ 3
  if (!oauthUsername || trustLevel < 3) {
    return { redirect: { destination: '/', permanent: false } }
  }

  // 构建学生邮箱
  const rawDom = process.env.EMAIL_DOMAIN
  const domain = rawDom.startsWith('@') ? rawDom : '@' + rawDom
  const studentEmail = oauthUsername.includes('@')
    ? oauthUsername
    : `${oauthUsername}${domain}`

  // 查询 Google Directory，看用户是否已经存在
  const googleUser = await fetchGoogleUser(studentEmail)
  if (googleUser) {
    // 已存在，直接跳 student-portal
    return { redirect: { destination: '/student-portal', permanent: false } }
  }

  return { props: { oauthUsername } }
}

export default function Register({ oauthUsername }) {
  return (
    <>
      <Head><title>New Student Registration</title></Head>
      <div className="container">
        <div className="card">
          <h1>New Student Registration</h1>
          <form method="POST" action="/api/register">
            <label htmlFor="username">Username (Same as your Linux.do username, read‑only):</label>
            <input type="text" id="username" name="username"
                   value={oauthUsername} readOnly />

            <label htmlFor="fullName">Full Name:</label>
            <input type="text" id="fullName" name="fullName" required />

            <label htmlFor="semester">Semester:</label>
            <select id="semester" name="semester" required>
              <option>Fall 2025</option>
            </select>

            <label htmlFor="program">Program:</label>
            <select id="program" name="program" required>
              <option>Master of Computer Science</option>
            </select>

            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" required />

            <label htmlFor="personalEmail">Personal Email:</label>
            <input type="email" id="personalEmail" name="personalEmail" required />

            <button type="submit">Register</button>
          </form>
        </div>
        <footer>
          Powered by{' '}
          <a href="https://www.chatgpt.org.uk/" target="_blank" rel="noopener">
            chatgpt.org.uk
          </a>
        </footer>
      </div>
      <style jsx>{`
        .container {
          min-height:100vh;
          display:flex;flex-direction:column;
          justify-content:center;align-items:center;
          background:#f0f4f8;padding:20px;
        }
        .card {
          background:#fff;max-width:480px;width:100%;
          padding:40px;border-radius:10px;
          box-shadow:0 4px 12px rgba(0,0,0,0.1);
        }
        h1{text-align:center;color:#333;margin-bottom:20px;}
        label{display:block;margin:15px 0 5px;color:#555;}
        input,select{
          width:100%;padding:10px;
          border:1px solid #ccc;border-radius:6px;
          font-size:16px;
        }
        input[readOnly]{background:#eaeaea;}
        button{
          width:100%;margin-top:24px;
          padding:12px;background:#0070f3;
          color:#fff;border:none;border-radius:6px;
          font-size:18px;cursor:pointer;
        }
        button:hover{background:#005bb5;}
        footer{margin-top:30px;color:#777;font-size:14px;}
        footer a{color:#0070f3;text-decoration:none;}
        footer a:hover{text-decoration:underline;}
      `}</style>
    </>
  )
}
