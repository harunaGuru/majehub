import { WebSocketServer, WebSocket } from 'ws';
import redis from '../../../packages/lib/redis';
import { prisma } from '../../../packages/lib/prisma';
import { sendToKafka } from './kafkaProducer';
import http from 'http';

const clients = new Map<string, WebSocket>();
// Safe websocket sender
const safeSend = (client: WebSocket, data: any) => {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(data));
  }
};

// const broadcast = (data: any) => {
//   for (const [, client] of clients) {
//     client.send(JSON.stringify(data));
//   }
// };
const broadcast = (data: any) => {
  for (const [, client] of clients) {
    safeSend(client, data);
  }
};

export const initWebSocketServer = (server: http.Server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    let currentUserId: string | null = null;
    let heartbeatInterval: NodeJS.Timeout | null = null;

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString()) as {
          type: string;
          userId?: string;
          conversationId?: string;
          senderId?: string;
          receiverId?: string;
          content?: string;
          tempId?: string;
          attachments?: string[];
          senderRole?: string;
          receiverRole?: string;
        };

        switch (data.type) {
          case 'INIT':
            currentUserId = data.userId as string;
            clients.set(currentUserId, ws);

            await redis.set(`online:${currentUserId}`, 1, 'EX', 30);
            // clear existing interval
            if (heartbeatInterval) {
              clearInterval(heartbeatInterval);
            }

            // refresh redis ttl every 10 seconds
            heartbeatInterval = setInterval(async () => {
              try {
                await redis.set(`online:${currentUserId}`, 1, 'EX', 30);
              } catch (err) {
                console.error('Heartbeat error:', err);
              }
            }, 10000);

            broadcast({
              type: 'USER_ONLINE',
              userId: currentUserId,
            });
            break;

          case 'SEND_MESSAGE': {
            const {
              conversationId,
              senderId,
              receiverId,
              content,
              attachments = [],
              tempId,
              senderRole,
              receiverRole,
            } = data;

            const payload = {
              type: 'NEW_MESSAGE',
              data: {
                tempId,
                conversationId,
                senderId,
                content,
                attachments,
                createdAt: new Date(),
                senderRole,
                receiverRole,
              },
            };

            // realtime send
            const receiverSocket = clients.get(receiverId as string);
            // if (receiverSocket) {
            //   receiverSocket.send(JSON.stringify(payload));
            // }
            if (receiverSocket) {
              safeSend(receiverSocket, payload);
            }

            //echo back to sender
            const senderSocket = clients.get(senderId as string);
            if (senderSocket) {
              safeSend(senderSocket, payload);
            }

            // unread count
            await redis.incr(`unread:${receiverId}:${conversationId}`);

            // kafka
            await sendToKafka({
              conversationId,
              senderId,
              receiverId,
              content,
              attachments,
              senderRole,
              receiverRole,
              createdAt: new Date(),
            });

            break;
          }

          case 'READ_MESSAGES':
            const { userId, conversationId } = data;

            // Redis
            await redis.del(`unread:${userId}:${conversationId}`);

            // DB (persistent)
            await prisma.participant.updateMany({
              where: { userId, conversationId },
              data: {
                lastRead: new Date(),
                lastSeen: new Date(),
              },
            });
            break;
        }
      } catch (err) {
        console.error('WS error:', err);
      }
    });

    ws.on('close', async () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
      if (currentUserId) {
        clients.delete(currentUserId);
        await redis.del(`online:${currentUserId}`);
        broadcast({
          type: 'USER_OFFLINE',
          userId: currentUserId,
        });
      }
    });
    ws.on('error', (err) => {
      console.error('WebSocket error:', err);
    });
  });

  console.log('✅ WS ready');
};
