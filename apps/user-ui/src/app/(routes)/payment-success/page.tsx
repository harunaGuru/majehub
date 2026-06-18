import PaymentSuccess from '@/app/shared/module/payment';
import React, { Suspense } from 'react'
import { AppLoader } from '@/app/shared/components/loaders/AppLoader';

const PaymentSuccessPage = () => {
  return (
    <Suspense fallback={<AppLoader />}>
      <PaymentSuccess />
    </Suspense>
  )
}

export default PaymentSuccessPage