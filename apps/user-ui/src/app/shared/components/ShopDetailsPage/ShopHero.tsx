import Image from "next/image";
import { Star, MapPin, Clock, Calendar, Globe, Facebook, Twitter, Linkedin, Users, Heart } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from '@/utils/axiosInstance';
import { isProtected } from "@/utils/isProtected";
import { useEffect, useState } from "react";

const followShopApi = (shopId: string) =>
  axiosInstance.post(`/seller/api/follow-shop`, {
    shopId
  }, isProtected());

const unFollowShopApi = (shopId: string) =>
  axiosInstance.post(`/seller/api/unfollow-shop`, {
    shopId
  }, isProtected());

export default function ShopHero({ shopData, followersCount }: { shopData: any, followersCount: number }) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [followers, setFollowers] = useState(followersCount)
  const queryClient = useQueryClient()

  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!shopData.id) return
      try {
        const res = await axiosInstance.get(`/seller/api/is-following/${shopData.id}`, isProtected());
        setIsFollowing(res.data.isFollowing);
      } catch (error) {
        console.log("Error fetching follow status", error);
      }
    }
    fetchFollowStatus();
  }, [shopData?.id])


  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        return unFollowShopApi(shopData.id);
      } else {
        return followShopApi(shopData.id);
      }
    },
    onSuccess: () => {
      setIsFollowing((prev) => !prev);
      setFollowers(isFollowing ? followers - 1 : followers + 1);
      queryClient.invalidateQueries({ queryKey: ["is-following", shopData.id] })
    }
  });

  const toggleFollow = () => {
    mutate()
  };

  const shop = {
    name: "Premium Auto Hub",
    bio: "Explore our full collection of premium products crafted for quality and performance. From everyday essentials to exclusive finds, shop confidently with secure checkout and hassle-free delivery. Your next favorite item is just a click away.",
    ratings: 4.8,
    opening_hours: "Mon-Sat 9am-6pm",
    address: "Lagos, Nigeria",
    createdAt: "2026-01-01",
    website: "https://premiumautohub.com",
    avatar: "https://ik.imagekit.io/3k74bqena/products/Liceria.png",
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
      "https://images.unsplash.com/photo-1493238792000-8113da705763",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c"
    ]
  };

  return (
    <>
      <div className="w-full bg-black text-white pb-6">
        {/* HERO */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 flex flex-col sm:flex-row gap-6">
          {/* LEFT — images */}
          <div className="flex-1">
            <div className="relative w-full h-52 sm:h-64">
              <Image src={shop.images[0]} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" alt={shop.name} fill className="object-cover rounded-b-md" />
            </div>

            <div className="flex gap-2 mt-2">
              {shop.images.map((img, i) => (
                <div key={i} className="relative w-1/3 h-16 sm:h-20">
                  <Image src={img} sizes="(max-width: 640px) 33.33vw, (max-width: 1024px) 33.33vw, 33.33vw" alt={`thumb-${i}`} fill className="object-cover rounded-md" />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — bio / tags */}
          <div className="flex-1 flex flex-col gap-3 sm:pt-8">
            <p className="text-gray-300/60 text-sm sm:text-base">{shop.bio}</p>
            <p className="font-semibold text-sm">Tags</p>
            <div className="flex flex-wrap gap-2">
              {["luxury", "AI", "Photo", "Arts"].map((tag) => (
                <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-xs sm:text-sm">#{tag}</span>
              ))}
            </div>
            <button className="px-4 mt-3 sm:mt-5 h-8 w-fit cursor-default rounded-md text-xs font-normal transition flex items-center justify-center gap-1 bg-[#1DB81D] text-white">
              Buy now $112
            </button>
          </div>
        </div>
      </div>

      {/* OVERLAY CARD */}
      <div className="max-w-6xl mx-auto z-10 px-4 sm:px-8 lg:px-10">
        {/* -mt offset only on sm+ so it doesn't break mobile */}
        <div className="py-4 sm:p-6 sm:-mt-[70px] flex flex-col sm:flex-row gap-4 text-black">

          {/* LEFT INFO */}
          <div className="flex-1 flex flex-col sm:flex-row gap-4 bg-white/20 backdrop-blur-xl border border-white/20 shadow-xl p-4 sm:p-5 rounded-2xl">
            <div className="flex gap-3 items-start">
              <div className="relative shrink-0 w-12 h-12">
                <Image src={shopData?.avatar || "/shop-logo.jpg"} sizes="48px" alt={shopData?.name} fill className="rounded-full object-cover" />
              </div>

              <div className="flex flex-1 flex-col font-jost tracking-wide gap-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg sm:text-xl font-semibold font-poppins tracking-tighter leading-tight">{shopData?.name}</h3>
                  {/* Follow button — inline with name on mobile */}
                  <button
                    onClick={toggleFollow}
                    disabled={isPending}
                    className={`shrink-0 px-3 h-8 cursor-pointer rounded-lg text-xs font-normal transition flex items-center justify-center gap-1 ${isFollowing ? "bg-red-500 text-white" : "bg-blue-600 text-white"}`}
                  >
                    <Heart size={13} className={isFollowing ? "text-white fill-red-500" : "text-white"} />
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">{shopData?.bio}</p>

                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1 text-blue-500">
                    <Star className='text-blue-500 fill-blue-500' size={13} /> {shopData?.ratings ?? "N/A"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={13} />
                    <span className="font-semibold">{followers} followers</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={13} /> <span className="truncate">{shopData?.opening_hours}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={13} /> <span className="truncate">{shopData?.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT DETAILS */}
          <div className="w-full sm:w-[260px] bg-white/20 backdrop-blur-xl border border-white/20 shadow-xl p-4 sm:p-5 rounded-2xl shrink-0">
            <h4 className="font-semibold text-base sm:text-lg font-poppins tracking-tighter">Shop Details</h4>

            <div className="flex flex-col gap-2 text-sm text-gray-600 mt-2">
              <span className="flex items-center gap-2">
                <Calendar size={13} /> Joined {new Date(shopData?.createdAt).toDateString()}
              </span>
              <span className="flex items-center gap-2 min-w-0">
                <Globe size={13} className="shrink-0" />
                <a className="text-blue-500 truncate" href={shopData?.website} target="_blank" rel="noopener noreferrer">
                  {shopData?.website}
                </a>
              </span>
              <h3 className="font-semibold font-poppins tracking-tighter mt-1">Follow us</h3>
              <div className="flex items-center gap-3">
                <Facebook fill="black" size={16} className="cursor-pointer" />
                <Twitter fill="black" size={16} className="cursor-pointer" />
                <Linkedin fill="black" size={16} className="cursor-pointer" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}