import { connect } from "mongoose";

const connectDB=async()=>{
    try{
        await connect(process.env.MONGO_URL);
        console.log("MongoDB Connected");
    } catch(err){
        console.error("MongoDB error:",err.message);
        process.exit(1);
    }
};

export default connectDB;