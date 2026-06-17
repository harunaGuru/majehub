import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { ValidationError } from '../../../../packages/error-handler';
import { prisma } from '../../../../packages/lib/prisma';
import redis from '../../../../packages/lib/redis';
import { sendMail } from '../utils/sendmail';

//confirm the apiversion
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

const extractProductFromCartItem = (cartItem: any) => {
  return cartItem.product;
};
const calculateCartTotal = (cart: any[]) => {
  return cart.reduce((total: number, item: any) => {
    const price = item.product.sale_price;
    const quantity = item.product.quantity;
    return total + price * quantity;
  }, 0);
};

export const createPaymentSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cart, coupon, selectedAddressId } = req.body;
    const userId = req?.user?.id;
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return next(new ValidationError('Cart is empty or invalid'));
    }
    if (!selectedAddressId) {
      return next(new ValidationError('Address is required'));
    }

    const normalizedCart = JSON.stringify(
      cart
        .map((item: any) => {
          const product = extractProductFromCartItem(item);
          return {
            id: product.id,
            quantity: product.quantity,
            sale_price: product.sale_price,
            shopId: product.shopId,
            selectedOptions: product.selectedOption || {},
          };
        })
        .sort((a: any, b: any) => a.id.localeCompare(b.id))
    );

    const keys = await redis.keys('payment-session:*');
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const parsedData = JSON.parse(data);
        if (parsedData.userId === userId) {
          const existingCart = JSON.stringify(
            parsedData.cart
              .map((item: any) => {
                const product = extractProductFromCartItem(item);
                return {
                  id: product.id,
                  quantity: product.quantity,
                  sale_price: product.sale_price,
                  shopId: product.shopId,
                  selectedOptions: product.selectedOption || {},
                };
              })
              .sort((a: any, b: any) => a.id.localeCompare(b.id))
          );

          if (existingCart === normalizedCart) {
            return res.status(200).json({
              sessionId: key.split(':')[1],
              message: 'Payment session already exists',
            });
          } else {
            await redis.del(key);
          }
        }
      }
    }

    const sessionId = crypto.randomUUID();

    let total = calculateCartTotal(cart);

    //fetch sellers and their stripe account
    const uniqueShopIds = [
      ...new Set(
        cart
          .map((item: any) => {
            const product = extractProductFromCartItem(item);
            return product.shopId;
          })
          .filter(Boolean) // Remove any undefined/null values
      ),
    ];
    const shops = await prisma.shops.findMany({
      where: {
        id: {
          in: uniqueShopIds,
        },
      },
      select: {
        id: true,
        sellerId: true,
        sellers: {
          select: {
            stripeId: true,
          },
        },
      },
    });
    const sellerData = shops.map((shop) => ({
      stripeAccountId: shop?.sellers?.stripeId,
      sellerId: shop.sellerId,
      shopId: shop.id,
    }));
    const sessionData = {
      userId,
      cart,
      sellers: sellerData,
      totalAmount: total,
      shippingAddressId: selectedAddressId,
      coupon: coupon || null,
    };
    await redis.set(
      `payment-session:${sessionId}`,
      JSON.stringify(sessionData),
      'EX',
      60 * 30
    );

    res.json({ sessionId });
  } catch (error) {
    next(error);
  }
};

export const paymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId, amount } = req.body;
    const userId = req?.user?.id;
    if (!userId) {
      return next(new ValidationError('User not found'));
    }
    const customerAmount = Math.round(amount * 100);
    const platformFee = Math.floor(customerAmount * 0.1);
    console.log('customerAmount', customerAmount);
    console.log('platformFee', platformFee);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: customerAmount,
      currency: 'usd',
      payment_method_types: ['card'],
      application_fee_amount: platformFee,
      transfer_data: {
        // destination: stripeCustomerId,
        destination: 'acct_1SygQn2KXNe32nqJ',
      },
      metadata: {
        sessionId,
        userId: userId,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPaymentSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.query.sessionId as string;
    if (!sessionId) {
      return next(new ValidationError('Session Id is required'));
    }
    const sessionData = await redis.get(`payment-session:${sessionId}`);
    if (!sessionData) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }
    const session = JSON.parse(sessionData);
    return res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};

