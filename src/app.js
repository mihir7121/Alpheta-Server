import dotenv from 'dotenv'
dotenv.config()

import cors from 'cors'
import express from 'express'
import http from 'http'
import bodyParser from 'body-parser'

import './services/db.js'

import UserRouter from './routes/User.js'
import ProjectRouter from './routes/Project.js'

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 17655

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
})

app.use(cors({
  origin: 'https://alpheta-client.netlify.app/'
}));
app.use(bodyParser.json())
app.use('/user', UserRouter)
app.use('/project', ProjectRouter)

server.listen(PORT, () => {
  console.log(`Alpheta Server is listening on port http://localhost:${PORT}`)
})