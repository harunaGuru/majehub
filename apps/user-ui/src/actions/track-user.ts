'use server';

import { axiosInstance } from '@/utils/axiosInstance';
import { DeviceInfo } from '@/store';
interface EventData {
  type: string;
  productId?: string;
  shopId?: string;
  userId: string;
  country: string;
  city: string;
  device: DeviceInfo | string;
  timestamp: string;
}

export async function sendKafkaEvent(eventData: EventData) {
  try {
    await axiosInstance.post('/kafka/api/track', eventData);
  } catch (error) {
    console.error('Failed to send analytics event:', error);
  }
}
