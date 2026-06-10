import { Request, Response, NextFunction } from 'express';
import { prisma } from '@packages/lib/prisma';
import redis from '@packages/lib/redis';

// export const createConversationGroupId = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const userId = req.user?.id;
//     const { sellerId } = req.body;

//     if (!userId || !sellerId) {
//       return next(new Error('userId and sellerId are required'));
//     }

//     const existing = await prisma.conversationGroup.findFirst({
//       where: {
//         participants: {
//           hasEvery: [userId, sellerId],
//         },
//       },
//     });

//     if (existing) {
//       return res.status(200).json({
//         success: true,
//         conversationId: existing.id,
//       });
//     }

//     const conversation = await prisma.conversationGroup.create({
//       data: {
//         participants: [userId, sellerId],

//         participantsRelation: {
//           create: [
//             {
//               userId,
//               role: 'USER',
//             },
//             {
//               userId: sellerId,
//               role: 'SELLER',
//             },
//           ],
//         },
//       },
//     });

//     return res.status(201).json({
//       success: true,
//       conversationId: conversation.id,
//     });
//   } catch (error) {
//     console.error('Create Conversation Group Error:', error);
//     return next(error);
//   }
// };

export const createConversationGroupId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { sellerId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: 'Seller ID is required',
      });
    }

    /**
     * Ensure seller exists
     */
    const sellerExists = await prisma.sellers.findFirst({
      where: {
        id: sellerId,
        isDeleted: false,
      },
    });

    if (!sellerExists) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found',
      });
    }

    /**
     * Check existing conversation
     */
    const existingConversation = await prisma.conversationGroup.findFirst({
      where: {
        AND: [
          {
            participantsRelation: {
              some: {
                userId,
                role: 'USER',
              },
            },
          },
          {
            participantsRelation: {
              some: {
                sellerId,
                role: 'SELLER',
              },
            },
          },
        ],
      },
    });

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        conversationId: existingConversation.id,
      });
    }

    /**
     * Create conversation
     */
    const conversation = await prisma.conversationGroup.create({
      data: {
        participants: [userId, sellerId],

        participantsRelation: {
          create: [
            {
              userId,
              role: 'USER',
            },
            {
              sellerId,
              role: 'SELLER',
            },
          ],
        },
      },

      include: {
        participantsRelation: true,
      },
    });

    return res.status(201).json({
      success: true,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error('Create Conversation Error:', error);
    next(error);
  }
};

// export const getAllUserConversationGroups = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const userId = req.user?.id;

//     // 1. get user participants
//     const participants = await prisma.participant.findMany({
//       where: { userId },
//       include: {
//         conversation: true,
//       },
//       orderBy: {
//         conversation: {
//           lastMessageAt: 'desc',
//         },
//       },
//     });

//     const conversationIds = participants.map((p: any) => p.conversationId);

//     // 2. get full conversations
//     const conversations = await prisma.conversationGroup.findMany({
//       where: {
//         id: { in: conversationIds },
//       },
//       include: {
//         participantsRelation: true,
//       },
//     });

//     // 3. extract sellerIds (other participant)
//     const sellerIds: string[] = [];

//     const conversationMap = conversations.map((conv: any) => {
//       const other = conv.participantsRelation.find(
//         (p: any) => p.userId !== userId
//       );

//       if (other) sellerIds.push(other.userId!);

//       return {
//         ...conv,
//         otherUserId: other?.userId,
//       };
//     });

//     // 4. fetch sellers + shops
//     const sellers = await prisma.sellers.findMany({
//       where: { id: { in: sellerIds } },
//       include: {
//         shop: true,
//       },
//     });

//     const sellerMap = new Map(sellers.map((s: any) => [s.id, s]));

//     // 5. Redis pipeline (performance)
//     const pipeline = redis.pipeline();

//     conversationMap.forEach((conv: any) => {
//       pipeline.get(`online:${conv.otherUserId}`);
//       pipeline.get(`unread:${userId}:${conv.id}`);
//     });

//     const redisResults = await pipeline.exec();

