import React, { Suspense } from 'react'
import CheckoutPage from '../shared/module/checkout'
import { AppLoader } from '../shared/components/loaders/AppLoader'

const Checkout = () => {
  return (
    <Suspense fallback={<AppLoader />}>
      <CheckoutPage />
    </Suspense>
  )
}

export default Checkout