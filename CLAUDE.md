# WebChat.ai - Claude Code Build Instructions

## 🎯 PROJECT OVERVIEW

**What we're building:** AI website builder (like Wix but chat-based)  
**Tech stack:** React + TypeScript + Node.js + PostgreSQL  
**Target:** Non-technical users (50+ year olds, small businesses)  
**Your role:** Execute 18 development prompts in sequence

## 📋 PREREQUISITES

Before starting, ensure you have:

```bash
# Required installations
- Node.js 20+
- PostgreSQL (via Supabase account)
- Docker & Docker Compose
- Git
- Claude Code CLI tool

# Verify installations
node --version  # Should be 20+
docker --version
git --version
```

## 🚀 INITIAL SETUP

### Step 1: Create Project Structure

```bash
# Create root directory
mkdir webchat-ai
cd webchat-ai

# Initialize Git
git init
git branch -M main

# Create folder structure
mkdir -p frontend backend hosting docs
```

### Step 2: Initialize Frontend

```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install

# Install core dependencies
npm install react-router-dom zustand axios @tanstack/react-query
npm install tailwindcss postcss autoprefixer
npm install @radix-ui/react-dialog @radix-ui/react-tooltip
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install monaco-editor @monaco-editor/react

# Initialize Tailwind
npx tailwindcss init -p
```

### Step 3: Initialize Backend

```bash
cd ../backend
npm init -y

# Install core dependencies
npm install express cors helmet
npm install bcryptjs jsonwebtoken zod
npm install @supabase/supabase-js
npm install nodemailer
npm install openai @google/generative-ai
npm install stripe
npm install archiver ftp
npm install ioredis express-rate-limit
npm install dotenv

# Install dev dependencies
npm install --save-dev typescript @types/node @types/express
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
npm install --save-dev @types/cors @types/nodemailer
npm install --save-dev tsx nodemon
npm install --save-dev jest @types/jest ts-jest supertest

# Initialize TypeScript
npx tsc --init
```

### Step 4: Create Environment Files

```bash
# Backend .env
cat > backend/.env << 'EOF'
NODE_ENV=development
PORT=4000

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=generate-a-super-secret-256-bit-key-here
JWT_EXPIRES_IN=1d

# AI APIs
OPENAI_API_KEY=sk-your-openai-key
GEMINI_API_KEY=AIza-your-gemini-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PUBLIC_KEY=pk_test_your-public-key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@webchat.cz
SMTP_PASS=your-app-specific-password

# Encryption
ENCRYPTION_KEY=generate-32-byte-hex-key-for-aes-256

# URLs
FRONTEND_URL=http://localhost:5173
API_URL=http://localhost:4000

# Hosting
CADDY_DOMAIN=*.webchat.cz
SSL_EMAIL=admin@webchat.cz
EOF

# Frontend .env
cat > frontend/.env << 'EOF'
VITE_API_URL=http://localhost:4000
VITE_STRIPE_PUBLIC_KEY=pk_test_your-public-key
EOF
```

### Step 5: Setup Supabase Database

1. Go to https://supabase.com
2. Create new project
3. Run the SQL migrations from `backend/src/db/migrations/`
4. Enable Row Level Security on all tables
5. Get your API keys from Settings > API

## 🏗️ BUILD SEQUENCE

Execute prompts in this exact order. Each prompt is self-contained.

### Phase 1: Foundation (Week 1-3)

```bash
# PROMPT 1.3: Authentication System
# Creates: auth.service.ts, auth.controller.ts, auth.routes.ts
# Time: 3-4 hours

# PROMPT 1.4: UI Component Library
# Creates: Button, Input, Modal, Toast, Spinner, Badge, etc.
# Time: 2-3 hours

# PROMPT 2.1: Chat Interface
# Creates: ChatPanel, MessageList, Message, MessageInput
# Time: 4-5 hours

# PROMPT 2.2: Canvas Preview Panel
# Creates: PreviewFrame, CodeEditor, DeviceToggle
# Time: 3-4 hours

# PROMPT 2.3: OpenAI Integration
# Creates: openai.service.ts - conversational AI
# Time: 2-3 hours

# PROMPT 2.4: Gemini Code Generation
# Creates: gemini.service.ts - generates HTML/CSS/JS
# Time: 3-4 hours

# PROMPT 2.5: Frontend-Backend Integration
# Creates: useChat, useWebsite hooks, API client
# Time: 2-3 hours

# PROMPT 2.6: Project Management
# Creates: Dashboard, ProjectList, ProjectCard
# Time: 3-4 hours
```

### Phase 2: Monetization (Week 4-6)

