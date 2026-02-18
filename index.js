const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const connectMongoDB = require('./config/db')
const router = require('./routes')
// const router = require('./routes/index')

const app = express()
app.use(cors({
  origin : "http://localhost:3000",
  methods :['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  credentials : true,
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser())
app.use("/api", router)

const PORT = 8080
connectMongoDB().then(() =>{
  app.get("/", (req, res) => {
  res.send("bdbrandstore server is running....");
});

  app.listen(PORT, () => {
    console.log('Server is running....')
  })
})