// export const createOrder = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const sig = req.headers['stripe-signature'];
//     if (!sig) {
//       return res.status(400).send('Missing Stripe signature');
//     }
//     const rawBody = (req as any).rawBody;
//     let event;
//     try {
//       event = stripe.webhooks.constructEvent(
//         rawBody,
//         sig!,
//         process.env.STRIPE_WEBHOOK_SECRET!
//       );
//     } catch (err) {
//       if (err instanceof Error) {
//         console.log('webhook signature verification failed', err.message);
//       }
//       return res.status(400).send(`Webhook Error`);
//     }

//     if (event.type === 'payment_intent.succeeded') {
//       const paymentIntent = event.data.object as Stripe.PaymentIntent;

//       const sessionId = paymentIntent.metadata.sessionId;
//       const userId = paymentIntent.metadata.userId;
//       const sessionData = await redis.get(`payment-session:${sessionId}`);
//       if (!sessionData) {
//         console.warn('session data expired or missing for', sessionId);
//         return res
//           .status(200)
//           .send('No session found, skipping order creation');
//       }

//       const { cart, totalAmount, shippingAddressId, coupon } =
//         JSON.parse(sessionData);
//       const user = await prisma.users.findUnique({
//         where: { id: userId },
//       });
//       const name = user?.name;
//       const email = user?.email;

//       //create orders by shop
//       const shopGrouped = cart.reduce((acc: any, item: any) => {
//         if (!acc[item.product.shopId]) acc[item.product.shopId] = [];
//         acc[item.product.shopId].push(item.product);
//         return acc;
//       }, {});
//       for (const shopId in shopGrouped) {
//         const orderItems = shopGrouped[shopId];
//         let orderTotal = orderItems.reduce(
//           (sum: number, item: any) => sum + item.sale_price * item.quantity,
//           0
//         );
//         //lets apply discount if applicable
//         if (
//           coupon &&
//           coupon.discountedProductId &&
//           orderItems.some((item: any) => item.id === coupon.discountedProductId)
//         ) {
//           const discountedItem = orderItems.find(
//             (item: any) => item.id === coupon.discountedProductId
//           );
//           if (discountedItem) {
//             const discount =
//               coupon.discountPercent > 0
//                 ? (discountedItem.sale_price *
//                     discountedItem.quantity *
//                     coupon.discountPercent) /
//                   100
//                 : coupon.discountAmount;
//             orderTotal -= discount;
//           }
//         }
//         //create order
//         const order = await prisma.orders.create({
//           data: {
//             userId,
//             total: orderTotal,
//             shopId,
//             status: 'Paid',
//             shippingAddressId,
//             couponCode: coupon?.code || null,
//             discountAmount: coupon.discountAmount || 0,
//             Items: {
//               create: orderItems.map((item: any) => ({
//                 productId: item.id,
//                 quantity: item.quantity,
//                 price: item.sale_price,
//                 selectedOption: item.selectedOptions,
//               })),
//             },
//           },
//         });
//         //update product and analytics
//         for (const item of orderItems) {
//           const { id, quantity } = item;
//           await prisma.products.update({
//             where: { id: id },
//             data: {
//               stock: { decrement: quantity },
//               totalSales: { increment: quantity },
//             },
//           });
//           //update product analytics
//           await prisma.productAnalytics.upsert({
//             where: { productId: id },
//             update: {
//               purchases: { increment: quantity },
//             },
//             create: {
//               productId: id,
//               shopId,
//               purchases: quantity,
//               lastViewAt: new Date(),
//             },
//           });

//           // Update user analytics
//           const existingAnalytics = await prisma.userAnalytics.findUnique({
//             where: { userId },
//           });
//           const newActions = {
//             productId: id,
//             shopId,
//             action: 'purchase',
//             timestamp: new Date(),
//           };
//           const existingActions = Array.isArray(existingAnalytics?.actions)
//             ? (existingAnalytics?.actions as any[])
//             : [];
//           const updatedActions = [...existingActions, newActions];
//           if (existingAnalytics) {
//             await prisma.userAnalytics.update({
//               where: { userId },
//               data: {
//                 lastVisited: new Date(),
//                 actions: updatedActions,
//               },
//             });
//           } else {
//             await prisma.userAnalytics.create({
//               data: {
//                 userId,
//                 lastVisited: new Date(),
//                 actions: [newActions],
//               },
//             });
//           }
//         }
//         //send email to user
//         await sendMail(
//         email!,
//         'order-confirmation',
//         {
//           name,
//           orderId: order.id,
//           totalAmount:orderTotal,
//           items: cart,
//           discountAmount: coupon?.discountAmount || 0,
//           discountedProductId: coupon?.discountedProductId || null,
//           coupon,
//           trackingLink: `http://localhost:3000/order/${order.id}`,
//         },
//         '🛒Order Confirmation'
//       );
//       }

