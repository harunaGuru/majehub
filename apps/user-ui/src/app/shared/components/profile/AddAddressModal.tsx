import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { countries } from "@/config/constant";
import { axiosInstance } from "@/utils/axiosInstance";
import { isProtected } from "@/utils/isProtected";

const AddAddressModal = ({ onClose }: { onClose: () => void }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: any) => {
      const { data } = await axiosInstance.post(
        "/user/api/add-user-address",
        formData,
        isProtected()
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-address"] });
      onClose();
    },
  });

  const onSubmit = (data: any) => {
    mutate({
      ...data,
      isDefault: data.isDefault === "true",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Add Address</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

          <select
            {...register("label", { required: true })}
            className="w-full border p-2 rounded"
          >
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Others">Other</option>
          </select>
          {errors.label && <span className="text-red-500">Label is required</span>}

          <input
            {...register("name", { required: true })}
            placeholder="Name"
            className="w-full border p-2 rounded"
          />
          {errors.name && <span className="text-red-500">Name is required</span>}

          <input
            {...register("street", { required: true })}
            placeholder="Street Address"
            className="w-full border p-2 rounded"
          />
          {errors.street && <span className="text-red-500">Street is required</span>}

          <input
            {...register("city", { required: true })}
            placeholder="City"
            className="w-full border p-2 rounded"
          />
          {errors.city && <span className="text-red-500">City is required</span>}

          <select
            {...register("country", { required: true })}
            className="w-full border p-2 rounded"
          >
            <option value="">Select country</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.country && <span className="text-red-500">Country is required</span>}

          <input
            {...register("zip", { required: true })}
            placeholder="ZIP Code"
            className="w-full border p-2 rounded"
          />
          {errors.zip && <span className="text-red-500">ZIP Code is required</span>}

          <select
            {...register("isDefault")}
            className="w-full border p-2 rounded"
          >
            <option value="true">Set as Default</option>
            <option value="false">Not Default</option>
          </select>
          {errors.isDefault && <span className="text-red-500">isDefault is required</span>}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAddressModal;
