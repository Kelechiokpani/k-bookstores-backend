require("dotenv").config();
const express = require('express');
const cors = require('cors');
const morgan = require("morgan");
const cookieParser=require("cookie-parser")

// Route Imports
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const cartRoutes = require("./routes/cart");
const brandRoutes = require("./routes/brand");
const categoryRoutes = require("./routes/category");
const addressRoutes = require('./routes/address');
const reviewRoutes = require("./routes/review");
const wishlistRoutes = require("./routes/wishlist");

const { connectToDB } = require("./database/db");


// Server Initialization
const server = express();
const PORT = process.env.PORT || 8000;


// Database Connection
connectToDB().then(r => {});

const allowedOrigins = [
    'https://k-bookstore.vercel.app',
    'http://localhost:3000',
    process.env.LIVE_ORIGIN,
    process.env.ORIGIN
].filter(Boolean);

server.use(cors({
    origin: (origin, callback) => {
        // 1. Allow server-to-server or tools like Postman (no origin)
        if (!origin) return callback(null, true);

        // 2. Check if the origin is in our allowed list
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`CORS Error: Origin ${origin} not allowed`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Total-Count'],
    exposedHeaders: ['X-Total-Count']
}));


// server.use(cors({
//     origin: process.env.ORIGIN || process.env.LIVE_ORIGIN || 'http://localhost:3000' || 'https://k-bookstore.vercel.app',
//     credentials: true,
//     exposedHeaders: ['X-Total-Count'],
//     methods: ['GET', 'POST', 'PATCH', 'DELETE']
// }));


server.use(express.json());
server.use(cookieParser());

// Logging: use 'dev' for more detail in development, 'tiny' for production
server.use(morgan(process.env.NODE_ENV === 'production' ? "combined" : "dev"));


// API Routes
server.use("/auth", authRoutes);
server.use("/products", productRoutes);
server.use("/orders", orderRoutes);
server.use("/cart", cartRoutes);
server.use("/wishlist", wishlistRoutes);

server.use("/brands", brandRoutes);
server.use("/categories", categoryRoutes);
server.use("/address", addressRoutes);
server.use("/reviews", reviewRoutes);




// Base Health Check
server.get("/", (req, res) => {
    res.status(200).json({ status: 'running', timestamp: new Date() });
});


// Global Error Handler (Crucial for a clean API)
server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});


// Server Start
server.listen(PORT, () => {
    console.log(`✅ server [STARTED] ~ http://localhost:${PORT}`);
});

