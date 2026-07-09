import express from 'express';
import { kafka } from '../../../packages/lib/kafka';
import { handleAnalyticsEvent } from './services/analytics-service';
import { isDuplicate } from './utils/kafka.helper';
import analyticsRoutes from './route/analytic-route';

const app = express();
app.use(express.json());
app.use('/api', analyticsRoutes);

app.listen(6010, () => {
  console.log('Kafka service running on port 6010');
});

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

      if (isDuplicate(event)) {
        console.log('⏭️ Duplicate skipped');
        return;
      }

      batch.push(event);
    },
  });
}

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
