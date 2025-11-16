# 🚀 Quick Start Guide - WebChat.ai

Follow these steps to get your app running in **10 minutes**!

## ✅ Step 1: Set Up Supabase Database (3 minutes)

1. **Go to Supabase**: https://supabase.com/dashboard
2. **Select your project**: `nyfpapoemzuyfapcpljz`
3. **Click "SQL Editor"** in the left sidebar
4. **Click "New Query"**
5. **Open the file**: `SETUP_DATABASE.sql` from your project folder
6. **Copy the entire content** and paste it into the SQL Editor
7. **Click "Run"** or press `Ctrl + Enter`
8. **Wait for completion** - you should see: `Database setup complete! ✅`

**That's it!** Your database is ready.

---

## ✅ Step 2: Install Dependencies (3 minutes)

Open PowerShell and navigate to your project:

```powershell
cd C:\Users\tomas_48vauln\Downloads\website-builder
```

### Install Backend:
```powershell
cd backend
npm install
```

### Install Frontend:
```powershell
cd ..\frontend
npm install
```

---

## ✅ Step 3: Verify Environment Files (1 minute)

Your `.env` files should already be set up:

**Backend** (`backend\.env`) - ✅ Already done!
**Frontend** (`frontend\.env`) - Create this:

```powershell
cd ..\frontend
notepad .env
```

Add this content:
```
VITE_API_URL=http://localhost:4000
```

Save and close.

---

## ✅ Step 4: Start the Application (2 minutes)

You need **TWO terminal windows**:

### Terminal 1 - Start Backend:
```powershell
cd C:\Users\tomas_48vauln\Downloads\website-builder\backend
npm run dev
```

**Wait for this message:**
```
🚀 Server running on http://localhost:4000
```

### Terminal 2 - Start Frontend:
```powershell
cd C:\Users\tomas_48vauln\Downloads\website-builder\frontend
npm run dev
```

**Wait for this message:**
```
➜  Local:   http://localhost:5173/
```

---

## ✅ Step 5: Open in Browser (1 minute)

1. **Open your browser**
2. **Go to**: http://localhost:5173
3. **You should see the login page!** 🎉

---

## 🎯 Test the App

### Create an Account:
1. Click "Register" or "Sign Up"
2. Enter your email and password
3. Click "Create Account"
4. You should be redirected to the dashboard!

### Build Your First Website:
1. Click "New Chat" or "Builder"
2. Type: "Create a simple landing page for a coffee shop"
3. Press Enter
4. Watch the AI build your website! ☕✨

---

## 🐛 Common Issues

### Issue: "Cannot connect to database"
**Fix**: Make sure you ran the `SETUP_DATABASE.sql` file in Supabase

### Issue: "Port 4000 already in use"
**Fix**:
```powershell
# Find and kill the process
netstat -ano | findstr :4000
taskkill /PID <process_id> /F
```

### Issue: "Module not found"
**Fix**: Run `npm install` in both backend and frontend folders

### Issue: Backend shows errors about missing API keys
**Fix**: That's OK! The app will still work. AI features just won't work until you add valid API keys.

---

## 📊 What You Should See

### Backend Terminal:
```
[SERVER] Starting WebChat.ai backend...
[DB] Supabase connected ✅
[SERVER] Routes loaded ✅
🚀 Server running on http://localhost:4000
```

### Frontend Terminal:
```
  VITE v5.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Browser:
- Login/Register page with a clean UI
- After login: Dashboard with "New Chat" button
- Click New Chat: AI chat interface
- Type a message: AI responds and builds websites!

---

## 🎉 Success Checklist

- [x] Database migrations run in Supabase
- [x] Backend dependencies installed
- [x] Frontend dependencies installed
- [x] Environment files created
- [x] Backend server running on port 4000
- [x] Frontend server running on port 5173
- [x] Can access http://localhost:5173
- [x] Can create an account
- [x] Can start chatting with AI

---

## 🚀 Next Steps

Once everything is working:

1. **Explore the chat interface** - Ask AI to build different websites
2. **Check the templates** - Pre-built designs you can customize
3. **Test the preview** - See your website live as you chat
4. **Try exporting** - Download your website as HTML/CSS/JS

---

## 📞 Need Help?

If you're stuck, check:
1. Are both servers running?
2. Did you run the database migration?
3. Are there any errors in the terminal?
4. Check browser console (F12) for errors

---

**Total setup time: ~10 minutes**

Let's build something amazing! 🚀🔥
