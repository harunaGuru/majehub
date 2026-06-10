"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ShoppingBag,
  Inbox,
  Bell,
  MapPin,
  Lock,
  LogOut,
  Clock,
  Truck,
  CircleCheckBig,
  Gift,
  Award,
  Settings,
  Menu,
  PhoneCall,
  Receipt,
  X,
  Loader2
} from "lucide-react";
import { useAuthUser } from "@/hooks/useAuthUser";
import ProfileOverview from "@/app/shared/components/profile/ProfileOverview";
import ShippingAddress from "@/app/shared/components/profile/ShippingAddress";
import ChangePassword from "@/app/shared/components/profile/ChangePassword";
import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/axiosInstance";
import { isProtected } from "@/utils/isProtected";
import UsersOrders from "@/app/shared/components/profile/UsersOrders";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import UserNotifications from "@/app/shared/components/profile/UserNotifications";


const sidebarLinks = [
  { name: "Profile", key: "profile", icon: User },
  { name: "My Orders", key: "orders", icon: ShoppingBag },
  { name: "Inbox", key: "inbox", icon: Inbox },
  { name: "Notifications", key: "notifications", icon: Bell },
  { name: "Shipping Address", key: "address", icon: MapPin },
  { name: "Change Password", key: "password", icon: Lock },
];
const logout = async () => {
  await axiosInstance.post("/auth/api/logout-user")
}
export default function ProfilePage() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthUser()
  const [activeTab, setActiveTab] = useState("profile");
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const router = useRouter();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/order/api/user-orders", isProtected())
      return data
    }
  });


  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab) setActiveTab(tab);
  }, []);

  // const handleTabChange = (tab: string) => {
  //   setActiveTab(tab);
  //   if (tab !== "profile") {
  //     window.history.pushState(null, "", `?tab=${tab}`);
  //   } else {
  //     window.history.pushState(null, "", `/profile`);
  //   }
  // };

  const handleTabChange = (tab: string) => {
    if (tab === "inbox") {
      router.push("/inbox");
      return;
    }

    setActiveTab(tab);

    if (tab !== "profile") {
      window.history.pushState(null, "", `?tab=${tab}`);
    } else {
      window.history.pushState(null, "", `/profile`);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileOverview user={user} />;

      case "orders":
        return <UsersOrders orders={orders?.orders || []} isLoading={isLoading} />;

      case "notifications":
        return <UserNotifications />

      case "address":
        return <ShippingAddress />;

      case "password":
        return <ChangePassword />;

      default:
        return <h2>Coming Soon</h2>;
    }
  };

  const { mutateAsync: logoutUser, isPending } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast.success("Logout successfully")
      setLogoutModalOpen(false)
      window.location.href = "/login";
    },
    onError: (error: any) => {
      setLogoutModalOpen(false)
      toast.error(error?.response?.data?.message || "Logout failed")
    }
  });

  const LogoutModal = () => {
    if (!isLogoutModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        <div className="relative w-full max-w-md bg-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-2">
            Confirm Logout
          </h2>

          <p className="text-sm text-gray-400">
            Are you sure you want to log out?
          </p>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setLogoutModalOpen(false)}
              className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600"
            >
              Cancel
            </button>

            <button
              onClick={() => logoutUser()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              {isPending ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="bg-gray-200 min-h-screen py-10">
      <div className="w-[90%] lg:w-[80%] mx-auto">

        {/* WELCOME */}
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
            Welcome back{" "}
            <span className="text-blue-600 capitalize font-poppins">{user?.name || "User"}</span> 👋
          </h1>
        </div>

        {/* TOP CARDS */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">

          {/* TOTAL */}
          <div className="bg-white p-6 rounded-xl shadow-sm flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <h2 className="text-xl font-bold text-gray-900">
                {isLoading ? <Loader2 className="animate-spin" /> : orders?.summary?.totalOrders || 0}
              </h2>
            </div>
            <Clock className="text-blue-600" />
          </div>

          {/* PROCESSING */}
          <div className="bg-white p-6 rounded-xl shadow-sm flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Processing Orders</p>
              <h2 className="text-xl font-bold text-gray-900">
                {isLoading ? <Loader2 className="animate-spin" /> : orders?.summary?.processingOrders || 0}
              </h2>
            </div>
            <Truck className="text-blue-600" />
          </div>

          {/* COMPLETED */}
          <div className="bg-white p-6 rounded-xl shadow-sm flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Completed Orders</p>
              <h2 className="text-xl font-bold text-gray-900">
                {isLoading ? <Loader2 className="animate-spin" /> : orders?.summary?.completedOrders || 0}
              </h2>
            </div>
            <CircleCheckBig className="text-blue-600" />
          </div>
        </div>
        {/* MOBILE TOP BAR */}
        <div className="lg:hidden flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-900">Dashboard</h2>
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg bg-white shadow-sm"
          >
            <Menu size={20} />
          </button>
        </div>
        {/* OVERLAY */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* DRAWER */}
        <div
          className={`fixed top-0 left-0 h-full w-[75%] max-w-[280px] bg-white z-50 shadow-lg transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="p-4 flex justify-between items-center border-b">
            <h3 className="font-semibold">Menu</h3>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="p-4 space-y-2">
            {sidebarLinks.map((link) => {
              const isActive = activeTab === link.key;
              const Icon = link.icon;

              return (
                <button
                  key={link.name}
                  onClick={() => { handleTabChange(link.key); setIsOpen(false); }}
                  className={`flex w-full items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                    }`}
                >
                  <Icon size={18} />
                  <span>{link.name}</span>
                </button>
              );
            })}

            {/* LOGOUT */}
            <button onClick={() => setLogoutModalOpen(true)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 w-full">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-[230px_1fr_270px] gap-6 items-stretch">

          {/* SIDEBAR */}
          <div className="hidden lg:flex bg-white rounded-xl shadow-sm p-4 flex-col h-full">
            <div className="space-y-2 flex-1">
              {sidebarLinks.map((link) => {
                const isActive = activeTab === link.key;
                const Icon = link.icon;

                return (
                  <button
                    key={link.name}
                    onClick={() => handleTabChange(link.key)}
                    className={`flex w-full font-semibold text-sm items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                      }`}
                  >
                    <Icon size={18} />
                    <span>{link.name}</span>
                  </button>
                );
              })}
            </div>

            {/* LOGOUT */}
            <button onClick={() => setLogoutModalOpen(true)} className="flex mb-24 items-center gap-3 font-semibold text-sm px-4 py-3 rounded-lg text-red-500 hover:bg-red-50">
              <LogOut size={18} />
              Logout
            </button>
          </div>

          {/* MAIN CONTENT */}
          <div className="bg-white rounded-xl shadow-sm p-6 h-full overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="h-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHTBAR */}
          <div className="flex flex-col gap-4 h-full text-sm">

            {[
              {
                icon: Gift,
                title: "Referral Program",
                sub: "Invite friends and earn rewards",
              },
              {
                icon: Award,
                title: "Your Badges",
                sub: "View your earned achievements",
              },
              {
                icon: Settings,
                title: "Account Settings",
                sub: "Manage preferences and security",
              },
              {
                icon: Receipt,
                title: "Billing History",
                sub: "Check your recent payments",
              },
              {
                icon: PhoneCall,
                title: "Support Center",
                sub: "Need help? Contact support",
              },
            ].map((item, i) => {
              const Icon = item.icon;

              return (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm p-4 flex items-start gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex-1"
                >
                  <Icon className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-500">{item.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
        {isLogoutModalOpen && <LogoutModal />}
      </div>
    </div>
  );
}