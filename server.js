const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 
});
app.use(limiter);

// adding logger for vercel 
const localLogger = (req, res, next) => {
    try {
        if (process.env.NODE_ENV !== 'production') {
            const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
            fs.appendFileSync(path.join(__dirname, 'app.log'), logEntry);
        }
    } catch (err) {
        // ignore write errors on read-only systems
    }
    next();
};
app.use(localLogger);

// require your route files
const userRoutes = require('./routes/userRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

// use the routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/emp', employeeRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;