//       for (const shopId in shopGrouped) {
//         const orderItems = shopGrouped[shopId];
//         const shop = await prisma.shops.findUnique({
//           where: { id: shopId },
//           select: {
//             sellerId: true,
//             name: true,
//             id: true,
//           },
//         });
//         const product = orderItems[0].title || 'New Product';
//         //send notification to sellers
//         await prisma.notifications.create({
//           data: {
//             creatorId: user?.id!,
//             receiverId: shop?.sellerId!,
//             title: 'New Order Received',
//             message: `A customer just ordered ${product} from your shop`,
//             redirect_link: `http://localhost:3000/order/${sessionId}`,
//           },
//         });
//         //send notification to admin
//         await prisma.notifications.create({
//           data: {
//             creatorId: user?.id!,
//             receiverId: 'admin',
//             title: 'New Order for ' + shop?.name,
//             message: `New order was placed by ${name}`,
//             redirect_link: `http://localhost:3000/order/${sessionId}`,
//           },
//         });
//       }
//       await redis.del(`payment-session:${sessionId}`);
//     }
//     return res.status(200).send('Order created successfully');
//   } catch (error) {
//     return next(error);
//   }
// };

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      return res.status(400).send('Missing Stripe signature');
    }

    const rawBody = (req as any).rawBody;

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      if (err instanceof Error) {
        console.log('webhook signature verification failed', err.message);
      }

      return res.status(400).send('Webhook Error');
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const sessionId = paymentIntent.metadata.sessionId;
      const userId = paymentIntent.metadata.userId;

      const sessionData = await redis.get(`payment-session:${sessionId}`);

      if (!sessionData) {
        console.warn('session data expired or missing for', sessionId);

        return res
          .status(200)
          .send('No session found, skipping order creation');
      }

      const { cart, shippingAddressId, coupon } = JSON.parse(sessionData);

      const user = await prisma.users.findUnique({
        where: { id: userId },
      });

      const name = user?.name;
      const email = user?.email;

      /**
       * Group FULL cart items by shop
       * so email template continues to work.
       */
      const shopGrouped: Record<string, any[]> = cart.reduce(
        (acc: Record<string, any[]>, item: any) => {
          const shopId = item.product.shopId;

          if (!acc[shopId]) {
            acc[shopId] = [];
          }

          acc[shopId].push(item);

          return acc;
        },
        {}
      );
      const existingAnalytics = await prisma.userAnalytics.findUnique({
        where: { userId },
      });
      const existingActions = Array.isArray(existingAnalytics?.actions)
        ? (existingAnalytics.actions as any[])
        : [];

      const newActions: any[] = [];

      for (const shopId in shopGrouped) {
        const orderItems = shopGrouped[shopId];

        let orderTotal = orderItems.reduce(
          (sum: number, item: any) =>
            sum + item.product.sale_price * item.product.quantity,
          0
        );

        let appliedDiscount = 0;
        let appliedDiscountedProductId: string | null = null;

        /**
         * Apply coupon ONLY if this order contains
         * the discounted product.
         */
        if (
          coupon &&
          coupon.discountedProductId &&
          orderItems.some(
            (item: any) => item.product.id === coupon.discountedProductId
          )
        ) {
          const discountedItem = orderItems.find(
            (item: any) => item.product.id === coupon.discountedProductId
          );

          if (discountedItem) {
            appliedDiscount =
              coupon.discountPercent > 0
                ? (discountedItem.product.sale_price *
                    discountedItem.product.quantity *
                    coupon.discountPercent) /
                  100
                : coupon.discountAmount;

            appliedDiscountedProductId = coupon.discountedProductId;

            orderTotal -= appliedDiscount;
          }
        }

        /**
         * Create order
         */
        const order = await prisma.orders.create({
          data: {
            userId,
            total: orderTotal,
            shopId,
            status: 'Paid',
            shippingAddressId,
            couponCode: coupon?.code || null,
            discountAmount: appliedDiscount,

            Items: {
              create: orderItems.map((item: any) => ({
                productId: item.product.id,
                quantity: item.product.quantity,
                price: item.product.sale_price,
                selectedOption: item.product.selectedOption || {},
              })),
            },
          },
        });

        /**
         * Fetch shop once
         */
        const shop = await prisma.shops.findUnique({
          where: { id: shopId },
          select: {
            id: true,
            name: true,
            sellerId: true,
          },
        });

        const productName = orderItems[0]?.product?.title || 'Product';

        /**
         * Seller notification
         */
        if (shop?.sellerId) {
          await prisma.notifications.create({
            data: {
              creatorId: userId,
              receiverId: shop.sellerId,
              title: 'New Order Received',
              message: `A customer just ordered ${productName} from your shop`,
              redirect_link: `http://localhost:3000/order/${order.id}`,
            },
          });
        }

        /**
         * Admin notification
         */
        await prisma.notifications.create({
          data: {
            creatorId: userId,
            receiverId: 'admin',
            title: `New Order for ${shop?.name}`,
            message: `New order was placed by ${name}`,
            redirect_link: `http://localhost:3000/order/${order.id}`,
          },
        });

        /**
         * User notification
         */
        await prisma.notifications.create({
          data: {
            creatorId: userId,
            receiverId: userId,
            title: 'Order Confirmed',
            message: `Your order #${order.id} has been placed successfully`,
            redirect_link: `http://localhost:3000/order/${order.id}`,
          },
        });

        /**
         * Update inventory & analytics
         */
        for (const item of orderItems) {
          const product = item.product;

          await prisma.products.update({
            where: {
              id: product.id,
            },
            data: {
              stock: {
                decrement: product.quantity,
              },
              totalSales: {
                increment: product.quantity,
              },
            },
          });

          await prisma.productAnalytics.upsert({
            where: {
              productId: product.id,
            },
            update: {
              purchases: {
                increment: product.quantity,
              },
            },
            create: {
              productId: product.id,
              shopId,
              purchases: product.quantity,
              lastViewAt: new Date(),
            },
          });

          newActions.push({
            productId: product.id,
            shopId,
            action: 'purchase',
            timestamp: new Date(),
          });
        }

        /**
         * Send order email for THIS shop order only
         */
        if (email) {
          await sendMail(
            email,
            'order-confirmation',
            {
              name,
              orderId: order.id,
              totalAmount: orderTotal,

              items: orderItems,

              discountAmount: appliedDiscount,
              discountedProductId: appliedDiscountedProductId,

              coupon,

              trackingLink: `http://localhost:3000/order/${order.id}`,
            },
            '🛒Order Confirmation'
          );
        }
      }

      if (existingAnalytics) {
        await prisma.userAnalytics.update({
          where: { userId },
          data: {
            lastVisited: new Date(),
            actions: [...existingActions, ...newActions],
          },
        });
      } else {
        await prisma.userAnalytics.create({
          data: {
            userId,
            lastVisited: new Date(),
            actions: newActions,
          },
        });
      }

      await redis.del(`payment-session:${sessionId}`);
    }

    return res.status(200).send('Order created successfully');
  } catch (error) {
    return next(error);
  }
};

