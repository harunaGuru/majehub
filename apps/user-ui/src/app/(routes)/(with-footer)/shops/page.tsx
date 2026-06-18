import React, { Suspense } from 'react'
import { AppLoader } from '@/app/shared/components/loaders/AppLoader'
import ShopList from '@/app/shared/module/shopList'

const ShopPage = () => {
  return (
    <Suspense fallback={<AppLoader />}>
      <ShopList />
    </Suspense>
  )
}

export default ShopPage