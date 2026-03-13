import { kafka } from '../../../packages/lib/kafka';
import { handleAnalyticsEvent } from './services/analytics-service';
import { isDuplicate } from './utils/kafka.helper';

let batch: any[] = [];
const consumer = kafka.consumer({
  groupId: 'analytics-service',
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
  maxWaitTimeInMs: 5000,
  maxBytesPerPartition: 1048576, // 1MB
});

async function processBatch() {
  if (!batch.length) return;

  const events = [...batch];
  batch = [];
  console.log(`🟡 Processing batch of ${events.length} events`);
  for (const event of events) {
    try {
      const actualEvent = event.eventData || event;
      await handleAnalyticsEvent(actualEvent);
      console.log(`✅ Processed event: ${actualEvent.productId || 'unknown'}`);
    } catch (err) {
      console.error('Analytics error:', err);
    }
  }
}

setInterval(processBatch, 3000);

async function startConsumer() {
  console.log('Starting Kafka consumer...');
  await consumer.connect();
  console.log('✅ Connected to Kafka');
    await consumer.subscribe({
      topic: 'user-event',
      fromBeginning: true,
    });
  console.log('✅ Subscribed to topic: user-event');
    await consumer.run({
      eachMessage: async ({ message, topic, partition }) => {
        console.log(
          `📥 Received from ${topic} [${partition}] @ offset ${message.offset}`
        );
        if (!message.value) return;
        const event = JSON.parse(message.value.toString());
        console.log('📦 Raw message:', event);

        if(isDuplicate(event)){
          console.log('⏭️ Duplicate skipped');
          return;
        }

        batch.push(event);
      },
    });

}
// Log consumer status periodically
// setInterval(async () => {
//   try {
//     const positions = await consumer.describeGroup();
//     console.log('📊 Consumer status:', JSON.stringify(positions, null, 2));
//   } catch (err) {
//     // Ignore errors here
//   }
// }, 10000);

// Handle errors
// consumer.on('consumer.crash', (error) => {
//   console.error('💥 Consumer crashed:', error);
// });
//
// consumer.on('consumer.disconnect', () => {
//   console.log('🔴 Consumer disconnected');
// });

  startConsumer().catch((err) => {
    console.error('Consumer failed to start:', err);
    process.exit(1);
  });

async function shutdown() {
  console.log('Shutting down consumer...');

  await consumer.disconnect();

  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
// app.get('/api', (req, res) => {
//   res.send({ message: 'Welcome to kafka-service!' });
// });

// async function startServer() {
//   try {
//     await startConsumer();
//
//     const port = process.env.PORT || 3333;
//
//     app.listen(port, () => {
//       console.log(`Listening at http://localhost:${port}/api`);
//     });
//   } catch (err) {
//     console.error('Service startup failed:', err);
//     process.exit(1);
//   }
// }
//
// startServer();

// const port = process.env.PORT || 3333;
// const server = app.listen(port, async () => {
//   console.log(`Listening at http://localhost:${port}/api`);
//   await startConsumer();
// });
// server.on('error', console.error);
