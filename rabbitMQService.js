const amqplib = require('amqplib');
const rabbitMQURI = require('./config');

class RabbitMQService {
    constructor() {
        this.connection = null;
        this.channel = null;
        // Define our SAGA queues
        this.queues = {
            userDeletionResponse: 'user_deletion_response_queue',
            jobApplicationDeletion: 'job_application_deletion_queue',
            jobApplicationResponse: 'job_application_response_queue'
        };
    }

    async connect() {
        if (!this.connection) {
            this.connection = await amqplib.connect(rabbitMQURI);
            this.channel = await this.connection.createChannel();
            
            // Setup all required queues
            for (const queueName of Object.values(this.queues)) {
                await this.channel.assertQueue(queueName, { durable: true });
            }
            
            console.log('[*] Connected to RabbitMQ and setup queues');
        }
        return this;
    }

    async consumeQueue(queue, callback) {
        await this.channel.assertQueue(queue, { durable: false });
        this.channel.consume(queue, callback, { noAck: true });
        console.log(` [*] Waiting for messages in ${queue}`);
    }

    async sendToQueue(queue, message) {
        await this.channel.assertQueue(queue, { durable: false });
        this.channel.sendToQueue(queue, Buffer.from(message));
        console.log(` [x] Sent "${message}" to queue ${queue}`);
    }
}

// Export a singleton instance
module.exports = new RabbitMQService();
