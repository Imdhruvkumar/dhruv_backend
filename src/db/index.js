import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async()=>{
    try {
       const connectionincstance= await mongoose.connect(`${process.env.MOGODB_URI}/${DB_NAME}`)
       console.log(`\n MongoDB connected !! DB HOST :${connectionincstance.connection.host}`);
    } catch (error) {
        console.log("ERROR:",error);
        process.exit(1)
    }
}
export default connectDB