"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { X, Trash2, Save } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from '@/utils/axiosInstance';

type Social = {
  name: "youtube" | "facebook" | "linkedin";
  value: string;
};

type FormValues = {
  name: string;
  bio: string;
  opening_hours: string;
  address: string;
  website: string;
  socialLinks: Social[];
};

export default function EditProfileModal({
  isOpen,
  onClose,
  initialData,
  sellerProfile,
  onSuccess,
}: any) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: sellerProfile?.name || initialData.name,
      bio: sellerProfile?.bio || initialData.bio,
      opening_hours: sellerProfile?.opening_hours || initialData.opening_hours,
      address: sellerProfile?.address || initialData.address,
      website: sellerProfile?.website || initialData.website,
      socialLinks: sellerProfile?.socialLinks?.length
        ? sellerProfile.socialLinks
        : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "socialLinks",
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      axiosInstance.put("/seller/api/edit-seller-profile", data),

    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["seller-profile"] });
      onSuccess(variables);
      onClose();
    },
    onError: (err) => {
      console.error("Mutation error:", err);
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("FORM DATA:", data);
    mutation.mutate(data);
  };

  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 top-9  bg-black/20 flex justify-center z-50 ">
      <div className="bg-slate-900 h-fit w-full max-w-lg rounded-xl p-6 relative border border-slate-800 z-50">

        <button onClick={onClose} className="absolute top-4 right-4">
          <X />
        </button>

        <h2 className="text-lg font-semibold mb-4">Edit Shop Profile</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div className="flex flex-col gap-1">
            <label>Shop Name</label>
            <input
              {...register("name", { required: "Required" })}
              className="bg-transparent border border-gray-700 focus:outline-none focus:border-gray-700 p-2 rounded-md"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label>Shop Bio</label>
            <textarea
              {...register("bio", {
                required: "Required",
                maxLength: { value: 150, message: "Max 150 words" },
              })}
              className="bg-transparent border border-gray-700 px-2 py-1 focus:outline-none focus:border-gray-700 rounded-md"
            />
            {errors.bio && <p className="text-red-500 text-sm">{errors.bio.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label>Opening Hours</label>
            <input {...register("opening_hours")} className="bg-transparent border border-gray-700 focus:outline-none focus:border-gray-700 p-2 rounded-md" />
            {errors.opening_hours && <p className="text-red-500 text-sm">{errors.opening_hours.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label>Shop Address</label>
            <input {...register("address")} className="bg-transparent border border-gray-700 focus:outline-none focus:border-gray-700 p-2 rounded-md" />
            {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label>Website</label>
            <input {...register("website")} className="bg-transparent border border-gray-700 focus:outline-none focus:border-gray-700 p-2 rounded-md" />
            {errors.website && <p className="text-red-500 text-sm">{errors.website.message}</p>}
          </div>
          <div>
            <label>Social Links</label>

            <div className="space-y-2 mt-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-center">

                  <select
                    {...register(`socialLinks.${index}.name`)}
                    className="bg-black border border-gray-700 px-2 py-2 focus:outline-none focus:border-gray-700 rounded-md"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>

                  <input
                    {...register(`socialLinks.${index}.value`, {
                      required: "Required",
                    })}
                    placeholder="https://..."
                    className="flex-1 bg-black border border-gray-700 px-2 py-2 focus:outline-none focus:border-gray-700 rounded-md"
                  />

                  <button type="button" onClick={() => remove(index)}>
                    <Trash2 size={16} className="text-red-500 cursor-pointer" />
                  </button>
                  {errors.socialLinks?.[index]?.value && <p className="text-red-500 text-sm">{errors.socialLinks[index].value.message}</p>}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => append({ name: "youtube", value: "" })}
              className="mt-2 text-sm text-indigo-400"
            >
              + Add social link
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-indigo-500 py-2 rounded flex items-center justify-center gap-2 cursor-pointer"
            disabled={mutation.isPending}
          >
            <Save size={16} /> {mutation.isPending ? "saving changes..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}