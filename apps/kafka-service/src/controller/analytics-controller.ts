import { Request, Response } from 'express';
import { kafka } from '../../../../packages/lib/kafka';

const producer = kafka.producer();

let producerConnected = false;

async function getProducer() {
  if (!producerConnected) {
    await producer.connect();
    producerConnected = true;
    console.log('✅ Kafka producer connected');
  }

  return producer;
}

export const trackAnalyticsEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const producer = await getProducer();

    await producer.send({
      topic: 'user-event',
      messages: [
        {
          value: JSON.stringify({
            eventData: req.body,
          }),
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Analytics event queued successfully',
    });
  } catch (error) {
    console.error('Analytics producer error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to queue analytics event',
    });
  }
};

export async function disconnectProducer() {
  if (producerConnected) {
    await producer.disconnect();
    console.log('Kafka producer disconnected');
  }
}
