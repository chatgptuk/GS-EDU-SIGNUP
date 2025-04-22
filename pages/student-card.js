// pages/student-card.js
import Head from 'next/head'
import Script from 'next/script'
import { parse } from 'cookie'

// Helper to fetch a Google user from Directory
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
    { headers:{ Authorization:`Bearer ${access_token}` } }
  )
  if (!userRes.ok) return null
  return await userRes.json()
}

export async function getServerSideProps({ req }) {
  const cookies       = parse(req.headers.cookie||'')
  const oauthUsername = cookies.oauthUsername
  const trustLevel    = parseInt(cookies.oauthTrustLevel||'0',10)

  if (!oauthUsername || trustLevel < 3) {
    return { redirect:{ destination:'/', permanent:false } }
  }

  // build studentEmail
  const rawDom = process.env.EMAIL_DOMAIN
  const domain = rawDom.startsWith('@') ? rawDom : '@'+rawDom
  const studentEmail = oauthUsername.includes('@')
    ? oauthUsername
    : `${oauthUsername}${domain}`

  // ensure user exists in Google Directory
  const googleUser = await fetchGoogleUser(studentEmail)
  if (!googleUser) {
    return { redirect:{ destination:'/register', permanent:false } }
  }

  const fullName      = `${googleUser.name.givenName} ${googleUser.name.familyName}`
  const personalEmail = googleUser.recoveryEmail || ''
  const studentId     = cookies.oauthUserId

  return {
    props: { fullName, personalEmail, studentEmail, studentId }
  }
}

export default function StudentCard({
  fullName,
  personalEmail,
  studentEmail,
  studentId
}) {
  const sid = String(studentId).padStart(6,'0')
  const avatarUrl = `https://i.pravatar.cc/150?u=${encodeURIComponent(studentEmail)}`

  return (
    <>
      <Head><title>Student ID Card - ChatGPT University</title></Head>
      <Script
        src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.JsBarcode) {
            window.JsBarcode('#barcode', sid, {
              format: 'CODE128',
              lineColor: '#000',
              width: 2,
              height: 50,
              displayValue: true
            })
          }
        }}
      />

      <div className="wrapper">
        <div className="card">
          {/* School header with logo and name */}
          <div className="school-header">
            <svg
              width="36"
              height="36"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="24" cy="24" r="22" fill="#0062cc" />
              <rect x="14" y="14" width="20" height="12" rx="2" fill="#fff" />
              <path d="M14,26 L24,36 L34,26 Z" fill="#fff" />
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
            <h1>ChatGPT University</h1>
          </div>

          <div className="card-body">
            <img src={avatarUrl} alt="Photo" className="student-photo" />
            <h3>{fullName}</h3>
            <p>Fall 2025</p>
            <p>Master of Computer Science</p>
            <p>{studentEmail}</p>
            <p><strong>Student ID:</strong> {sid}</p>
            <p className="valid-through">Valid Through: September 2028</p>
            <div className="barcode">
              <svg id="barcode" width="200" height="60"></svg>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .wrapper {
          min-height:100vh;
          display:flex;justify-content:center;align-items:center;
          background:url('https://png.pngtree.com/thumb_back/fw800/background/20231028/pngtree-stunning-isolated-wood-table-top-texture-with-exquisite-texture-image_13705698.png')
            center/cover no-repeat;
          padding:20px;
        }
        .card {
          width:400px;
          background:linear-gradient(145deg,#e6e6e6,#ffffff);
          border:1px solid #ccc;border-radius:10px;
          box-shadow:0 12px 32px rgba(0,0,0,0.2);overflow:hidden;
        }
        .school-header {
          display:flex;align-items:center;gap:8px;
          background:linear-gradient(to right,#0062cc,#0096ff);
          padding:12px 16px;
        }
        .school-header h1 {
          margin:0;
          font-size:20px;
          color:#fff;
        }
        .card-body {
          background:#fff;padding:20px;text-align:center;
        }
        .student-photo {
          width:100px;height:100px;object-fit:cover;
          border:3px solid #007bff;border-radius:50%;
          box-shadow:0 4px 12px rgba(0,0,0,0.3);margin-bottom:12px;
        }
        h3 {
          margin:8px 0;font-size:20px;color:#333;
        }
        p {
          margin:6px 0;font-size:16px;color:#555;
        }
        .valid-through {
          margin-top:12px;font-weight:bold;color:#444;
        }
        .barcode {
          margin-top:20px;
        }
      `}</style>
    </>
  )
}
