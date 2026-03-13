import cron from 'node-cron';
import { prisma } from '../../../../packages/lib/prisma';
import { imagekit } from '../../../../packages/lib/imagekit';



// export const scheduleProductDeletion = () => {
//   console.log('Initializing Product Deletion Cron Job...');

  cron.schedule(
    '0 * * * *', // daily at every hour Lagos time
    async () => {
      try {
        const now = new Date();

        const productsToDelete = await prisma.products.findMany({
          where: {
            isDeleted: true,
            deletedAt: {
              lte: now,
            },
          },
          include: { images: true },
        });

        for (const product of productsToDelete) {
          console.log(`Deleting product ${product.id}...`);

          // Delete images from ImageKit
          for (const image of product.images) {
            try {
              await imagekit.deleteFile(image.fileId);
              console.log(`Deleted ImageKit file ${image.fileId}`);
            } catch (err) {
              console.error(`Failed to delete file ${image.fileId}`, err);
            }
          }

          // Transactional DB delete
          await prisma.$transaction(async (tx) => {
            await tx.images.deleteMany({ where: { productId: product.id } });
            await tx.products.delete({ where: { id: product.id } });
          });

          console.log(`Product ${product.id} fully deleted.`);
        }
      } catch (err) {
        console.error('Product deletion cron failed:', err);
      }
    },
    { timezone: 'Africa/Lagos' }
  );
// };
