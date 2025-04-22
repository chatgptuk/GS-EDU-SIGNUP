import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head><title>ChatGPT University</title></Head>
      <div className="container">
        <div className="card">
          <h1>Welcome to ChatGPT University</h1>
          <p>Please authenticate via Linux.do to continue:</p>
          <a className="button" href="/api/oauth2/initiate">
            Sign in with Linux.do
          </a>
          <div className="cta">
            <p>If this platform helps you, please give me a 👍 and follow me!</p>
            <p>Your support keeps me improving.</p>
          </div>
        </div>
        <footer>
          Powered by{' '}
          <a href="https://www.chatgpt.org.uk/" target="_blank" rel="noopener noreferrer">
            chatgpt.org.uk
          </a>
        </footer>
      </div>
      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          background: linear-gradient(135deg, #f0f4f8, #d9e2ec);
          padding: 20px;
        }
        .card {
          background: #fff;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 480px; width: 100%;
        }
        h1 { color: #333; margin-bottom: 20px; }
        p { color: #555; margin: 10px 0; }
        .button {
          display: inline-block; margin-top: 20px;
          padding: 12px 24px; background: #0070f3;
          color: #fff; border-radius: 6px;
          text-decoration: none; font-size: 18px;
          transition: background 0.3s;
        }
        .button:hover { background: #005bb5; }
        .cta { margin-top: 30px; color: #444; font-size: 16px; }
        footer {
          margin-top: 40px; color: #777; font-size: 14px;
        }
        footer a { color: #0070f3; text-decoration: none; }
        footer a:hover { text-decoration: underline; }
      `}</style>
    </>
  )
}
