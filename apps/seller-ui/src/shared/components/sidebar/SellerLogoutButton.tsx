'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

import {
    LogOut,
    TriangleAlert,
    Loader2,
    X,
} from 'lucide-react'

import { axiosInstance } from '@/utils/axiosInstance'

const SellerLogoutButton = () => {
    const router = useRouter()

    const [openLogoutModal, setOpenLogoutModal] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleLogout = async () => {
        try {
            setLoading(true)

            await axiosInstance.post('/auth/api/logout-seller')

            toast.success('Logout successful')

            router.replace('/login')
            router.refresh()
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                'Failed to logout'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* SIDEBAR BUTTON */}
            <button
                onClick={() => setOpenLogoutModal(true)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-zinc-300 transition hover:bg-red-500/10 hover:text-red-400"
            >
                <LogOut size={18} />

                <span className="text-sm font-medium">
                    Logout
                </span>
            </button>

            {/* MODAL */}
            {openLogoutModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0B1220] p-6 shadow-2xl">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className="rounded-full bg-red-500/10 p-2">
                                    <TriangleAlert
                                        size={20}
                                        className="text-red-500"
                                    />
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold text-white">
                                        Logout Seller Account
                                    </h2>

                                    <p className="mt-1 text-sm text-zinc-400">
                                        You will need to login again to access
                                        your dashboard.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setOpenLogoutModal(false)}
                                className="text-zinc-500 transition hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                            <p className="text-sm leading-6 text-zinc-300">
                                Are you sure you want to logout from your
                                seller account?
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setOpenLogoutModal(false)}
                                disabled={loading}
                                className="rounded-lg bg-zinc-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleLogout}
                                disabled={loading}
                                className="flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <>
                                        <LogOut size={16} />
                                        Logout
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default SellerLogoutButton