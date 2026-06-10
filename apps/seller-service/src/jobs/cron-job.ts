import cron from 'node-cron';
import { prisma } from '../../../../packages/lib/prisma';
import { imagekit } from '../../../../packages/lib/imagekit';

cron.schedule(
    '0 * * * *', // every hour
    async () => {
        try {
            console.log('Running shop deletion cron...');

            const now = new Date();

            const shopsToDelete = await prisma.shops.findMany({
                where: {
                    isDeleted: true,
                    deletedAt: {
                        lte: now,
                    },
                },
                include: {
                    sellers: true,
                    products: {
                        include: {
                            images: true,
                        },
                    },
                },
            });

            if (!shopsToDelete.length) {
                console.log('No shops to delete');
                return;
            }

            for (const shop of shopsToDelete) {
                try {
                    console.log(`Deleting shop ${shop.id}...`);

                    const productIds = shop.products.map(
                        (product) => product.id
                    );

                    /**
                     * DELETE PRODUCT IMAGES FROM IMAGEKIT
                     */
                    for (const product of shop.products) {
                        for (const image of product.images) {
                            try {
                                await imagekit.deleteFile(image.fileId);

                                console.log(
                                    `Deleted ImageKit file ${image.fileId}`
                                );
                            } catch (err) {
                                console.error(
                                    `Failed to delete ImageKit file ${image.fileId}`,
                                    err
                                );
                            }
                        }
                    }

                    /**
                     * DATABASE CLEANUP
                     */
                    await prisma.$transaction(async (tx) => {
                        /**
                         * PRESERVE ORDERS
                         * REMOVE SHOP RELATION
                         */
                        await tx.orders.updateMany({
                            where: {
                                shopId: shop.id,
                            },
                            data: {
                                shopId: null,
                            },
                        });

                        /**
                         * DELETE PRODUCT ANALYTICS
                         */
                        await tx.productAnalytics.deleteMany({
                            where: {
                                shopId: shop.id,
                            },
                        });

                        /**
                         * DELETE SHOP ANALYTICS
                         */
                        await tx.shopAnalytics.deleteMany({
                            where: {
                                shopId: shop.id,
                            },
                        });

                        /**
                         * DELETE FOLLOWERS
                         */
                        await tx.followers.deleteMany({
                            where: {
                                shopId: shop.id,
                            },
                        });

                        /**
                         * DELETE SHOP REVIEWS
                         */
                        await tx.shopReviews.deleteMany({
                            where: {
                                shopId: shop.id,
                            },
                        });

                        /**
                         * DELETE DISCOUNT CODES
                         */
                        await tx.discount_code.deleteMany({
                            where: {
                                sellerId: shop.sellerId,
                            },
                        });

                        /**
                         * DELETE PRODUCT IMAGES RECORDS
                         */
                        await tx.images.deleteMany({
                            where: {
                                productId: {
                                    in: productIds,
                                },
                            },
                        });

                        /**
                         * DELETE PRODUCTS
                         */
                        await tx.products.deleteMany({
                            where: {
                                shopId: shop.id,
                            },
                        });

                        /**
                         * DELETE SHOP
                         */
                        await tx.shops.delete({
                            where: {
                                id: shop.id,
                            },
                        });

                        /**
                         * DELETE SELLER
                         */
                        await tx.sellers.delete({
                            where: {
                                id: shop.sellerId,
                            },
                        });
                    });

                    console.log(
                        `Shop ${shop.id} and related data deleted successfully`
                    );
                } catch (shopError) {
                    console.error(
                        `Failed to delete shop ${shop.id}`,
                        shopError
                    );
                }
            }
        } catch (err) {
            console.error('Shop deletion cron failed:', err);
        }
    },
    {
        timezone: 'Africa/Lagos',
    }
);