'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { useSeller } from '@/hooks/useSeller'

interface Props {
    children: React.ReactNode
}

const SellerProtectedLayout = ({ children }: Props) => {
    const router = useRouter()

    const {
        seller,
        isLoading,
        isFetching,
        isError,
    } = useSeller()

    useEffect(() => {
        if (!isLoading && !isFetching) {
            if (isError || !seller) {
                router.replace('/login')
            }
        }
    }, [
        seller,
        isLoading,
        isFetching,
        isError,
        router,
    ])

    // Fullscreen loader
    if (isLoading || isFetching) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-black">
                <Loader2
                    size={30}
                    className="animate-spin text-blue-500"
                />
            </div>
        )
    }

    // Prevent flashing before redirect
    if (!seller || isError) {
        return null
    }

    return <>{children}</>
}

export default SellerProtectedLayout