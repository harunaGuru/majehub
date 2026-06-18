import React, { Suspense } from 'react'
import { AppLoader } from '@/shared/components/Apploader';
import HomePage from '@/modules/homePage';

const SellerHomePage = () => {
  return (
    <Suspense fallback={<AppLoader />} >
      <HomePage />
    </Suspense>

  )
}

export default SellerHomePage