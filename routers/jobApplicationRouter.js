const router = require('express').Router();
const db = require('../models');

router.get('/', async (req, res) => {
    const jobApp = "jobApp";

    return res.status(200).json(jobApp);
});

router.post('/', async (req, res) => {
    const userSub = req.headers['x-forwarded-user'];

    if (!userSub) {
        return res.status(401).json({ message: 'No user sub provided in header' });
    }

    const { jobId } = req.body;

    if (!jobId) {
        return res.status(400).json({ message: 'No job ID provided' });
    }

    try {
        // Check if user has already applied to this job
        const existingApplication = await db.JobApplications.findOne({
            where: {
                user_id: userSub,
                job_id: jobId
            }
        });

        if (existingApplication) {
            return res.status(409).json({ 
                message: 'You have already applied to this job',
                application: existingApplication
            });
        }

        // Create new application
        const jobApp = await db.JobApplications.create({
            user_id: userSub,
            job_id: jobId,
            status: 'applied',
            createdAt: new Date()
        });

        return res.status(201).json({
            message: 'Application submitted successfully',
            application: jobApp
        });

    } catch (error) {
        console.error('Error creating job application:', error);
        return res.status(500).json({ 
            message: 'Error creating job application',
            error: error.message 
        });
    }
});

router.patch('/:applicationId', async (req, res) => {
    const userSub = req.headers['x-forwarded-user'];
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!userSub) {
        return res.status(401).json({ message: 'No user sub provided in header' });
    }

    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }

    try {
        const application = await db.JobApplications.findOne({
            where: {
                id: applicationId,
                user_id: userSub
            }
        });

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        application.status = status;
        await application.save();

        return res.json({
            message: 'Application status updated',
            application
        });
    } catch (error) {
        console.error('Error updating job application:', error);
        return res.status(500).json({ 
            message: 'Error updating job application',
            error: error.message 
        });
    }
});

module.exports = router;