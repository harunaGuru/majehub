import { ActionType, UserActionType } from '../services/fetchUserAnalytic';
export interface Interaction {
  userId: string;
  actionType: ActionType;
  productId: string;
}

export const preProcessedData = (
  userActions: UserActionType[],
  products: any[]
) => {
  const interactions: Interaction[] = userActions.map((action) => {
    return {
      userId: action.userId,
      actionType: action.action,
      productId: action.productId,
    };
  });
  return { interactions, products };
};
