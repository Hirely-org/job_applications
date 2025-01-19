// services/jobApplicationDeletionService.js
const db = require('./models');
const rabbitMQ = require('./rabbitMQService');
const MessageTypes = require('./constants/messageTypes');

class JobApplicationDeletionService {
    constructor() {
        this.deletedApplications = new Map();
    }

    async initialize() {
        await rabbitMQ.connect();
        
        // Listen for user deletion success messages
        await rabbitMQ.consumeQueue(rabbitMQ.queues.userDeletionResponse, async (msg) => {
            const message = JSON.parse(msg.content.toString());
            console.log('Received message:', message); // To help us debug

            if (message.type === MessageTypes.DELETE_USER_SUCCESS) {
                await this.handleUserDeletion(message);
            }
        });
    }

    async handleUserDeletion(message) {
        const { sagaId, userSub } = message;
        console.log(`Starting to delete job applications for user ${userSub}`);
        
        try {
            // Find all applications for this user
            const applications = await db.JobApplications.findAll({
                where: { user_id: userSub }
            });

            console.log(`Found ${applications.length} applications to delete`);

            // Store for potential rollback
            this.deletedApplications.set(sagaId, applications.map(app => app.toJSON()));

            // Delete all applications
            await db.JobApplications.destroy({
                where: { user_id: userSub }
            });

            console.log(`Successfully deleted all applications for user ${userSub}`);

            // Send success message
            await rabbitMQ.sendToQueue(rabbitMQ.queues.jobApplicationResponse, JSON.stringify({
                type: MessageTypes.JOB_APPLICATIONS_DELETED,
                sagaId,
                userSub,
                count: applications.length
            }));

        } catch (error) {
            console.error(`Error deleting job applications:`, error);
            
            // Send failure message
            await rabbitMQ.sendToQueue(rabbitMQ.queues.jobApplicationResponse, JSON.stringify({
                type: MessageTypes.JOB_APPLICATIONS_DELETION_FAILED,
                sagaId,
                userSub,
                error: error.message
            }));
        }
    }
}

module.exports = new JobApplicationDeletionService();