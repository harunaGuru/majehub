import React, { Suspense } from 'react'
import { AppLoader } from '@/shared/components/Apploader';
import InboxPage from '@/modules/inbox';

const Inbox = () => {
  return (
    <Suspense fallback={<AppLoader />}>
      <InboxPage />
    </Suspense>
  )
}

export default Inbox