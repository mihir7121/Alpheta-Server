import dotenv from 'dotenv'
import mongoose from "mongoose";
dotenv.config()

const connection = mongoose.createConnection(process.env.MONGO_URI, {
  user: process.env.MONGO_USER,
  pass: process.env.MONGO_PASS
}, async (data) => {
  console.log('Connected to database')
})

export default connection;