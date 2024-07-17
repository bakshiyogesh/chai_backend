// require('dotenv').config({path:'./env'})
// connect database always in try catch or in promises
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
    path:'./env'})

connectDB().then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log('server is listenning at port:',process.env.PORT);
    });
}).catch((err)=>{
    console.log('error connection failed !!',err)
})
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// (async()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//     } catch (error) {
        
//         console.error("error connecting database:",error)
//     }
// })()