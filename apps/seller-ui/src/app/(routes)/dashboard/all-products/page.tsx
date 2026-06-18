import React, { Suspense } from 'react'
import ProdcutsPage from '@/modules/homePage/products'
import { AppLoader } from '@/shared/components/Apploader';

const AllProductsPage = () => {
  return (
    <Suspense fallback={<AppLoader />}>
      <ProdcutsPage />
    </Suspense>
  )
}

export default AllProductsPage