export const applyCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { couponCode, cart } = req.body;
    if (!couponCode || !couponCode.trim() || !cart || !Array.isArray(cart)) {
      return next(new ValidationError('Coupon code and cart are required'));
    }
    const discount = await prisma.discount_code.findUnique({
      where: { discountCode: couponCode },
    });

    if (!discount) {
      return next(new ValidationError('Coupon not found'));
    }

    const matchingProduct = cart.find((item: any) =>
      item.product?.discount_code?.some((d: any) => d === discount.id)
    );

    if (!matchingProduct) {
      return res.status(200).json({
        valid: false,
        discount: 0,
        discountAmount: 0,
        message: 'Coupon not applicable to selected products',
      });
    }

    const price = matchingProduct.product.sale_price;
    const quantity = matchingProduct.product.quantity;
    console.log(price, quantity);

    let discountAmount = 0;

    if (discount.discountType === 'percentage') {
      discountAmount = (discount.discountValue / 100) * price * quantity;
    } else if (discount.discountType === 'fixed') {
      discountAmount = discount.discountValue * quantity;
    }

    discountAmount = Math.min(discountAmount, price);

    return res.status(200).json({
      valid: true,
      discount: discount.discountValue,
      discountAmount,
      discountedProductId: matchingProduct.product.id,
      message: 'Discount appied to 1 eligibe Product',
    });
  } catch (error) {
    return next(error);
  }
};