```bash
# PROMPT 3.1: Stripe Payment
# Creates: stripe.service.ts, payment.controller.ts
# Time: 4-5 hours

# PROMPT 3.2: ZIP Download
# Creates: zip.service.ts, file generation
# Time: 2-3 hours

# PROMPT 4.1: Admin Panel Template
# Creates: admin.html, cms-loader.js
# Time: 3-4 hours

# PROMPT 5.1: Subdomain Hosting
# Creates: Caddy setup, deployment scripts
# Time: 4-5 hours

# PROMPT 5.2: Wedos FTP Integration
# Creates: ftp.service.ts, hosting integration
# Time: 3-4 hours
```

### Phase 3: Polish (Week 7-12)

```bash
# PROMPT 6.1: Version History
# Creates: Version management, restore functionality
# Time: 3-4 hours

# PROMPT 6.2: Website Templates
# Creates: 10 pre-built templates, gallery UI
# Time: 6-8 hours

# PROMPT 6.3: Image Management
# Creates: S3 upload, optimization, Unsplash API
# Time: 4-5 hours

# PROMPT 12.3: Deployment
# Creates: Docker setup, GitHub Actions CI/CD
# Time: 5-6 hours

# PROMPT 12.4: Production Checklist
# Creates: Security audit, performance optimization
# Time: 4-6 hours
```

## 💡 CLAUDE CODE USAGE TIPS

### How to Execute Each Prompt

```bash
# Method 1: Paste prompt directly into Claude Code
claude

# Then paste the full prompt text
# Claude Code will read the prompt and execute all steps

# Method 2: Save prompt as markdown file
cat > prompt-1.3.md << 'EOF'
[paste full prompt here]
EOF

# Then reference it
claude "Follow the instructions in prompt-1.3.md"
```

### Best Practices

1. **One prompt at a time**: Complete each prompt fully before moving to next
2. **Test after each prompt**: Run the code, check for errors
3. **Commit frequently**: `git add . && git commit -m "Completed PROMPT X.X"`
4. **Read error messages**: Claude Code will show errors, fix them before continuing
5. **Check file structure**: Ensure files are created in correct directories

### Common Commands

```bash
# Start frontend dev server
cd frontend && npm run dev

# Start backend dev server
cd backend && npm run dev

# Run tests
cd backend && npm test

# Build for production
cd frontend && npm run build
cd backend && npm run build

# Run database migrations
cd backend && npm run migrate

# Lint code
npm run lint
```

## 🐛 TROUBLESHOOTING

### Issue: "Module not found"
**Solution:** Run `npm install` in the appropriate directory

### Issue: "Port already in use"
**Solution:** Kill the process or change port in .env

### Issue: Database connection failed
**Solution:** Check SUPABASE_URL and SUPABASE_KEY in .env

### Issue: AI API rate limit
**Solution:** Check API key, add delays between requests

### Issue: Stripe webhook not working locally
**Solution:** Use Stripe CLI: `stripe listen --forward-to localhost:4000/api/v1/payment/webhook`

## 📊 PROGRESS TRACKING

Create a checklist in your project:

```markdown
# WebChat.ai Build Progress

## Phase 1: MVP ✅
- [ ] 1.3 Authentication System
- [ ] 1.4 UI Component Library
- [ ] 2.1 Chat Interface
- [ ] 2.2 Canvas Preview Panel
- [ ] 2.3 OpenAI Integration
- [ ] 2.4 Gemini Code Generation
- [ ] 2.5 Frontend-Backend Integration
- [ ] 2.6 Project Management

## Phase 2: Monetization 🚧
- [ ] 3.1 Stripe Payment
- [ ] 3.2 ZIP Download
- [ ] 4.1 Admin Panel Template
- [ ] 5.1 Subdomain Hosting
- [ ] 5.2 Wedos FTP Integration

## Phase 3: Polish ⏳
- [ ] 6.1 Version History
- [ ] 6.2 Website Templates
- [ ] 6.3 Image Management
- [ ] 12.3 Deployment
- [ ] 12.4 Production Checklist
```

## 🎯 SUCCESS CRITERIA

After completing all prompts, you should have:

✅ Working authentication system  
✅ Chat interface that talks to OpenAI  
✅ AI generates websites with Gemini  
✅ Live preview in iframe  
✅ Payment system with Stripe  
✅ ZIP download functionality  
✅ Subdomain hosting with Caddy  
✅ Admin panel for users  
✅ 10+ website templates  
✅ Production-ready deployment  

## 🚀 DEPLOYMENT

Once all prompts are complete:

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check health
curl http://localhost:4000/health
curl http://localhost:5173

# View logs
docker-compose logs -f
```

## 📞 GETTING HELP

If you get stuck:

1. Re-read the prompt carefully
2. Check the TROUBLESHOOTING section in each prompt
3. Review error messages
4. Ask Claude Code to explain the error
5. Check the docs/ folder for additional context

## 🎉 FINAL NOTES

- **Estimated total time:** 60-80 hours of focused development
- **Complexity:** Intermediate to Advanced
- **Skills learned:** Full-stack development, AI integration, payment systems, DevOps
- **Result:** Production-ready SaaS application

Now go build something amazing! 🚀🔥