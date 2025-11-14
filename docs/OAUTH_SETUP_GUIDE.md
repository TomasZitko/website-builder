# OAuth Setup Guide - Google & Apple Authentication

## 🔴 CRITICAL: Current Status

**Google OAuth is NOT working** because the credentials in `.env` are placeholder values.

### Current Configuration (BROKEN):
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## ✅ How to Fix Google OAuth

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Project name suggestion: "WebChat.ai Production"

### Step 2: Enable Required APIs

1. Go to **APIs & Services** → **Library**
2. Search for and enable:
   - **Google+ API** (for user profile)
   - **Google Identity Services** (recommended)

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. If prompted, configure the OAuth consent screen first:
   - User Type: **External** (for testing) or **Internal** (for workspace)
   - App name: **WebChat.ai**
   - User support email: your email
   - Developer contact: your email
   - Scopes: Add `userinfo.email` and `userinfo.profile`
   - Test users: Add your email (if External)

4. Configure OAuth Client:
   - Application type: **Web application**
   - Name: "WebChat.ai OAuth Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (development)
     - `https://webchat.cz` (production)
   - Authorized redirect URIs:
     - `http://localhost:4000/api/v1/auth/google/callback` (development)
     - `https://api.webchat.cz/api/v1/auth/google/callback` (production)

5. Click **Create**
6. **IMPORTANT**: Copy the Client ID and Client Secret immediately

### Step 4: Update Backend Environment Variables

Edit `backend/.env`:

```env
# Replace these with your actual credentials
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789jkl
```

### Step 5: Restart Backend Server

```bash
cd backend
npm run dev
```

### Step 6: Test OAuth Flow

1. Open browser: `http://localhost:5173`
2. Click "Continue with Google"
3. Select your Google account
4. Accept permissions
5. Should redirect back and authenticate successfully

---

## 🍎 Apple OAuth Setup (Optional - Coming Soon)

Apple OAuth requires:
1. Apple Developer Account ($99/year)
2. App ID configuration in Apple Developer Portal
3. Service ID for Sign in with Apple
4. Private key for authentication

### Quick Setup:

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Create an **App ID**
3. Create a **Service ID** for "Sign in with Apple"
4. Configure redirect URIs:
   - Development: `http://localhost:4000/api/v1/auth/apple/callback`
   - Production: `https://api.webchat.cz/api/v1/auth/apple/callback`
5. Download private key
6. Update `.env`:
   ```env
   APPLE_CLIENT_ID=com.webchat.service
   APPLE_TEAM_ID=YOUR_TEAM_ID
   APPLE_KEY_ID=YOUR_KEY_ID
   APPLE_PRIVATE_KEY_PATH=./apple-key.p8
   ```

**Note**: Apple OAuth is not yet implemented in the backend. The button currently shows "Apple OAuth coming soon!" alert.

---

## 🔍 Troubleshooting

### Error: "redirect_uri_mismatch"

**Cause**: The redirect URI in your backend doesn't match Google Cloud Console configuration.

**Fix**:
1. Check `backend/src/services/oauth.service.ts` line 42:
   ```typescript
   const GOOGLE_REDIRECT_URI = process.env.API_URL + '/api/v1/auth/google/callback';
   ```
2. Verify `API_URL` in `.env` is correct:
   ```env
   API_URL=http://localhost:4000
   ```
3. Update Google Cloud Console to match EXACTLY

### Error: "invalid_client"

**Cause**: Client ID or Client Secret is incorrect.

**Fix**:
1. Re-copy credentials from Google Cloud Console
2. Ensure no extra spaces or quotes
3. Restart backend server

### Error: "access_denied"

**Cause**: User cancelled or permissions not granted.

**Fix**: This is normal if user cancels. No action needed.

### OAuth popup blocked

**Cause**: Browser blocked the popup.

**Fix**:
1. Allow popups for localhost
2. Or use redirect flow instead of popup (already implemented)

### Backend not redirecting properly

**Cause**: CORS or frontend URL misconfigured.

**Fix**:
1. Check `FRONTEND_URL` in `backend/.env`:
   ```env
   FRONTEND_URL=http://localhost:5173
   ```
2. Verify CORS settings in `backend/src/server.ts`

---

## 📊 OAuth Flow Diagram

```
User clicks "Continue with Google"
        ↓
Frontend redirects to: localhost:4000/api/v1/auth/google
        ↓
Backend redirects to: accounts.google.com/o/oauth2/v2/auth
        ↓
User selects Google account & grants permissions
        ↓
Google redirects back to: localhost:4000/api/v1/auth/google/callback?code=...
        ↓
Backend exchanges code for access token
        ↓
Backend fetches user info from Google API
        ↓
Backend creates/updates user in database
        ↓
Backend generates JWT tokens
        ↓
Backend redirects to: localhost:5173/auth/callback?token=...&refreshToken=...
        ↓
Frontend stores tokens & user data
        ↓
User is authenticated & redirected to dashboard
```

---

## ✅ Post-Setup Checklist

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 Client ID created
- [ ] Redirect URIs match backend configuration
- [ ] `.env` file updated with real credentials
- [ ] Backend server restarted
- [ ] Tested OAuth flow end-to-end
- [ ] No console errors
- [ ] User can authenticate and access dashboard

---

## 🚀 Production Deployment Notes

### Before deploying to production:

1. **Update OAuth redirect URIs** in Google Cloud Console:
   - Add production domain: `https://webchat.cz`
   - Add production API: `https://api.webchat.cz`

2. **Update environment variables** for production:
   ```env
   NODE_ENV=production
   API_URL=https://api.webchat.cz
   FRONTEND_URL=https://webchat.cz
   GOOGLE_CLIENT_ID=<production-client-id>
   GOOGLE_CLIENT_SECRET=<production-secret>
   ```

3. **Security checklist**:
   - [ ] Use environment variables (never commit credentials)
   - [ ] Enable HTTPS only in production
   - [ ] Verify OAuth consent screen is published
   - [ ] Add production domain to authorized origins
   - [ ] Test OAuth flow on production domain

4. **Monitoring**:
   - Watch for OAuth errors in logs
   - Monitor failed authentication attempts
   - Track OAuth conversion rates

---

## 📞 Support

If OAuth still doesn't work after following this guide:

1. Check backend logs for detailed error messages
2. Use browser DevTools Network tab to inspect requests
3. Verify all environment variables are loaded correctly
4. Test with a fresh incognito window
5. Consult [Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2)

---

## 🎉 Success Criteria

OAuth is working correctly when:

✅ Clicking "Continue with Google" opens Google login popup
✅ After authentication, user is redirected to dashboard
✅ User data is saved in database
✅ JWT tokens are stored in localStorage
✅ No console errors
✅ Subsequent logins work without re-authentication

