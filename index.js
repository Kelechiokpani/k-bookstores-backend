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

// Middlewares
server.use(cors({
    origin: process.env.ORIGIN || process.env.LIVE_ORIGIN || 'http://localhost:3000' || 'https://k-bookstore.vercel.app/books',
    credentials: true,
    exposedHeaders: ['X-Total-Count'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
}));


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

