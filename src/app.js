import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// import cluster from 'cluster';
// import os from 'os';
const app = express();
// const totalsCpu=os.cpus().length;
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.use(express.static("public"));

app.use(cookieParser());

// app.set("views engine","ejs"); templates eg for server side rendering
// app.set("views",path.resolve("./views"))

// clusters used for balancing the server load across same type servers.
//  if (cluster.isPrimary) {
//     for (let index = 0; index < totalsCpu; index++) {

//         cluster.fork();
//     }

//  }else{
//     const app= express();
//  }

//routes

import userRouter from "./routes/user.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter);
export { app };
