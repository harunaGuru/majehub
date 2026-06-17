import { prisma } from '../../../../packages/lib/prisma';
import { getStat } from '../utils/getStat';

interface DeviceInfo {
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  deviceType: string;
  cpuArchitecture: string;
}

export type AnalyticsEventType =
  | 'shop_visit'
  | 'product_view'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'add_to_wishlist'
  | 'remove_from_wishlist'
  | 'purchases';

export interface AnalyticsEvent {
  type: AnalyticsEventType;

  userId: string;

  productId?: string;

  shopId?: string;

  country?: string;

  city?: string;

  device?: DeviceInfo | string;

  timestamp: string | Date;
}

function normalizeDevice(
  device: DeviceInfo | string | undefined
): string | undefined {
  if (!device) return undefined;

  if (typeof device === 'string') {
    return device;
  }

  return JSON.stringify(device);
}

async function handleUserAnalytics(event: AnalyticsEvent) {
  if (!event.userId) return;
  console.log(`User ID from uerAnalytics: ${event.userId}`);
  // Normalize device to string for storage
  const deviceString = normalizeDevice(event.device);
  const user = await prisma.userAnalytics.upsert({
    where: { userId: event.userId },
    update: {
      lastVisited: new Date(event.timestamp),
      country: event.country,
      city: event.city,
      device: deviceString,
    },
    create: {
      userId: event.userId,
      lastVisited: new Date(event.timestamp),
      country: event.country,
      city: event.city,
      device: deviceString,
      actions: [],
    },
  });

  if (event.type === 'shop_visit') return;

  let updated: any = user.actions || [];

  if (event.type === 'product_view') {
    updated.push({
      productId: event.productId,
      shopId: event.shopId,
      action: 'product_view',
      timestamp: event.timestamp,
    });
  }

  if (event.type === 'add_to_cart') {
    // Log before filtering

    const existingCartItem = updated.find(
      (a: any) => a.productId === event.productId && a.action === 'add_to_cart'
    );
    console.log('5b. Existing cart item found:', existingCartItem);

    updated = updated.filter(
      (a: any) =>
        !(a.productId === event.productId && a.action === 'add_to_cart')
    );
    console.log(
      '5c. After filter - actions:',
      JSON.stringify(updated, null, 2)
    );

    updated.push({
      productId: event.productId,
      shopId: event.shopId,
      action: 'add_to_cart',
      timestamp: event.timestamp,
    });
    console.log('add_to_cart after push', updated);
  }

  if (event.type === 'add_to_wishlist') {
    console.log('5. Processing add_to_wishlist for product:', event.productId);

    // Log before filtering
    console.log(
      '5a. Before filter - actions:',
      JSON.stringify(updated, null, 2)
    );

    const existingCartItem = updated.find(
      (a: any) =>
        a.productId === event.productId && a.action === 'add_to_wishlist'
    );
    console.log('5b. Existing cart item found:', existingCartItem);

    updated = updated.filter(
      (a: any) =>
        !(a.productId === event.productId && a.action === 'add_to_wishlist')
    );
    console.log(
      '5c. After filter - actions:',
      JSON.stringify(updated, null, 2)
    );
    updated.push({
      productId: event.productId,
      shopId: event.shopId,
      action: 'add_to_wishlist',
      timestamp: event.timestamp,
    });
    console.log('add_to_wishlist', updated);
  }

  if (event.type === 'remove_from_cart') {
    updated = updated.filter(
      (a: any) =>
        !(a.productId === event.productId && a.action === 'add_to_cart')
    );
  }

  if (event.type === 'remove_from_wishlist') {
    updated = updated.filter(
      (a: any) =>
        !(a.productId === event.productId && a.action === 'add_to_wishlist')
    );
  }
  if (event.type === 'purchases') {
    updated.push({
      productId: event.productId,
      shopId: event.shopId,
      action: 'purchases',
      timestamp: event.timestamp,
    });
  }

  if (updated.length > 100) {
    updated.shift();
  }

  await prisma.userAnalytics.update({
    where: { userId: event.userId },
    data: { actions: updated },
  });
}

async function handleProductAnalytics(event: AnalyticsEvent) {
  if (!event.productId || !event.shopId) return;

  const updateData: any = {};

  if (event.type === 'product_view') {
    updateData.views = { increment: 1 };
    updateData.lastViewAt = new Date(event.timestamp);
  }

  if (event.type === 'add_to_cart') {
    updateData.cartAdds = { increment: 1 };
  }

  if (event.type === 'remove_from_cart') {
    updateData.cartAdds = { decrement: 1 };
  }

  if (event.type === 'add_to_wishlist') {
    updateData.wishlistAdds = { increment: 1 };
  }

  if (event.type === 'remove_from_wishlist') {
    updateData.wishlistAdds = { decrement: 1 };
  }

  if (event.type === 'purchases') {
    updateData.purchases = { increment: 1 };
  }

  await prisma.productAnalytics.upsert({
    where: { productId: event.productId },
    update: updateData,
    create: {
      productId: event.productId,
      shopId: event.shopId,
      views: event.type === 'product_view' ? 1 : 0,
      cartAdds: event.type === 'add_to_cart' ? 1 : 0,
      wishlistAdds: event.type === 'add_to_wishlist' ? 1 : 0,
      purchases: event.type === 'purchases' ? 1 : 0,
      lastViewAt: new Date(event.timestamp),
    },
  });
}

async function handleShopAnalytics(event: AnalyticsEvent) {
  if (!event.shopId) return;

  const isVisit = event.type === 'shop_visit';

  const shop = await prisma.shopAnalytics.upsert({
    where: { shopId: event.shopId },
    update: {
      ...(isVisit && { totalVisitors: { increment: 1 } }),
      lastVisitedAt: new Date(event.timestamp),
    },
    create: {
      shopId: event.shopId,
      totalVisitors: isVisit ? 1 : 0,
      countryStat: {},
      cityStat: {},
      deviceStat: {},
      lastVisitedAt: new Date(event.timestamp),
    },
  });

  const country = event.country ?? 'Unknown';
  const city = event.city ?? 'Unknown';
  let deviceString: string;
  if (!event.device) {
    deviceString = 'Unknown';
  } else if (typeof event.device === 'string') {
    deviceString = event.device;
  } else {
    // It's a DeviceInfo object, convert to a readable string
    deviceString = `${event.device.deviceType}` || 'unknown';
  }

  const countryStat = getStat(shop.countryStat);
  const cityStat = getStat(shop.cityStat);
  const deviceStat = getStat(shop.deviceStat);

  await prisma.shopAnalytics.update({
    where: { shopId: event.shopId },
    data: {
      countryStat: {
        ...countryStat,
        [country]: (countryStat[country] ?? 0) + 1,
      },
      cityStat: {
        ...cityStat,
        [city]: (cityStat[city] ?? 0) + 1,
      },
      deviceStat: {
        ...deviceStat,
        [deviceString]: (deviceStat[deviceString] ?? 0) + 1,
      },
    },
  });
}

export async function handleAnalyticsEvent(event: any) {
  await Promise.all([
    handleUserAnalytics(event),
    handleProductAnalytics(event),
    handleShopAnalytics(event),
  ]);
}
