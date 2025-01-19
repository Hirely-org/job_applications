const express = require('express');
const cors = require('cors');
const db = require('./models');

const app = express();
const port = 5004;

const jobApplicationRouter = require('./routers/jobApplicationRouter');

const corsOptions = {
    origin: 'http://localhost:3000', // Allow frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Set to false if you don't need cookies/auth headers
};

app.use(cors(corsOptions)); // Apply CORS settings
app.options('*', cors(corsOptions)); // Handle preflight
app.use(express.json());
app.use("/jobApplication", jobApplicationRouter);

(async () => {
    try {
        // Sync the database and start the Express server
        await db.sequelize.sync();
        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`);
        });
    } catch (error) {
        console.error("Error during setup:", error);
        process.exit(1);
    }
})();