export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req?.user?.id;

    if (!userId) {
      return next(new ValidationError('User not authenticated'));
    }

    const orders = await prisma.orders.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        total: true,
        status: true,
        deliveryStatus: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let totalOrders = orders.length;
    let completedOrders = 0;
    let processingOrders = 0;

    for (const order of orders) {
      if (order.deliveryStatus === 'delivered') {
        completedOrders++;
      } else {
        processingOrders++;
      }
    }

    const formattedOrders = orders.map((order) => ({
      orderId: order.id,
      total: order.total,
      status: order.status,
      date: order.createdAt,
    }));

    return res.status(200).json({
      success: true,
      summary: {
        totalOrders,
        processingOrders,
        completedOrders,
      },
      orders: formattedOrders,
    });
  } catch (error) {
    console.error('Get User Orders Error:', error);
    return next(error);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    // const userId = req?.user?.id;

    // if (!userId) {
    //   return next(new ValidationError('User not authenticated'));
    // }

    if (!orderId) {
      return next(new ValidationError('Order ID is required'));
    }

    const order = await prisma.orders.findFirst({
      where: {
        id: orderId,
        // userId,
      },
      include: {
        Items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            selectedOption: true,
            productId: true,
          },
        },
      },
    });

    if (!order) {
      return next(new ValidationError('Order not found'));
    }

    const productIds = order.Items.map((item) => item.productId);

    const products = await prisma.products.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        title: true,
        images: {
          select: {
            fileUrl: true,
          },
          take: 1,
        },
      },
    });

    const productMap = new Map(
      products.map((product) => [
        product.id,
        {
          title: product.title,
          image: product.images?.[0]?.fileUrl || null,
        },
      ])
    );

    const formattedItems = order.Items.map((item) => {
      const product = productMap.get(item.productId);

      return {
        id: item.id,
        productId: item.productId,
        title: product?.title || null,
        image: product?.image || null,
        quantity: item.quantity,
        price: item.price,
        selectedOption: item.selectedOption,
        subtotal: item.price * item.quantity,
      };
    });

    const formattedOrder = {
      id: order.id,
      total: order.total,
      status: order.status,
      deliveryStatus: order.deliveryStatus,
      couponCode: order.couponCode,
      discountAmount: order.discountAmount,
      createdAt: order.createdAt,
      items: formattedItems,
    };

    return res.status(200).json({
      success: true,
      order: formattedOrder,
    });
  } catch (error) {
    console.error('Get Order By Id Error:', error);
    return next(error);
  }
};

export const getSellerOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req?.seller?.id;

    if (!sellerId) {
      return next(new ValidationError('Seller not authenticated'));
    }
    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        shop: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!seller?.shop) {
      return next(new ValidationError('Shop not found'));
    }

    const shopId = seller.shop.id;

    const orders = await prisma.orders.findMany({
      where: {
        shopId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      customer: {
        id: order.user?.id,
        name: order.user?.name || 'Customer',
      },
    }));

    return res.status(200).json({
      success: true,
      count: formattedOrders.length,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error('Get Seller Orders Error:', error);
    return next(error);
  }
};

