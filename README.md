# 🌐 部署指南（Google Workspace EDU 子号自助注册）

本系统可部署在 Vercel（[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/chatgptuk/GS-EDU-SIGNUP&project-name=GSEDUSIGNUP)
）。
已接入 [linux.do](https://linux.do) 进行 OAuth 授权。

---

## 🛠️ 所需环境变量

```env
# linux.do OAuth2 配置
CLIENT_ID=YOUR_LINUX.DO_CLIENT_ID
CLIENT_SECRET=YOUR_LINUX.DO_CLIENT_SECRET
OAUTH_REDIRECT_URI=https://youdomain.com/api/oauth2/callback
AUTHORIZATION_ENDPOINT=https://connect.linux.do/oauth2/authorize
TOKEN_ENDPOINT=https://connect.linux.do/oauth2/token
USER_ENDPOINT=https://connect.linux.do/api/user

# Google Workspace 邮箱后缀
EMAIL_DOMAIN=YOUR_EMAIL_DOMAIN

# Google Admin SDK 配置
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN=YOUR_GOOGLE_REFRESH_TOKEN
```

---

## 🔐 获取 Google Admin SDK 的相关凭证

请按照以下步骤获取 `GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET` 和 `GOOGLE_REFRESH_TOKEN`。

---

### ✅ 步骤 1：创建 Google Cloud 项目并启用 Admin SDK

1. 打开 [Google Cloud Console](https://console.cloud.google.com/)。
2. 创建一个新项目或选择现有项目。
3. 启用 **Admin SDK API**：
   - 导航至 `APIs & Services > Library`
   - 搜索 **Admin SDK** 并启用它。

---

### 🔧 步骤 2：配置 OAuth 客户端 ID

1. 在 Google Cloud Console 中：
   - 导航至 `APIs & Services > Credentials`。
   - 点击 **Create Credentials > OAuth 2.0 Client ID**（或编辑已有的 OAuth ID）。在此之前可能先配置 OAuth 同意屏幕（OAuth Consent Screen）。

2. 设置重定向 URI：
   - 找到 **Authorized redirect URIs**。
   - 添加：
     ```
     https://developers.google.com/oauthplayground
     ```
   - 点击 **保存**。

---

### 🧪 步骤 3：使用 OAuth 2.0 Playground 获取 Refresh Token

1. 打开 [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)。

2. 点击右上角齿轮图标 ⚙️，启用自定义 OAuth 凭证：
   - 勾选 ✅ **Use your own OAuth credentials**
   - 填入你在 Google Cloud Console 中获取的：
     - `Client ID`
     - `Client Secret`

3. 选择作用域：
   - 在 Step 1 中展开：
     ```
     Admin SDK API > directory_v1
     ```
   - 勾选：
     ```
     https://www.googleapis.com/auth/admin.directory.user
     ```
   - 点击 **Authorize APIs** 并完成管理员账户授权。

4. 在 Step 2：
   - 点击 **Exchange authorization code for tokens**
   - 获取并复制 **Refresh Token**。



