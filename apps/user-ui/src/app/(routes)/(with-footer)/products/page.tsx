import React, { Suspense } from 'react'
import { AppLoader } from '@/app/shared/components/loaders/AppLoader'
import ProductList from '@/app/shared/module/productList'
const ProductPage = () => {
  return (
    <Suspense fallback={<AppLoader />}>
      <ProductList />
    </Suspense>
  )
}

export default ProductPage