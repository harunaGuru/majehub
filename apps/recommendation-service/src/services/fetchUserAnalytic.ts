import { prisma } from '../../../../packages/lib/prisma';
export type ActionType =
  | 'add_to_cart'
  | 'product_view'
  | 'add_to_wishlist'
  | 'purchase';
export interface UserActionType {
  productId: string;
  shopId: string;
  action: ActionType;
  userId: string;
}
export const fetchUserAnalytics = async (
  userId: string
): Promise<UserActionType[]> => {
  try {
    const userActions = await prisma.userAnalytics.findUnique({
      where: {
        userId,
      },
      select: {
        actions: true,
      },
    });
    const userActionsWithUserId =
      (userActions?.actions as unknown as UserActionType[]) || [];
    userActionsWithUserId.forEach((action) => {
      action.userId = userId;
    });
    return userActionsWithUserId;
  } catch (error) {
    return [];
  }
};
