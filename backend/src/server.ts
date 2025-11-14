import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { testConnection } from './db/supabase'
import authRoutes from './routes/auth.routes'
import chatRoutes from './routes/chat.routes'
import websiteRoutes from './routes/website.routes'
import paymentRoutes from './routes/payment.routes'
import { loginLimiter, registerLimiter } from './middleware/rateLimit.middleware'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://webchat.cz'
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}))
// Note: express.json() is applied globally, but payment webhook route handles its own raw body
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Apply rate limiting to specific auth routes
app.use('/api/v1/auth/login', loginLimiter)
app.use('/api/v1/auth/register', registerLimiter)

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbOk = await testConnection()
  res.json({
    status: dbOk ? 'ok' : 'error',
    database: dbOk ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
})

// Test endpoint
app.get('/api/v1/test', (req, res) => {
  res.json({
    message: 'Backend is running! ',
    version: '1.0.0'
  })
})

// Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/chat', chatRoutes)
app.use('/api/v1/websites', websiteRoutes)
app.use('/api/v1/payment', paymentRoutes)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`=� Server running on http://localhost:${PORT}`)
  console.log(`=� Environment: ${process.env.NODE_ENV}`)
  console.log(` Health check: http://localhost:${PORT}/health`)
})

// Test database connection on startup (will run when module is loaded)
testConnection().then(() => {
  console.log('Database initialization complete')
}).catch((err) => {
  console.error('Database initialization failed:', err)
})

export default app
