import { kafka } from '../../../packages/lib/kafka';
import { prisma } from '../../../packages/lib/prisma';

const consumer = kafka.consumer({ groupId: 'chat-group' });

let buffer: any[] = [];
const FLUSH_INTERVAL = 3000;
const MAX_BUFFER = 1000;

const flushMessages = async () => {
  if (!buffer.length) return;

  const batch = [...buffer];
  buffer = [];

  try {
    await prisma.message.createMany({
      data: batch.map((msg) => ({
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        content: msg.content,
        attachments: msg.attachments || [],
        status: 'sent',
        senderRole: msg.senderRole,
        receiverRole: msg.receiverRole,
        createdAt: msg.createdAt || new Date(),
      })),
    });

    const latestMap = new Map<string, any>();

    for (const msg of batch) {
      const existing = latestMap.get(msg.conversationId);

      if (!existing || new Date(msg.createdAt) > new Date(existing.createdAt)) {
        latestMap.set(msg.conversationId, msg);
      }
    }

    await Promise.all(
      Array.from(latestMap.values()).map((msg) =>
        prisma.conversationGroup.update({
          where: { id: msg.conversationId },
          data: {
            lastMessage:
              msg.content || (msg.attachments?.length ? '📎 Attachment' : ''),
            lastMessageAt: msg.createdAt || new Date(),
          },
        })
      )
    );

    console.log(`✅ Flushed ${batch.length} messages`);
  } catch (err) {
    console.error('❌ Flush error:', err);
    // requeue on failure
    buffer.unshift(...batch);
  }
};

export const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'messages' });

  setInterval(flushMessages, FLUSH_INTERVAL);

  await consumer.run({
    eachMessage: async ({ message }: any) => {
      try {
        const data = JSON.parse(message.value!.toString());

        buffer.push(data);

        // 🔥 overflow protection
        if (buffer.length >= MAX_BUFFER) {
          await flushMessages();
        }
      } catch (err) {
        console.error('Kafka parse error:', err);
      }
    },
  });

  const shutdown = async () => {
    console.log('Shutting down...');
    await flushMessages();
    await consumer.disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};
