import React from 'react'
import { AppLoader } from '@/app/shared/components/loaders/AppLoader'
import { Suspense } from 'react'
import InboxPage from '@/app/shared/module/inbox'

const Inbox = () => {
  return (
    <Suspense fallback={<AppLoader />}>
      <InboxPage />
    </Suspense>
  )
}

export default Inbox