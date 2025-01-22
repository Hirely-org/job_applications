const express = require('express');
const cors = require('cors');
const db = require('./models');
const jobApplicationDeletionService = require('./jobApplicationDeletionService');


const app = express();
const port = 5004;

const jobApplicationRouter = require('./routers/jobApplicationRouter');

app.use(cors()); // Apply CORS settings
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/jobApplication", jobApplicationRouter);

(async () => {
    try {
        // Initialize deletion servicee
        await jobApplicationDeletionService.initialize();

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
