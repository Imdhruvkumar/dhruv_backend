import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path:'./env'
})



 
connectDB()
.then(()=>{
    app.listen(procces.env.PORT || 8000,()=>{
        console.log(`server is running on port : ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGO DB connection is failed",err);
})


/*
import express from "express"
const app = express()
( async ()=>{
    try{
       await mongoose.connect(`${process.env.MOGODB_URI}/${DB_NAME}`)
       app.on("error",(error)=>{
        console.log("ERROR:",error);
        throw error
       })

       app.listen(process.env.PORT,()=>{
        console.log(`app is listenng on port ${process.env.PORT}`)
       })
    } catch (error) {
        console.error("ERROR:",error)
        throw error
    }
})()*/