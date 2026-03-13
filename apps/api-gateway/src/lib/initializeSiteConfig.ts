import {prisma} from '@packages/lib/prisma'

type SubCategoryMap = {
  [key: string]: string[];
};
export default async function initializeSiteConfig(){
  try {
    const existing = await prisma.siteConfig.findFirst();

    const defaultCategories = [
      'electronic',
      'fashion',
      'Home & Kitchen',
      'Sport & Fitness',
    ];
    const defaultSubCategories: SubCategoryMap = {
      electronic: [
        'Mobile Phones',
        'Laptops',
        'Gaming Consoles',
        'Televisions',
      ],
      fashion: ['Men Clothing', 'Women Clothing', 'Shoes', 'Accessories'],
      'Home & Kitchen': ['Furniture', 'Cookware', 'Home Decor', 'Appliances'],
      'Sport & Fitness': [
        'Gym Equipment',
        'Outdoor Sports',
        'Fitness Wear',
        'Cycling',
      ],
    };
    if (!existing) {
      await prisma.siteConfig.create({
        data: {
          categories: defaultCategories,
          subCategories: defaultSubCategories,
          avatar: 'https://ik.imagekit.io/demo/ecommerce-store-avatar.png',
          banner: 'https://ik.imagekit.io/demo/ecommerce-banner-modern.jpg',
        },
      });
      console.log('🎉 SiteConfig initialized successfully');
    }else {
      console.log('✅ SiteConfig already initialized');
    }
  }catch(error){
    console.error('❌ Failed to initialize SiteConfig:', error);
    throw error;
  }

}