import mongoose from "mongoose";
import logger from "../utils/logger.js";
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        logger.info("MongoDB connected");
        console.log("MongoDB connected");
    } catch (error) {
        logger.error("MongoDB connection failed", error);
        console.log(error);
    }
};  

export default connectDB