import dotenv from 'dotenv'
import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        
        const connectionInstace = await
        mongoose.connect(`mongodb+srv://ahmedz1dane:12345678abcd@cluster0.rfp83vi.mongodb.net/
        ${process.env.DB_NAME}`)

        console.log(`\nMongoDb connected !!`);
    } catch (error) {
        console.log("MongoDB connection error: ",error);
        process.exit(1)
    }
}

export default connectDB;