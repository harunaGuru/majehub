import React, { Suspense } from 'react'
import OffersList from '@/app/shared/module/OfferList'
import { AppLoader } from '@/app/shared/components/loaders/AppLoader'

const OffersPage = () => {
  return (
    <Suspense fallback={<AppLoader />}>
      <OffersList />
    </Suspense>
  )
}

export default OffersPage