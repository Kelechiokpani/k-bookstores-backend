require('dotenv').config();
const mongoose = require("mongoose");

exports.connectToDB = async () => {
    try {
        // 1. Connection with optimized options
        const connection = await mongoose.connect(process.env.MONGO_URI, {
            // These help prevent hang-ups and handle modern MongoDB driver logic
            autoIndex: true,
        });

        console.log(`✅ MongoDB Connected: ${connection.connection.host}`);

        // 2. Event Listeners for connection health
        mongoose.connection.on('error', (err) => {
            console.error(`❌ MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
        });

    } catch (error) {
        console.error(`❌ Connection Failed: ${error.message}`);
        // Exit process with failure if DB connection is critical for app start
        process.exit(1);
    }
};



// require('dotenv').config()
// const mongoose=require("mongoose")
//
// exports.connectToDB=async()=>{
//     try {
//         await mongoose.connect(process.env.MONGO_URI)
//         console.log('connected to DB');
//     } catch (error) {
//         console.log(error);
//     }
// }