//     // 6. format response
//     let redisIndex = 0;

//     const formatted = conversationMap.map((conv: any) => {
//       const seller = sellerMap.get(conv.otherUserId) as any;

//       const online = redisResults[redisIndex++][1];
//       const unread = redisResults[redisIndex++][1];

//       return {
//         conversationId: conv.id,
//         lastMessage: conv.lastMessage || '',
//         lastMessageAt: conv.lastMessageAt,

//         unreadCount: parseInt(unread || '0'),
//         isOnline: online === '1',

//         seller: {
//           id: seller?.id,
//           name: seller?.name,
//           shopName: seller?.shop?.name,
//           avatar: seller?.shop?.avatar,
//         },
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       count: formatted.length,
//       conversations: formatted,
//     });
//   } catch (error) {
//     console.error('Get Conversations Error:', error);
//     next(error);
//   }
// };

export const getAllUserConversationGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    /**
     * Get user participants
     */
    const participants = await prisma.participant.findMany({
      where: {
        userId,
        role: 'USER',
      },
      include: {
        conversation: true,
      },
      orderBy: {
        conversation: {
          lastMessageAt: 'desc',
        },
      },
    });

    const conversationIds = participants.map(
      (participant: any) => participant.conversationId
    );

    /**
     * Get conversations
     */
    const conversations = await prisma.conversationGroup.findMany({
      where: {
        id: {
          in: conversationIds,
        },
      },

      include: {
        participantsRelation: true,
      },
    });

    /**
     * Extract seller IDs
     */
    const sellerIds: string[] = [];

    const conversationMap = conversations.map((conversation: any) => {
      const sellerParticipant = conversation.participantsRelation.find(
        (participant: any) => participant.role === 'SELLER'
      );

      if (sellerParticipant?.sellerId) {
        sellerIds.push(sellerParticipant.sellerId);
      }

      return {
        ...conversation,
        otherSellerId: sellerParticipant?.sellerId,
      };
    });

    /**
     * Fetch sellers
     */
    const sellers = await prisma.sellers.findMany({
      where: {
        id: {
          in: sellerIds,
        },
        isDeleted: false,
      },

      include: {
        shop: true,
      },
    });

    const sellerMap = new Map(
      sellers.map((seller: any) => [seller.id, seller])
    );

    /**
     * Redis pipeline
     */
    const pipeline = redis.pipeline();

    conversationMap.forEach((conversation: any) => {
      pipeline.get(`online:${conversation.otherSellerId}`);
      pipeline.get(`unread:${userId}:${conversation.id}`);
    });

    const redisResults = await pipeline.exec();

    /**
     * Format response
     */
    let redisIndex = 0;

    const formatted = conversationMap.map((conversation: any) => {
      const seller = sellerMap.get(conversation.otherSellerId as string) as any;

      const online = redisResults?.[redisIndex++]?.[1];
      const unread = redisResults?.[redisIndex++]?.[1];

      return {
        conversationId: conversation.id,
        lastMessage: conversation.lastMessage || '',
        lastMessageAt: conversation.lastMessageAt,

        unreadCount: parseInt((unread as string) || '0'),
        isOnline: online === '1',

        seller: {
          id: seller?.id,
          name: seller?.name,
          shopName: seller?.shop?.name,
          avatar: seller?.shop?.avatar,
        },
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      conversations: formatted,
    });
  } catch (error) {
    console.error('Get User Conversations Error:', error);
    next(error);
  }
};

export const getConversationMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;
    const { cursor, limit = '20' } = req.query;

    const take = parseInt(limit as string, 10);
    const participant = await prisma.participant.findFirst({
      where: {
        conversationId,
        userId,
        role: 'USER',
      },
    });

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation',
      });
    }

    /**
     * Reset unread count
     */
    await redis.del(`unread:${userId}:${conversationId}`);

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: take + 1,
      ...(cursor && {
        skip: 1,
        cursor: {
          id: cursor as string,
        },
      }),
    });

    let nextCursor: string | null = null;

    if (messages.length > take) {
      const nextItem = messages.pop();
      nextCursor = nextItem?.id || null;
    }

    return res.status(200).json({
      success: true,
      data: messages.reverse(), // oldest → newest for UI
      pagination: {
        nextCursor,
        hasMore: !!nextCursor,
      },
    });
  } catch (error) {
    console.error('Get Messages Error:', error);
    next(error);
  }
};

