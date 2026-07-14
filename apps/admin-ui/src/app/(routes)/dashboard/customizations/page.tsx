"use client"
import { ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/axiosInstance";
import toast from "react-hot-toast";
import Image from "next/image";

const getConfig = async () => {
  const { data } = await axiosInstance.get("/admin/api/site-config");
  return data.data;
};
const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

const CustomizationsPage = () => {
  const [activeTab, setActiveTab] = useState("categories");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const uploadAssetMutation = useMutation({
    mutationFn: (payload: any) =>
      axiosInstance.post("/admin/api/upload-asset", payload),
    onSuccess: (_, Variable) => {
      toast.success(`Asset ${Variable.type} uploaded successfully`);
      queryClient.invalidateQueries({ queryKey: ["site-config"] });

    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Upload failed");
    },
  });

  const handleFileUpload = async (
    file: File,
    type: "logo" | "banner",
    setPreview: (val: string) => void,
    setFile: (file: File | null) => void
  ) => {
    setFile(file);

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    const base64 = await toBase64(file);

    uploadAssetMutation.mutate({
      file: base64,
      fileName: file.name,
      folder: type,
      type,
    });
  };

  // const handleFileChange = async (
  //   e: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   setSelectedFile(file);

  //   const url = URL.createObjectURL(file);
  //   setPreview(url);

  //   const base64 = await toBase64(file);

  //   uploadAssetMutation.mutate({
  //     file: base64,
  //     fileName: file.name,
  //     folder: "logo",
  //   });
  // };

  const { data, isLoading } = useQuery({
    queryKey: ["site-config"],
    queryFn: getConfig,
  });

  const categories = data?.categories || [];
  const subCategories = data?.subCategories || {};
  const logo = data?.avatar;

  const {
    register,
    handleSubmit,
    reset,
  } = useForm();

  const {
    register: registerSub,
    handleSubmit: handleSubmitSub,
    reset: resetSub,
  } = useForm();

  const addCategoryMutation = useMutation({
    mutationFn: (payload: any) =>
      axiosInstance.post("/admin/api/add-category", payload),
    onSuccess: () => {
      toast.success("Category added");
      queryClient.invalidateQueries({ queryKey: ["site-config"] });
      reset();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Error");
    },
  });

  const addSubCategoryMutation = useMutation({
    mutationFn: (payload: any) =>
      axiosInstance.post("/admin/api/add-subcategory", payload),
    onSuccess: () => {
      toast.success("Subcategory added");
      queryClient.invalidateQueries({ queryKey: ["site-config"] });
      resetSub();
    },
  });
  return (
    <div className="min-h-screen w-full flex flex-col p-4 mb-8">
      <h1 className="font-poppins text-white font-semibold text-lg tracking-wide pl-4 lg:pl-0">
        Customizations
      </h1>
      <div className="flex items-center text-white mb-6 pl-4 lg:pl-0">
        <Link href="/dashboard" className="text-blue-500 opacity-80">
          Dashboard
        </Link>
        <span className="opacity-80">
          <ChevronRight size={20} />
        </span>
        <span>Customizations</span>
      </div>

      <div className="border-b border-gray-700 flex gap-6 mb-6">
        {["categories", "logo", "banner"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 capitalize ${activeTab === tab
              ? "border-b-2 border-blue-500 text-white"
              : "text-gray-400"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="animate-spin text-white" size={24} />
        </div>
      ) : activeTab === "categories" && (
        <div className="space-y-6">
          {categories.map((cat: string) => (
            <div key={cat}>
              <h3 className="text-white font-medium capitalize">{cat}</h3>
              <ul className="text-gray-400 list-disc ml-5">
                {(subCategories[cat] || []).map((sub: string) => (
                  <li key={sub}>{sub}</li>
                ))}
              </ul>
            </div>
          ))}
          {/* add category form */}
          <form
            onSubmit={handleSubmit((data) =>
              addCategoryMutation.mutate({ name: data.name })
            )}
            className="flex gap-2"
          >
            <input
              {...register("name", { required: true })}
              placeholder="New Category"
              className="bg-slate-800 px-2 py-1.5 rounded-md border-2 border-slate-600 text-white text-sm"
            />
            <button className="bg-blue-600 px-3 py-1.5 rounded-md border-2 border-slate-600 cursor-pointer text-sm">{addCategoryMutation.isPending ? "Adding..." : "Add Category"}</button>
          </form>
          {/* add subcategory form */}
          <form
            onSubmit={handleSubmitSub((data) =>
              addSubCategoryMutation.mutate(data)
            )}
            className="flex gap-2"
          >
            <select
              {...registerSub("category")}
              className="bg-slate-800 px-2 py-1.5 rounded-md border-2 border-slate-600 text-white text-sm"
            >
              <option value="">Select category</option>
              {categories.map((cat: string) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>

            <input
              {...registerSub("subCategory")}
              placeholder="Add Subcategory"
              className="bg-slate-800 px-2 py-1.5 rounded-md border-2 border-slate-600 text-white text-sm"
            />

            <button className="bg-blue-600 px-3 py-1.5 rounded-md border-2 border-slate-600 cursor-pointer text-sm">
              {addSubCategoryMutation.isPending ? "Adding..." : "Add Subcategory"}
            </button>
          </form>
        </div>
      )}
      {activeTab === "logo" && (
        <div className="space-y-6">
          {/* Logo Preview */}
          <div className="flex flex-col gap-4">
            <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
              <Image
                src={logoPreview || data?.avatar || "/placeholder.png"}
                alt="logo"
                fill
                className="object-cover"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="bg-white text-black py-0.5 px-1 text-xs rounded-sm cursor-pointer">
                Choose file
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(
                        file,
                        "logo",
                        setLogoPreview,
                        setLogoFile
                      );
                    }
                  }}
                  className="hidden"
                />
              </label>

              <span className="text-gray-400 text-sm">
                {uploadAssetMutation.isPending
                  ? "Uploading..."
                  : logoFile?.name || "No file chosen"}
              </span>
            </div>
          </div>
        </div>
      )}
      {activeTab === "banner" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-3">
            <div className="w-72 h-48 relative rounded-lg overflow-hidden bg-slate-800">
              <Image
                src={bannerPreview || data?.banner || "/placeholder.png"}
                alt="banner"
                fill
                className="object-cover"
                sizes="288px"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="bg-white text-black py-0.5 px-1 text-xs rounded-sm cursor-pointer">
                Choose file
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(
                        file,
                        "banner",
                        setBannerPreview,
                        setBannerFile
                      );
                    }
                  }}
                />
              </label>

              <span className="text-gray-400 text-sm">
                {uploadAssetMutation.isPending
                  ? "Uploading..."
                  : bannerFile?.name || "No file chosen"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomizationsPage