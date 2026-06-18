import React, { Suspense } from 'react'
import EventPage from '@/modules/events'
import { AppLoader } from '@/shared/components/Apploader';

const Page = () => {
  return (
    <Suspense fallback={<AppLoader />} >
      <EventPage />
    </Suspense>
  )
}

export default Page