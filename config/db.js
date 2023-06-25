import mongoose from 'mongoose'

const connectDB = async()=>{
    try {
        const conn =await mongoose.connect(process.env.MONGO_URL);
        console.log(`Succesfully connected to MongoDB database ${conn.connection.host}`.bgGreen.white)
    } catch (error) {
        console.log(`Error in MongoDB ${error}`.bgRed.white)
    }
}

export default connectDB;