export const getAllSellerConversationGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller?.id;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    /**
     * Get seller participants
     */
    const participants = await prisma.participant.findMany({
      where: {
        sellerId,
        role: 'SELLER',
      },

      include: {
        conversation: true,
      },

      orderBy: {
        conversation: {
          lastMessageAt: 'desc',
        },
      },
    });

    const conversationIds = participants.map(
      (participant: any) => participant.conversationId
    );

    /**
     * Get conversations
     */
    const conversations = await prisma.conversationGroup.findMany({
      where: {
        id: {
          in: conversationIds,
        },
      },

      include: {
        participantsRelation: true,
      },
    });

    /**
     * Extract users
     */
    const userIds: string[] = [];

    const conversationMap = conversations.map((conversation: any) => {
      const userParticipant = conversation.participantsRelation.find(
        (participant: any) => participant.role === 'USER'
      );

      if (userParticipant?.userId) {
        userIds.push(userParticipant.userId);
      }

      return {
        ...conversation,
        otherUserId: userParticipant?.userId,
      };
    });

    /**
     * Fetch users
     */
    const users = await prisma.users.findMany({
      where: {
        id: {
          in: userIds,
        },

        isDeleted: false,
      },

      include: {
        avatar: true,
      },
    });

    const userMap = new Map(users.map((user: any) => [user.id, user]));

    /**
     * Redis pipeline
     */
    const pipeline = redis.pipeline();

    conversationMap.forEach((conversation: any) => {
      pipeline.get(`online:${conversation.otherUserId}`);
      pipeline.get(`unread:${sellerId}:${conversation.id}`);
    });

    const redisResults = await pipeline.exec();

    /**
     * Format response
     */
    let redisIndex = 0;

    const formatted = conversationMap.map((conversation: any) => {
      const user = userMap.get(conversation.otherUserId as string) as any;

      const online = redisResults?.[redisIndex++]?.[1];
      const unread = redisResults?.[redisIndex++]?.[1];

      return {
        conversationId: conversation.id,
        lastMessage: conversation.lastMessage || '',
        lastMessageAt: conversation.lastMessageAt,

        unreadCount: parseInt((unread as string) || '0'),
        isOnline: online === '1',

        user: {
          id: user?.id,
          name: user?.name,
          avatar: user?.avatar?.fileUrl || null,
        },
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      conversations: formatted,
    });
  } catch (error) {
    console.error('Get Seller Conversations Error:', error);
    next(error);
  }
};

export const getSellerConversationMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller?.id;
    const { conversationId } = req.params;
    const { cursor, limit = '20' } = req.query;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const take = Math.min(Math.max(parseInt(limit as string, 10) || 20, 1), 50);

    /**
     * Validate seller belongs to conversation
     */
    const participant = await prisma.participant.findFirst({
      where: {
        conversationId,
        sellerId,
        role: 'SELLER',
      },
    });

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation',
      });
    }

    /**
     * Reset unread count
     */
    await redis.del(`unread:${sellerId}:${conversationId}`);

    /**
     * Fetch messages
     */
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },

      orderBy: {
        createdAt: 'desc',
      },

      take: take + 1,

      ...(cursor && {
        skip: 1,
        cursor: {
          id: cursor as string,
        },
      }),
    });

    let nextCursor: string | null = null;

    if (messages.length > take) {
      const nextItem = messages.pop();
      nextCursor = nextItem?.id || null;
    }

    return res.status(200).json({
      success: true,
      data: messages.reverse(),
      pagination: {
        nextCursor,
        hasMore: !!nextCursor,
      },
    });
  } catch (error) {
    console.error('Get Seller Messages Error:', error);
    next(error);
  }
};
