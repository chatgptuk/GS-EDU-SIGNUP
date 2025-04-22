// pages/student-portal.js
import Head from 'next/head'
import { parse } from 'cookie'

// Constants for semester & program
const SEMESTER = 'Fall 2025'
const PROGRAM  = 'Master of Computer Science'

// Helper to refresh token & fetch user from Google Directory
async function fetchGoogleUser(email) {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type':'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type:    'refresh_token'
    })
  })
  if (!tokenRes.ok) return null
  const { access_token } = await tokenRes.json()
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

  // Must be OAuth2’d and trust_level ≥ 3
  if (!oauthUsername || trustLevel < 3) {
    return { redirect: { destination: '/', permanent: false } }
  }

  // Build the student’s email
  const rawDom = process.env.EMAIL_DOMAIN
  const domain = rawDom.startsWith('@') ? rawDom : '@' + rawDom
  const studentEmail = oauthUsername.includes('@')
    ? oauthUsername
    : `${oauthUsername}${domain}`

  // Fetch the Google user – if missing, send them back to register
  const googleUser = await fetchGoogleUser(studentEmail)
  if (!googleUser) {
    return { redirect: { destination: '/register', permanent: false } }
  }

  // Pull name & recoveryEmail from Google
  const fullName      = `${googleUser.name.givenName} ${googleUser.name.familyName}`
  const personalEmail = googleUser.recoveryEmail || ''
  const studentId     = cookies.oauthUserId

  return {
    props: {
      fullName,
      personalEmail,
      studentEmail,
      studentId
    }
  }
}

export default function StudentPortal({
  fullName,
  personalEmail,
  studentEmail,
  studentId
}) {
  // Pad the forum ID to 6 digits
  const sid = String(studentId).padStart(6, '0')

  // Links
  const gmailLink =
    `https://accounts.google.com/ServiceLogin?Email=${encodeURIComponent(studentEmail)}` +
    `&continue=https://mail.google.com/mail`
  const canvaLink = 'https://www.canva.com/login'
  const adobeLink = `https://accounts.adobe.com/`

  // Delete handler
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your account?')) return
    const res = await fetch('/api/delete-account', { method: 'POST' })
    if (res.ok) {
      window.location.href = '/'
    } else {
      alert('Failed to delete account.')
    }
  }

  return (
    <>
      <Head><title>Student Portal</title></Head>

      <div className="container">
        {/* School logo & heading */}
        <div className="school-header">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer circle */}
            <circle cx="24" cy="24" r="22" fill="#0062cc" />
            {/* Stylized book shape */}
            <rect x="14" y="14" width="20" height="12" rx="2" fill="#fff" />
            <path d="M14,26 L24,36 L34,26 Z" fill="#fff" />
            {/* “CU” text */}
            <text
              x="24"
              y="22"
              textAnchor="middle"
              fontSize="12"
              fontFamily="Arial, sans-serif"
              fill="#0062cc"
            >
              CU
            </text>
          </svg>
          <div className="school-text">
            <h1>ChatGPT University</h1>
            <h2>Student Portal</h2>
          </div>
        </div>

        {/* Profile info */}
        <div className="info">
          <p><strong>Name:</strong> {fullName}</p>
          <p><strong>Semester:</strong> {SEMESTER}</p>
          <p><strong>Program:</strong> {PROGRAM}</p>
          <p><strong>Student Email:</strong> {studentEmail}</p>
          <p><strong>Personal Email:</strong> {personalEmail}</p>
          <p><strong>Student ID:</strong> {sid}</p>
        </div>

        {/* Tiles */}
        <div className="grid">
          {/* Student Email opens in new tab */}
          <a
            href={gmailLink}
            className="grid-item"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://www.gstatic.com/images/branding/product/1x/gmail_48dp.png"
              alt="Student Email"
            />
            <p>Student Email</p>
          </a>

          {/* e‑Student Card stays in same tab */}
          <a href="/student-card" className="grid-item">
            <div className="card-icon">🎓</div>
            <p>e‑Student Card</p>
          </a>

          {/* Adobe Express opens in new tab */}
          <a
            href={adobeLink}
            className="grid-item"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Adobe_Express_logo_RGB_1024px.png/500px-Adobe_Express_logo_RGB_1024px.png"
              alt="Adobe Express"
            />
            <p>Adobe Express</p>
          </a>

          <div className="grid-item empty" />

          {/* Canva opens in new tab */}
          <a
            href={canvaLink}
            className="grid-item"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://static.canva.com/web/images/8439b51bb7a19f6e65ce1064bc37c197.svg"
              alt="Canva"
            />
            <p>Canva</p>
          </a>

          {/* Add Email Aliases stays in same tab */}
          <a href="/aliases" className="grid-item">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="24" cy="24" r="22" fill="#28a745" />
              <line x1="24" y1="14" x2="24" y2="34" stroke="#fff" strokeWidth="4" />
              <line x1="14" y1="24" x2="34" y2="24" stroke="#fff" strokeWidth="4" />
            </svg>
            <p>Add Email Aliases</p>
          </a>
          <a href="/reset-password" className="grid-item">
            <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="24" r="8" fill="#ffc107" />
              <rect x="18" y="20" width="20" height="8" fill="#ffc107" />
              <rect x="34" y="20" width="4" height="4" fill="#fff" />
              <rect x="38" y="20" width="4" height="4" fill="#fff" />
            </svg>
            <p>Reset Password</p>
          </a>
          <div className="grid-item empty" />
        </div>

        {/* Delete My Account button */}
        <button className="delete-button" onClick={handleDelete}>
          Delete My Account
        </button>

        <footer>
          Powered by{' '}
          <a href="https://www.chatgpt.org.uk/" target="_blank" rel="noopener">
            chatgpt.org.uk
          </a>
        </footer>
      </div>

      <style jsx>{`
        .container {
          max-width: 900px;
          margin: 40px auto;
          padding: 0 20px;
        }
        .school-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .school-text h1 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }
        .school-text h2 {
          margin: 0;
          font-size: 18px;
          color: #555;
        }
        .info {
          background: #f7f7f7;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .info p {
          margin: 6px 0;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
        }
        .grid-item {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 24px 12px;
          text-align: center;
          transition: transform 0.1s, box-shadow 0.1s;
          text-decoration: none;
          color: inherit;
        }
        .grid-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .grid-item img {
          width: 48px;
          height: 48px;
          margin-bottom: 8px;
          object-fit: contain;
        }
        .card-icon {
          font-size: 48px;
          margin-bottom: 8px;
        }
        .empty {
          visibility: hidden;
        }
        .delete-button {
          display: block;
          margin: 30px auto 0;
          padding: 10px 20px;
          background: #dc3545;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
        }
        .delete-button:hover {
          background: #c82333;
        }
        footer {
          margin-top: 40px;
          text-align: center;
          color: #777;
          font-size: 14px;
        }
        footer a {
          color: #0070f3;
          text-decoration: none;
        }
        footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  )
}
