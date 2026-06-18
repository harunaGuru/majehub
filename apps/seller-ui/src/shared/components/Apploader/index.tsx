import React from 'react'
import { Loader2 } from 'lucide-react'

export const AppLoader = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-white z-[9999999]" >
      <Loader2 className='animate-spin' />
    </div>
  )
}
