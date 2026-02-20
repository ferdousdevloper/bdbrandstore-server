const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()

const connectMongoDB = require('./config/db')
const router = require('./routes')
const webHooks = require('./controller/order/WebHook')

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}))

// 🔥 IMPORTANT: Webhook route MUST be before express.json()
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  webHooks
)

// normal body parser
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cookieParser())

app.use("/api", router)

const PORT = 8080

connectMongoDB().then(() => {
  app.get("/", (req, res) => {
    res.send("bdbrandstore server is running....")
  })

  app.listen(PORT, () => {
    console.log('Server is running....')
  })
})