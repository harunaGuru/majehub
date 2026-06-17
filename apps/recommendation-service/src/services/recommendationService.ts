import { preProcessedData, Interaction } from '../utils/preProcessedData';
import { UserActionType, fetchUserAnalytics } from './fetchUserAnalytic';
import * as tf from '@tensorflow/tfjs';

const EMBEDDING_SIZE = 50;
interface RecommendedProduct {
  productId: string;
  score: number;
}

const getUserAnalytics = async (userId: string): Promise<UserActionType[]> => {
  const userActions = await fetchUserAnalytics(userId);
  return Array.isArray(userActions) ? (userActions as UserActionType[]) : [];
};

export const productsRecommendation = async (
  userId: string,
  allproducts: any[]
): Promise<string[]> => {
  const userActions = await getUserAnalytics(userId);
  if (userActions.length === 0) {
    return [];
  }
  const { interactions } = preProcessedData(userActions, allproducts) as {
    interactions: Interaction[];
  };

  if (allproducts.length === 0 || interactions.length === 0) {
    return [];
  }
  const userMap: Record<string, number> = {};
  const productMap: Record<string, number> = {};

  let userCount = 0;
  let productCount = 0;

  interactions.forEach((interaction) => {
    if (!userMap[interaction.userId]) {
      userMap[interaction.userId] = userCount++;
    }
    if (!productMap[interaction.productId]) {
      productMap[interaction.productId] = productCount++;
    }
  });

  //define model input layers
  const userInput = tf.input({
    shape: [1],
    dtype: 'int32',
  }) as tf.SymbolicTensor;
  const productInput = tf.input({
    shape: [1],
    dtype: 'int32',
  }) as tf.SymbolicTensor;

  //user and product Embedding layers(like lookup tables)
  const userEmbedding = tf.layers
    .embedding({
      inputDim: userCount,
      outputDim: EMBEDDING_SIZE,
    })
    .apply(userInput) as tf.SymbolicTensor;

  const productEmbedding = tf.layers
    .embedding({
      inputDim: productCount,
      outputDim: EMBEDDING_SIZE,
    })
    .apply(productInput) as tf.SymbolicTensor;

  //Flatten embeddings
  const flattenedUser = tf.layers
    .flatten()
    .apply(userEmbedding) as tf.SymbolicTensor;
  const flattenedProduct = tf.layers
    .flatten()
    .apply(productEmbedding) as tf.SymbolicTensor;

  //concatenate user and product embeddings
  const concatenated = tf.layers
    .dot({ axes: 1 })
    .apply([flattenedUser, flattenedProduct]) as tf.SymbolicTensor;

  // //dense layers for feature interaction
  // let hidden1 = tf.layers.dense({units:64, activation:'relu'}).apply(concatenated) as tf.SymbolicTensor;
  // let hidden2 = tf.layers.dense({units:32, activation:'relu'}).apply(hidden1) as tf.SymbolicTensor;

  //output layer to predict interaction score
  const output = tf.layers
    .dense({ units: 1, activation: 'sigmoid' })
    .apply(concatenated) as tf.SymbolicTensor;

  //compile the model
  const model = tf.model({
    inputs: [userInput, productInput],
    outputs: [output],
  });
  model.compile({
    optimizer: tf.train.adam(),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy'],
  });

  //convert user and product interactions into tensors for training
  const userTensor = tf.tensor1d(
    interactions.map((interaction) => userMap[interaction.userId] ?? 0),
    'int32'
  );
  const productTensor = tf.tensor1d(
    interactions.map((interaction) => productMap[interaction.productId] ?? 0),
    'int32'
  );

  const weightLabels = tf.tensor2d(
    interactions.map((interaction) => {
      switch (interaction.actionType) {
        case 'purchase':
          return [1.0];
        case 'add_to_wishlist':
          return [0.5];
        case 'add_to_cart':
          return [0.7];
        case 'product_view':
          return [0.1];
        default:
          return [0];
      }
    }),
    [interactions.length, 1]
  );

  // Train the model
  await model.fit([userTensor, productTensor], weightLabels, {
    epochs: 5,
    batchSize: 32,
  });
  const productTensorAll = tf.tensor1d(Object.values(productMap), 'int32');

  const userTensorAll = tf.tensor1d([userMap[userId] ?? 0], 'int32');

  const predictions = model.predict([
    userTensorAll,
    productTensorAll,
  ]) as tf.Tensor;
  const scores = (await predictions.array()) as number[];
  const recommendedProducts: RecommendedProduct[] = Object.keys(productMap).map(
    (productId, index) => {
      return {
        productId,
        score: scores[index] ?? 0,
      };
    }
  );
  recommendedProducts.sort((a, b) => b.score - a.score);
  return recommendedProducts.slice(0, 10).map((p) => p.productId);
};