export const getOrderDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const sellerId = req?.seller?.id;
    if (!sellerId) {
      return next(new ValidationError('Seller not authenticated'));
    }
    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        shop: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!seller?.shop) {
      return next(new ValidationError('Shop not found'));
    }
    const shopId = seller.shop.id;

    if (!orderId) {
      return next(new ValidationError('Order ID is required'));
    }

    const order = await prisma.orders.findFirst({
      where: {
        id: orderId,
        shopId,
      },
      include: {
        Items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            selectedOption: true,
            productId: true,
          },
        },
      },
    });

    if (!order) {
      return next(new ValidationError('Order not found'));
    }

    let shippingAddress = null;

    if (order.shippingAddressId) {
      shippingAddress = await prisma.address.findUnique({
        where: {
          id: order.shippingAddressId,
        },
        select: {
          label: true,
          name: true,
          street: true,
          city: true,
          country: true,
        },
      });
    }

    const productIds = order.Items.map((item) => item.productId);

    const products = await prisma.products.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        title: true,
        images: {
          select: {
            fileUrl: true,
          },
          take: 1,
        },
      },
    });

    const productMap = new Map(
      products.map((product) => [
        product.id,
        {
          title: product.title,
          image: product.images?.[0]?.fileUrl || null,
        },
      ])
    );

    const formattedItems = order.Items.map((item) => {
      const product = productMap.get(item.productId);

      return {
        id: item.id,
        productId: item.productId,
        title: product?.title || null,
        image: product?.image || null,
        quantity: item.quantity,
        price: item.price,
        selectedOption: item.selectedOption,
        subtotal: item.price * item.quantity,
      };
    });

    const formattedOrder = {
      id: order.id,
      total: order.total,
      status: order.status,
      deliveryStatus: order.deliveryStatus,
      couponCode: order.couponCode,
      discountAmount: order.discountAmount,
      createdAt: order.createdAt,

      shippingAddress: shippingAddress
        ? {
            label: shippingAddress.label,
            name: shippingAddress.name,
            street: shippingAddress.street,
            city: shippingAddress.city,
            country: shippingAddress.country,
          }
        : null,

      items: formattedItems,
    };

    return res.status(200).json({
      success: true,
      order: formattedOrder,
    });
  } catch (error) {
    console.error('Get Order By Id Error:', error);
    return next(error);
  }
};

export const updateOrderDeliveryStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const { deliveryStatus } = req.body;

    const sellerId = req?.seller?.id;

    if (!sellerId) {
      return next(new ValidationError('Seller not authenticated'));
    }

    if (!orderId) {
      return next(new ValidationError('Order ID is required'));
    }

    if (!deliveryStatus) {
      return next(new ValidationError('Delivery status is required'));
    }
    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        shop: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!seller?.shop) {
      return next(new ValidationError('Shop not found'));
    }
    const shopId = seller.shop.id;

    const allowedStatuses = [
      'ordered',
      'packed',
      'shipped',
      'out for delivery',
      'delivered',
    ];

    if (!allowedStatuses.includes(deliveryStatus.toLowerCase())) {
      return next(new ValidationError(`Invalid delivery status`));
    }

    const order = await prisma.orders.findFirst({
      where: {
        id: orderId,
        shopId,
      },
      select: {
        id: true,
        deliveryStatus: true,
      },
    });

    if (!order) {
      return next(new ValidationError('Order not found'));
    }

    // Prevent changing status after delivered
    if (order.deliveryStatus === 'delivered') {
      return next(new ValidationError('Delivered orders cannot be updated'));
    }

    // Enforce forward-only progression
    const statusFlow = [
      'ordered',
      'packed',
      'shipped',
      'out for delivery',
      'delivered',
    ];

    const currentIndex = statusFlow.indexOf(order.deliveryStatus.toLowerCase());

    const newIndex = statusFlow.indexOf(deliveryStatus.toLowerCase());

    // Prevent same status update
    if (currentIndex === newIndex) {
      return next(
        new ValidationError(`Order is already marked as "${deliveryStatus}"`)
      );
    }

    // Prevent moving backwards
    if (newIndex < currentIndex) {
      return next(
        new ValidationError(
          `Cannot move delivery status backwards from "${order.deliveryStatus}" to "${deliveryStatus}"`
        )
      );
    }

    // Prevent skipping steps
    if (newIndex > currentIndex + 1) {
      return next(
        new ValidationError(
          `Invalid delivery status transition from "${order.deliveryStatus}" to "${deliveryStatus}"`
        )
      );
    }

    const updatedOrder = await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: {
        deliveryStatus: deliveryStatus.toLowerCase(),
      },
      select: {
        id: true,
        deliveryStatus: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Order delivery status updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Update Order Delivery Status Error:', error);

    return next(error);
  }
};
