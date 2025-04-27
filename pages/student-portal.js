// --- START OF FILE student-portal.js ---

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head'; // Import Head for title and Font Awesome
import Link from 'next/link'; // Import Next.js Link for internal navigation
import axios from 'axios'; // Keep axios for API calls

// --- Helper function to format name (keep from original) ---
// Adjust this based on your actual API response format for profile.name
function formatUserName(nameData) {
  if (!nameData) return 'N/A';
  if (typeof nameData === 'string') return nameData; // If API returns a single string
  // Example: If API returns { givenName: '三', familyName: '张' }
  if (nameData.givenName && nameData.familyName) {
    // Decide order based on convention (e.g., FamilyName GivenName)
    // Assuming Chinese convention: FamilyName GivenName
    return `${nameData.familyName || ''} ${nameData.givenName || ''}`.trim();
  }
  // Fallback if nameData is an object but doesn't match expected structure
  if (typeof nameData === 'object' && nameData !== null) {
    return JSON.stringify(nameData); // Or provide a more generic fallback
  }
  return 'N/A'; // Default fallback
}


export default function StudentPortal() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // Keep loading state
  const [error, setError] = useState(null); // Keep error state

  // --- Keep useEffect for fetching profile data ---
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        // Use the same API endpoint as before
        const response = await axios.get('/api/profile');
        setProfile(response.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError('无法加载学生信息。请稍后再试或联系管理员。 (Failed to load profile data.)');
        // Optional: Redirect based on error (e.g., 401 Unauthorized)
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
           // Maybe redirect to login after a delay or provide a button
           // router.push('/');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
    // Dependency array: if profile data depends only on initial load, keep it empty
    // If it depends on something like router query, add it.
    // For now, assuming it's fetched once on component mount.
  }, []); // Changed dependency array to empty for fetching only once, adjust if needed


  // --- Keep Delete Account Handler ---
  const handleDelete = async () => {
    // Use confirm dialog as in original JS
    if (!confirm('您确定要删除您的账户吗？此操作无法撤销。\nAre you sure you want to delete your account? This action cannot be undone.')) {
        return;
    }
    try {
        // Keep the simulated logic or replace with your actual API call
        // console.log('Simulating account deletion...');
        // const response = await axios.post('/api/delete-account'); // Your actual endpoint

        alert('删除账户请求已提交（模拟）。您将被登出。\nAccount deletion request submitted (Simulated). You will be logged out.');

        // Redirect to logout endpoint (same as original)
        // Using POST via form submission below is better for logout/delete usually.
        // But if your /api/logout works with GET/redirect, this is fine.
        // Or use the form POST method from the original JS for logout button.
        router.push('/api/logout'); // Redirect to logout handler

    } catch (err) {
        console.error("Failed to delete account:", err);
        alert('尝试删除账户时发生错误。请稍后再试。\nAn error occurred while trying to delete the account. Please try again later.');
    }
  };


  // --- Render Loading State (Keep from original) ---
  if (loading) {
    // Consider a more visually appealing loader matching the new style
    return <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Nunito, sans-serif' }}>加载学生门户中... (Loading Student Portal...)</div>;
  }

  // --- Render Error State (Keep from original) ---
  if (error || !profile) {
    return (
        <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Nunito, sans-serif', color: 'red' }}>
            <p>错误 (Error): {error || '无法加载信息 (Could not load profile).'}</p>
            {/* Keep button to go back/login */}
            <button onClick={() => router.push('/')} style={{ padding: '10px 20px', cursor: 'pointer' }}>返回登录 (Go to Login)</button>
        </div>
    );
  }

  // --- Dynamically create the Gmail link (Keep from original) ---
  const gmailLink = profile.student_email
    ? `https://mail.google.com/a/${profile.student_email.split('@')[1]}?Email=${encodeURIComponent(profile.student_email)}&continue=https://mail.google.com/mail/u/${encodeURIComponent(profile.student_email)}/` // More robust G Workspace link
    : '#'; // Fallback if email is not available


  // --- Render the Portal using the new HTML structure and dynamic data ---
  return (
    <>
      <Head>
        {/* Keep Head content from original JS/HTML */}
        <title>学生门户 - 孔子学院 (Student Portal - Confucius Institute)</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />
        {/* Consider adding your favicon link here */}
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>

      {/* Use the styles from index.html */}
      <style jsx global>{`
        /* === Paste all CSS rules from the <style> tag of index.html here === */
        body {
            margin: 0;
            font-family: 'Nunito', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
            color: #333;
            line-height: 1.6;
            min-height: 100vh;
        }

        .portal-container {
            max-width: 1000px;
            margin: 20px auto;
            padding: 30px;
            background-color: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* === Header === */
        .portal-header {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid #dee2e6;
            text-align: center;
        }

        .logo {
            width: 90px; /* Use the same logo size */
            height: auto;
            margin-bottom: 15px;
        }

        .portal-header h1 {
            font-size: 26px;
            color: #2c3e50;
            margin-bottom: 5px;
            font-weight: 700;
        }
        .portal-header h2 {
            font-size: 17px;
            color: #566573;
            font-weight: 400;
        }

        /* === Card === */
        .card {
            background-color: #ffffff;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            margin-bottom: 25px;
            border: 1px solid #e9ecef;
        }

        .card h3 {
            font-size: 20px;
            color: #1a5276;
            margin: 0 0 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e0e0e0;
            font-weight: 600;
            display: flex;
            align-items: center;
        }
        .card h3 i {
            margin-right: 12px;
            font-size: 18px;
            color: #3498db;
            flex-shrink: 0;
        }

        /* === Profile Section === */
        .profile-details {
            display: grid;
            grid-template-columns: 1fr; /* Single column layout */
            gap: 15px;
            background: #f9f9f9;
            padding: 20px;
            border-radius: 10px;
            transition: all 0.3s ease;
        }
        /* Optional: Add hover effect from HTML if desired */
        .profile-details:hover {
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        .profile-details p {
            margin: 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            background: #fff;
            border-radius: 8px;
            font-size: 15px;
            color: #333;
            border: 1px solid #e9ecef;
            transition: transform 0.2s ease;
            word-break: break-word; /* Ensure long content wraps */
        }
        .profile-details p:hover { /* Optional hover effect */
            transform: translateY(-2px);
        }
        .profile-details strong {
            font-weight: 600;
            color: #2c3e50;
            margin-right: 10px; /* Add some spacing */
            flex-shrink: 0; /* Prevent label from shrinking */
        }
        .profile-details span {
            color: #555;
            font-weight: 400;
            text-align: right; /* Align value to the right */
            word-break: break-all; /* Break long emails/IDs */
        }

        /* === Actions Section === */
        .actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
        }

        .action-button {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: linear-gradient(145deg, #ffffff, #f9f9f9);
            color: #34495e;
            border: 1px solid #e0e4e8;
            border-radius: 12px;
            text-align: center;
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
            min-height: 120px; /* Use min-height instead of fixed height */
        }

        .action-button i, .action-button img {
            font-size: 28px;
            width: 28px; /* Ensure consistent icon size */
            height: 28px; /* Ensure consistent icon size */
            margin-bottom: 10px;
            color: #3498db; /* Default icon color */
            transition: all 0.3s ease;
            object-fit: contain; /* For img tag */
        }

        .action-button:hover {
            transform: translateY(-4px);
            box-shadow: 0 6px 15px rgba(52, 152, 219, 0.2);
            border-color: #aed6f1;
            background: #ffffff;
        }

        .action-button:hover i, .action-button:hover img {
            /* Keep default hover color or customize per button */
             transform: scale(1.1);
        }

        /* Specific Icon Colors & Hovers (Copied from HTML) */
        .action-button.email i { color: #e74c3c; }
        .action-button.card i { color: #2ecc71; }
        .action-button.adobe img { /* Adjust if needed */ }
        .action-button.transcript i { color: #9b59b6; }
        .action-button.canva i { color: #1abc9c; }
        .action-button.password i { color: #f1c40f; }
        .action-button.aliases i { color: #28a745; }

        /* Apply specific hover colors if desired */
        .action-button:hover.email i { color: #c0392b; }
        .action-button:hover.card i { color: #27ae60; }
        .action-button:hover.transcript i { color: #8e44ad; }
        .action-button:hover.canva i { color: #16a085; }
        .action-button:hover.password i { color: #f39c12; }
        .action-button:hover.aliases i { color: #218838; }
        .action-button:hover.adobe img { /* Add hover effect for Adobe img if needed */ }


        /* === Footer === */
        .portal-footer {
            text-align: center;
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
        }
        .footer-buttons {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            justify-content: center;
        }

        .logout-button, .delete-button {
            padding: 10px 25px;
            border-radius: 8px;
            border: none;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .logout-button i, .delete-button i {
            margin-right: 8px;
        }

        /* Logout Button Styles */
        .logout-button {
            background: linear-gradient(145deg, #e74c3c, #c0392b);
            color: white;
            box-shadow: 0 3px 8px rgba(231, 76, 60, 0.3);
        }
        .logout-button:hover {
            background: linear-gradient(145deg, #c0392b, #e74c3c);
            box-shadow: 0 5px 15px rgba(231, 76, 60, 0.4);
            transform: translateY(-2px);
        }

        /* Delete Button Styles */
        .delete-button {
            background: #6c757d;
            color: #fff;
            padding: 8px 18px; /* Adjust padding if needed */
            font-size: 14px; /* Adjust font size if needed */
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .delete-button:hover {
            background: #5a6268;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            transform: translateY(-1px);
        }

        .footer-text {
            color: #777;
            font-size: 13px;
            margin-top: 10px;
        }
        .footer-text a {
            color: #0070f3; /* Or your theme color */
            text-decoration: none;
        }
        .footer-text a:hover {
            text-decoration: underline;
        }

        /* === Responsive Adjustments (Copied from HTML) === */
        @media (min-width: 576px) {
            .portal-container {
                padding: 35px;
            }
            .portal-header h1 {
                font-size: 30px;
            }
            .portal-header h2 {
                font-size: 18px;
            }
            .card h3 {
                font-size: 22px;
            }
            .card h3 i {
                font-size: 20px;
            }
            .action-button {
                font-size: 15px;
               /* Use min-height instead of fixed height */
            }
            .action-button i, .action-button img {
                font-size: 30px;
                 width: 30px; /* Adjust size */
                 height: 30px; /* Adjust size */
            }
            .portal-footer {
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
            }
            .footer-buttons {
                order: 1;
            }
            .footer-text {
                order: 2;
                margin-top: 0;
                text-align: right;
            }
        }

        @media (min-width: 992px) {
            .portal-container {
                padding: 40px;
            }
            .actions-grid {
                gap: 25px;
            }
            .profile-details {
                gap: 20px;
            }
            .profile-details p {
                font-size: 16px;
            }
        }

      `}</style>

      {/* --- Main Content Area --- */}
      <div className="portal-container">
        {/* --- Header Section (Same as HTML) --- */}
        <header className="portal-header">
          {/* Use Next.js Image for optimization if image is local, otherwise standard img */}
          <img src="https://kzxy.edu.kg/static/themes/default/images/indexImg/logo-20th.png" alt="Confucius Institute Logo" className="logo" />
          <h1>孔子学院学生门户</h1>
          <h2>Confucius Institute Student Portal</h2>
        </header>

        {/* --- Profile Section (Inject Dynamic Data) --- */}
        <section className="profile-section card">
          <h3><i className="fas fa-user-circle"></i> 学生信息 (Student Information)</h3>
          <div className="profile-details">
            {/* Use fetched profile data with fallbacks */}
            <p><strong>姓名 (Name):</strong> <span>{formatUserName(profile.name) || 'N/A'}</span></p>
            <p><strong>学期 (Semester):</strong> <span>{profile.semester || 'N/A'}</span></p>
            <p><strong>项目 (Program):</strong> <span>{profile.program || 'N/A'}</span></p>
            <p><strong>学生邮箱 (Student Email):</strong> <span>{profile.student_email || 'N/A'}</span></p>
            {/* Conditionally render personal email if available */}
            {profile.personal_email && (
               <p><strong>个人邮箱 (Personal Email):</strong> <span>{profile.personal_email}</span></p>
            )}
            <p><strong>学生 ID (Student ID):</strong> <span>{profile.student_id || 'N/A'}</span></p>
          </div>
        </section>

        {/* --- Actions Section (Update links, keep structure) --- */}
        <section className="actions-section card">
          <h3><i className="fas fa-th-large"></i> 快速访问 (Quick Access)</h3>
          <div className="actions-grid">
            {/* Student Email (External Link using dynamic gmailLink) */}
            <a href={gmailLink} className="action-button email" target="_blank" rel="noopener noreferrer">
              <i className="fas fa-envelope"></i>
              <span>学生邮箱</span>
            </a>

            {/* e-Student Card (Internal Link using Next Link) */}
            <Link href="/student-card" legacyBehavior>
                <a className="action-button card">
                    <i className="fas fa-id-card"></i>
                    <span>电子学生卡</span>
                </a>
            </Link>

            {/* Adobe Express (External Link - UPDATED href) */}
            <a href="https://account.adobe.com/" className="action-button adobe" target="_blank" rel="noopener noreferrer">
              {/* Keep using img tag for Adobe icon as per HTML */}
              <img src="https://express.adobe.com/favicon.ico" alt="Adobe Express Icon" />
              <span>Adobe Express</span>
            </a>

             {/* Transcript (Internal Link using Next Link) */}
             <Link href="/transcript" legacyBehavior>
                <a className="action-button transcript">
                    <i className="fas fa-file-alt"></i>
                    <span>成绩单</span>
                </a>
            </Link>

            {/* Canva (External Link) */}
            <a href="https://www.canva.com/login" className="action-button canva" target="_blank" rel="noopener noreferrer">
              <i className="fas fa-palette"></i>
              <span>Canva</span>
            </a>

            {/* Reset Password (Internal Link using Next Link) */}
            <Link href="/reset-password" legacyBehavior>
                <a className="action-button password">
                    <i className="fas fa-key"></i>
                    <span>重置密码</span>
                </a>
            </Link>

             {/* Add Aliases (Internal Link using Next Link) */}
             <Link href="/aliases" legacyBehavior>
                <a className="action-button aliases">
                    <i className="fas fa-plus-circle"></i>
                    <span>添加邮箱别名</span>
                </a>
            </Link>
          </div>
        </section>

        {/* --- Footer Section (Use Form for Logout, Button for Delete) --- */}
        <footer className="portal-footer">
            <div className="footer-buttons">
                 {/* Logout Button - Use the robust POST form method from original JS */}
                <form action="/api/logout" method="POST" style={{ margin: 0, display: 'inline' }}> {/* Ensure form doesn't add extra margin */}
                    <button type="submit" className="logout-button">
                        <i className="fas fa-sign-out-alt"></i>
                        登出 (Logout)
                    </button>
                </form>

                {/* Delete Account Button - Attach onClick handler */}
                <button className="delete-button" onClick={handleDelete}>
                    <i className="fas fa-trash-alt"></i>
                    删除账户 (Delete Account)
                </button>
            </div>
            <div className="footer-text">
                孔子学院学生服务 | Confucius Institute Student Services | Powered by{' '}
                <a href="https://kzxy.edu.kg" target="_blank" rel="noopener noreferrer">
                    kzxy.edu.kg
                </a>
            </div>
        </footer>
      </div>
    </>
  );
}
// --- END OF FILE student-portal.js ---
