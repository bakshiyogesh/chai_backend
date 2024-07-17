// require('dotenv').config({path:'./env'})
// connect database always in try catch or in promises
import dotenv from "dotenv";
import connectDB from "./db/index.js";
dotenv.config({
    path:'./env'})

connectDB()
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// (async()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//     } catch (error) {
        
//         console.error("error connecting database:",error)
//     }
// })()