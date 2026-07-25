"use client";
// import GetSeller from '@/shared/components/GetUser';
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Pencil,
  Star,
  Users,
  Clock,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Linkedin,
  Youtube,
  Facebook,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { axiosInstance } from '@/utils/axiosInstance';
import EditProfileModal from "@/shared/components/Modals/EditProfileModal";
import { useQuery } from "@tanstack/react-query";
import ProductTab from "@/shared/components/ProductTab";
import EventTab from "@/shared/components/EventTab";
import toast from "react-hot-toast";

const tabs = ["products", "offers", "reviews"];

const uploadBanner = async (base64: string, fileName: string) => {
  const { data } = await axiosInstance.patch("/seller/api/update-shop-banner", {
    file: base64,
    fileName,
  });
  return data.data;
};
const uploadLogo = async (base64: string, fileName: string) => {
  const { data } = await axiosInstance.patch("/seller/api/update-shop-avatar", {
    file: base64,
    fileName,
  });
  return data.data;
};

const getSellerProfile = async () => {
  const { data } = await axiosInstance.get("/seller/api/get-seller-profile");
  return data.data;
};

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rating, setRating] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [shopData, setShopData] = useState({
    name: "CodeMart Hub",
    bio: "Your one-stop shop for developer tools, UI kits, and coding resources",
    hours: "Mon-Fri 9am-10pm",
    address: "12 Tech Avenue",
    website: "www.codemarthub.dev",
    socials: [],
    joined: "",
  });
  const [logo, setLogo] = useState(
    "/shop-logo.png"
  );
  const logoRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const initialTab = searchParams.get("tab") || "products";

  const [activeTab, setActiveTab] = useState(initialTab);

  const { data: sellerProfile, isLoading } = useQuery({
    queryKey: ["seller-profile"],
    queryFn: getSellerProfile,
  });

  useEffect(() => {
    if (sellerProfile) {
      setShopData({
        name: sellerProfile?.name || "CodeMart Hub",
        bio: sellerProfile?.bio || "Your one-stop shop for developer tools, UI kits, and coding resources",
        hours: sellerProfile?.opening_hours || "Mon-Fri 9am-10pm",
        address: sellerProfile?.address || "12 Tech Avenue",
        website: sellerProfile?.website || "www.codemarthub.dev",
        socials: sellerProfile?.socialLinks || [],
        joined: sellerProfile?.createdAt || new Date().toISOString(),
      });
      setRating(sellerProfile?.ratings || 0);
      setFollowersCount(sellerProfile?.followersCount || 0);
      setLogo(sellerProfile?.avatar || "/shop-logo.png");
      setCoverImage(sellerProfile?.coverBanner || "/shop-cover-page.png");
    }
  }, [sellerProfile]);

  const [coverImage, setCoverImage] = useState(
    "/shop-cover-page.png"
  );



  useEffect(() => {
    router.push(`?tab=${activeTab}`);
  }, [activeTab, router]);


  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const handleLogoChange = async (file: File) => {
    const preview = URL.createObjectURL(file);
    setLogo(preview);

    const base64 = await toBase64(file);

    try {
      const res = await uploadLogo(base64, file.name);
      if (res?.avatar) {
        toast.success("Logo uploaded successfully");
        setLogo(res?.avatar);
      } else {
        toast.error("Failed to upload logo");
        setLogo("/shop-logo.png");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCoverChange = async (file: File) => {
    const base64 = await toBase64(file);

    setCoverImage(base64);

    try {
      const res = await uploadBanner(base64, file.name);
      if (res?.coverBanner) {
        toast.success("Banner uploaded successfully");
        setCoverImage(res?.coverBanner);
      } else {
        toast.error("Failed to upload banner");
        setCoverImage("/shop-cover-page.png")
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "products":
        return <ProductTab />;

      case "offers":
        return <EventTab />;

      case "reviews":
        return <p className="text-slate-400">No Reviews yet.</p>

      default:
        return <h2>Coming Soon</h2>;
    }
  };
  if (isLoading) {
    return <div className="flex bg-black items-center justify-center h-screen"><Loader2 className="animate-spin text-white size-10" /></div>;
  }

  return (
    <div className="bg-black min-h-screen text-white pb-10 relative">

      {/* back to dashboard */}
      <button className="flex items-center gap-1 text-white text-sm p-2 hover:gap-2 transition-all duration-300" onClick={() => router.push("/dashboard")}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>
      {/* Banner */}
      <div className="relative">
        <Image
          src={coverImage}
          alt="banner"
          width={1200}
          height={300}
          className="w-full h-[150px] sm:h-[220px] md:h-[300px] object-cover"
        />

        <button
          onClick={() => fileRef.current?.click()}
          className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm hover:bg-black transition-colors"
        >
          <Pencil size={14} /> Edit Cover
        </button>

        <input
          ref={fileRef}
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleCoverChange(file);
          }}
        />
      </div>

      {/* Cards Row */}
      <div className="max-w-6xl mx-auto px-4 -mt-12 sm:-mt-20">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Main Card */}
          <div className="flex-1 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row gap-6">
            {/* Logo */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 mx-auto sm:mx-0">
              <Image
                src={logo}
                alt="logo"
                width={96}
                height={96}
                className="rounded-full w-full h-full object-cover bg-white"
              />
              <button onClick={() => logoRef.current?.click()} className="absolute bottom-0 right-0 bg-black/85 hover:bg-black p-1.5 rounded-full shadow-md transition-colors">
                <Pencil size={12} />
              </button>
              <input
                ref={logoRef}
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLogoChange(file);
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 w-full">
              {/* Mobile-only Edit Profile Button */}
              <div className="flex justify-end w-full sm:hidden mb-2">
                <button onClick={() => setOpenModal(true)} className="flex items-center gap-2 text-xs text-white bg-slate-800 px-3 py-1.5 rounded-md hover:bg-slate-700 whitespace-nowrap transition-colors">
                  <Pencil size={14} /> Edit Profile
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-2">
                <h1 className="text-lg sm:text-xl font-semibold truncate text-center sm:text-left">{shopData.name}</h1>
                <button onClick={() => setOpenModal(true)} className="hidden sm:flex w-fit items-center gap-2 text-xs text-white bg-slate-800 px-3 py-1.5 rounded-md hover:bg-slate-700 whitespace-nowrap transition-colors">
                  <Pencil size={14} /> Edit Profile
                </button>
              </div>

              <p className="text-sm text-slate-500 mt-1">
                {shopData.bio}
              </p>

              <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-300">
                <div className="flex items-center gap-1 text-slate-400">
                  <Star size={16} className=" text-yellow-400 fill-yellow-400" /> {rating > 0 ? rating : "N/A"}
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Users size={16} className="text-slate-500" /> {followersCount} followers
                </div>
              </div>
              <div className="flex items-center text-slate-500 gap-1 mt-2">
                <Clock size={16} /> {shopData.hours}
              </div>
              <div className="flex items-center text-slate-500 gap-1 mt-1">
                <MapPin size={16} /> {shopData.address}
              </div>
            </div>



          </div>

          {/* Side Card */}
          <div className="flex-1 md:w-[300px] bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-8 text-sm text-slate-300 space-y-3">
            <h1 className="text-md font-semibold">Shop Details</h1>
            <div className="flex items-center gap-2">
              <Calendar size={16} /> Joined: {new Date(shopData.joined).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <LinkIcon size={16} /> {shopData.website}
            </div>
            <div className="flex gap-3 mt-3 ">
              {shopData?.socials?.map((s: any, i: number) => (
                <a key={i} href={s.value} target="_blank">
                  {s.name === "youtube" && <Youtube size={18} />}
                  {s.name === "facebook" && <Facebook size={18} />}
                  {s.name === "linkedin" && <Linkedin size={18} />}
                </a>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 mt-8">
        <div className="border-b border-slate-800">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="relative py-3 text-sm capitalize"
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-indigo-500"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mt-6 min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <EditProfileModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        initialData={shopData}
        sellerProfile={sellerProfile || {}}
        onSuccess={(data: any) => setShopData(data)}
      />
    </div>
  );
}