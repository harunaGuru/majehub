"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "@/utils/axiosInstance";
import Image from "next/image";
import { isProtected } from "@/utils/isProtected";

export default function ProfileOverview({ user }: any) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const MAX_SIZE = 2 * 1024 * 1024; // 2MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  const handleFileChange = async (e: any) => {
    const file = e.target.files[0];
    if (!file || loading) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      return toast.error("Only JPG, PNG, WEBP allowed");
    }

    if (file.size > MAX_SIZE) {
      return toast.error("Image must be less than 2MB");
    }

    const oldImage = user?.avatar?.fileUrl || "/avatar.webp";

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      setLoading(true);

      const base64 = await toBase64(file);

      await axiosInstance.post("/user/api/upload-avatar", {
        file: base64,
        fileName: file.name,
        folder: "user",
      }, {
        ...isProtected(),
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total || progressEvent.total <= 0) return;

          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        },
      });

      toast.success("Profile image updated");
      // refetch();

    } catch (error) {
      setPreview(oldImage || null);
      toast.error("Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Profile</h2>

      {/* AVATAR */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <Image
            src={preview || user?.avatar?.fileUrl || "/avatar.webp"}
            alt="avatar"
            width={64}
            height={64}
            className="w-18 h-18 rounded-full object-cover"
          />

          <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full cursor-pointer">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Pencil className="text-white" size={16} />
            )}
            <input
              type="file"
              hidden
              onChange={handleFileChange}
            />
          </label>
        </div>

        <p className="text-blue-600 text-sm">
          Change profile
        </p>
      </div>
      {/* {loading && (
        <div className="mt-2 w-full max-w-[250px]">
          <div className="flex justify-between text-xs mb-1">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )} */}
      {/* DETAILS */}
      <div className="space-y-3 text-sm">
        <p className="capitalize"><strong>Name:</strong> {user?.name || "User name"}</p>
        <p><strong>Email:</strong> {user?.email || "User email"}</p>
        <p>
          <strong>Joined:</strong>{" "}
          {new Date(user?.createdAt || Date.now()).toDateString()}
        </p>
        <p><strong>Earned Points:</strong> 0</p>
      </div>
    </div>
  );
}

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });