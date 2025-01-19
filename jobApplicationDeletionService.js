// jobApplicationDeletionService.js
const db = require('./models');
const rabbitMQ = require('./rabbitMQService');
const MessageTypes = require('./constants/messageTypes');

class JobApplicationDeletionService {
    constructor() {
        this.deletedApplications = new Map();
    }

    async initialize() {
        await rabbitMQ.connect();
        
        await rabbitMQ.consumeQueue(rabbitMQ.queues.userDeletionResponse, async (message) => {
            console.log('Received message:', message);

            if (message.type === MessageTypes.DELETE_USER_SUCCESS) {
                await this.handleUserDeletion(message);
            }
        });
    }

    async handleUserDeletion(message) {
        const { sagaId, userSub } = message;
        console.log(`Starting to delete job applications for user ${userSub}`);
        
        try {
            const applications = await db.JobApplications.findAll({
                where: { user_id: userSub }
            });

            console.log(`Found ${applications.length} applications to delete`);

            // Store for potential rollback
            this.deletedApplications.set(sagaId, applications.map(app => app.toJSON()));

            /* 
            // To demonstrate SAGA rollback, uncomment this line:
            throw new Error('Simulated failure in job application deletion');
            */

            // Delete all applications
            await db.JobApplications.destroy({
                where: { user_id: userSub }
            });

            console.log(`Successfully deleted all applications for user ${userSub}`);

            await rabbitMQ.sendToQueue(rabbitMQ.queues.jobApplicationResponse, {
                type: MessageTypes.JOB_APPLICATIONS_DELETED,
                sagaId,
                userSub,
                count: applications.length
            });

        } catch (error) {
            console.error(`Error deleting job applications:`, error);
            
            await rabbitMQ.sendToQueue(rabbitMQ.queues.jobApplicationResponse, {
                type: MessageTypes.JOB_APPLICATIONS_DELETION_FAILED,
                sagaId,
                userSub,
                error: error.message
            });
        }
    }
}

module.exports = new JobApplicationDeletionService();