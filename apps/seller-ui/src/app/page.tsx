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

const tabs = ["products", "offers", "reviews"];

const uploadBanner = async (base64: string, fileName: string) => {
  const { data } = await axiosInstance.post("/seller/api/update-shop-banner", {
    file: base64,
    fileName,
  });
  return data.data;
};
const uploadLogo = async (base64: string, fileName: string) => {
  const { data } = await axiosInstance.post("/seller/api/update-shop-avatar", {
    file: base64,
    fileName,
  });
  return data.data;
};

const getSellerProfile = async () => {
  const { data } = await axiosInstance.get("/seller/api/get-seller-profile");
  return data.data;
};

export default function SellerHomePage() {
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
        // toast.success("Logo uploaded successfully");
        setLogo(res?.avatar);
      } else {
        // toast.error("Failed to upload logo");
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
        setCoverImage(res?.coverBanner);
      } else {
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
          className="w-full h-[300px] object-cover"
        />

        <button
          onClick={() => fileRef.current?.click()}
          className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-2 rounded-md text-sm hover:bg-black"
        >
          <Pencil size={16} /> Edit Cover
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
      <div className="max-w-6xl mx-auto px-4 -mt-20">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Main Card */}
          <div className="flex-1 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-6 flex gap-6">
            {/* Logo */}
            <div className="relative">
              <Image
                src={logo}
                alt="logo"
                width={96}
                height={96}
                className="rounded-full w-20 h-20 bg-white"
              />
              <button onClick={() => logoRef.current?.click()} className="absolute bottom-16 md:bottom-20 right-2 bg-black p-1 rounded-full">
                <Pencil size={14} />
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
            <div className="flex-1 relative">
              <button onClick={() => setOpenModal(true)} className="absolute -top-3 right-0 flex items-center gap-2 text-sm text-white bg-black/60 px-3 py-2 rounded-md hover:bg-black">
                <Pencil size={16} /> Edit Profile
              </button>

              <h1 className="text-md font-semibold">{shopData.name}</h1>
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
              <div className="flex items-center text-slate-500 gap-1">
                <Clock size={16} /> {shopData.hours}
              </div>
              <div className="flex items-center text-slate-500 gap-1">
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