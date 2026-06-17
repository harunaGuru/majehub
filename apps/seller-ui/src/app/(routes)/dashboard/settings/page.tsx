'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import toast from 'react-hot-toast'

import {
  Bell,
  ChevronRight,
  Save,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  Globe,
  Wallet,
  X,
  Loader2,
} from 'lucide-react'
import { axiosInstance } from '@/utils/axiosInstance'

const tabs = ['General', 'Custom Domains', 'Withdraw Method']

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('General')

  const [openSection, setOpenSection] = useState<
    'stock' | 'notification' | null
  >(null)

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // shop state
  const [isShopDeleted, setIsShopDeleted] = useState(false)
  const [loadingDeleteAction, setLoadingDeleteAction] = useState(false)

  const toggleSection = (section: 'stock' | 'notification') => {
    setOpenSection((prev) => (prev === section ? null : section))
  }

  // DELETE / RESTORE SHOP
  const handleDeleteRestoreShop = async () => {
    try {
      setLoadingDeleteAction(true)

      // optimistic update
      const previousState = isShopDeleted
      setIsShopDeleted(!previousState)

      const endpoint = previousState
        ? '/seller/api/restore-shop'
        : '/seller/api/delete-shop'

      const successMessage = previousState
        ? 'Shop restored successfully'
        : 'Shop deleted successfully'

      await axiosInstance.put(endpoint)

      toast.success(successMessage)

      // close modal after successful delete
      if (!previousState) {
        setShowDeleteModal(false)
      }
    } catch (error: any) {
      // revert optimistic update on failure
      setIsShopDeleted((prev) => !prev)

      toast.error(
        error?.response?.data?.message ||
        'Something went wrong, please try again'
      )
    } finally {
      setLoadingDeleteAction(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-black px-4 py-6 text-white">
      {/* Header */}
      <div className="">
        <h1 className="font-poppins text-2xl font-semibold tracking-wide pl-10 lg:pl-0">
          Settings
        </h1>

        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-zinc-400 pl-10 lg:pl-0">
          <Link
            href="/dashboard"
            className="text-blue-500 transition hover:opacity-80"
          >
            Dashboard
          </Link>

          <ChevronRight size={16} className="mx-1" />

          <span>Settings</span>
        </div>
      </div>

      {/* Body */}
      <div className="mt-10 w-full">
        {/* Tabs */}
        <div className="w-full border-b border-zinc-800">
          <div className="w-full lg:w-[40%]">
            <div className="flex items-center gap-10">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative pb-4 text-sm font-medium transition ${activeTab === tab
                    ? 'text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                  {tab}

                  {activeTab === tab && (
                    <div className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8 w-full lg:w-[40%]">
          {/* GENERAL TAB */}
          {activeTab === 'General' && (
            <div className="flex flex-col gap-10">
              {/* SECTION 1 */}
              <div className="border-b border-zinc-800 pb-8">
                {/* Low Stock */}
                <div>
                  <button
                    onClick={() => toggleSection('stock')}
                    className="flex w-full items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <Bell
                        size={20}
                        className="mt-1 shrink-0 text-zinc-400"
                      />

                      <div className="text-left">
                        <h3 className="text-sm font-semibold text-white">
                          Low Stock Alert Threshold
                        </h3>

                        <p className="mt-1 text-sm text-zinc-500">
                          Get notified when stock falls below the set limit.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`transition duration-300 ${openSection === 'stock' ? 'rotate-90' : ''
                        }`}
                    >
                      <ChevronRight
                        size={20}
                        className="text-zinc-400"
                      />
                    </div>
                  </button>

                  {openSection === 'stock' && (
                    <div className="mt-5 border-t border-zinc-800 pt-5">
                      <label className="text-sm text-zinc-300">
                        Threshold value
                      </label>

                      <input
                        type="text"
                        defaultValue="10"
                        className="mt-3 h-11 w-full rounded-md border border-zinc-800 bg-black px-4 text-sm outline-none transition focus:border-blue-500"
                      />

                      <button
                        onClick={() => setOpenSection(null)}
                        className="mt-4 flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium transition hover:bg-blue-700"
                      >
                        <Save size={16} />
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>

                {/* Notification Preferences */}
                <div className="mt-8">
                  <button
                    onClick={() => toggleSection('notification')}
                    className="flex w-full items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <ShieldCheck
                        size={20}
                        className="mt-1 shrink-0 text-zinc-400"
                      />

                      <div className="text-left">
                        <h3 className="text-sm font-semibold text-white">
                          Order Notification Preferences
                        </h3>

                        <p className="mt-1 text-sm text-zinc-500">
                          Choose how you receive order notifications (Email,
                          Web, App).
                        </p>
                      </div>
                    </div>

                    <div
                      className={`transition duration-300 ${openSection === 'notification' ? 'rotate-90' : ''
                        }`}
                    >
                      <ChevronRight
                        size={20}
                        className="text-zinc-400"
                      />
                    </div>
                  </button>

                  {openSection === 'notification' && (
                    <div className="mt-5 border-t border-zinc-800 pt-5">
                      <select
                        className="h-11 w-full rounded-md border border-zinc-800 bg-black px-4 text-sm outline-none transition focus:border-blue-500"
                        defaultValue="Email"
                      >
                        <option>Email</option>
                        <option>Web push notification</option>
                        <option>App push notification</option>
                        <option>All of the above</option>
                      </select>

                      <button
                        onClick={() => setOpenSection(null)}
                        className="mt-4 flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium transition hover:bg-blue-700"
                      >
                        <Save size={16} />
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 2 */}
              <div>
                {/* Danger Zone */}
                <div className="flex items-center gap-2">
                  <ShieldAlert size={20} className="text-red-500" />

                  <h2 className="text-xl font-semibold text-red-500">
                    Danger Zone
                  </h2>
                </div>

                {/* Delete Shop */}
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="mt-6 flex w-full items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <Trash2
                      size={20}
                      className="mt-1 shrink-0 text-zinc-400"
                    />

                    <div className="text-left">
                      <h3 className="text-sm font-semibold text-white">
                        Delete Shop
                      </h3>

                      <p className="mt-1 text-sm text-red-500">
                        Deleting your shop is irreversible. Proceed with
                        caution.
                      </p>
                    </div>
                  </div>

                  <ChevronRight size={20} className="text-zinc-400" />
                </button>
              </div>
            </div>
          )}

          {/* CUSTOM DOMAIN TAB */}
          {activeTab === 'Custom Domains' && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="flex items-center gap-3">
                <Globe className="text-blue-500" size={22} />

                <h2 className="text-lg font-semibold">Custom Domains</h2>
              </div>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Connect your own custom domain to your seller store.
              </p>
            </div>
          )}

          {/* WITHDRAW METHOD TAB */}
          {activeTab === 'Withdraw Method' && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="flex items-center gap-3">
                <Wallet className="text-blue-500" size={22} />

                <h2 className="text-lg font-semibold">Withdraw Method</h2>
              </div>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Manage your withdrawal and payout methods.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0b1220] p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trash2 size={22} className="text-red-500" />

                <h2 className="text-xl font-semibold text-white">
                  Delete Shop
                </h2>
              </div>

              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-zinc-400 transition hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="mt-6 space-y-5">
              <p className="text-sm leading-7 text-zinc-300">
                Deleting your shop is a{' '}
                <span className="font-semibold text-white">
                  permanent action
                </span>
                . However, you have{' '}
                <span className="font-semibold text-white">28 days</span> to
                restore your shop before it is permanently removed.
              </p>

              <div className="flex items-start gap-2">
                <TriangleAlert
                  size={18}
                  className="mt-1 shrink-0 text-yellow-400"
                />

                <p className="text-sm leading-7 text-zinc-300">
                  <span className="font-semibold text-yellow-400">
                    Important:
                  </span>{' '}
                  Once the shop is permanently deleted, you{' '}
                  <span className="font-semibold text-white">cannot</span>{' '}
                  create a new account with the same email in the future.
                </p>
              </div>

              <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4">
                <p className="text-sm leading-7 text-yellow-200">
                  You can restore your shop within{' '}
                  <span className="font-semibold">28 days</span> from the date
                  of deletion. After that, it will be permanently removed.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={loadingDeleteAction}
                className="rounded-md bg-zinc-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteRestoreShop}
                disabled={loadingDeleteAction}
                className={`flex min-w-[150px] items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${isShopDeleted
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                {loadingDeleteAction ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    {isShopDeleted ? 'Restore Shop' : 'Confirm Delete'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPage