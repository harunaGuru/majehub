import { useForm } from 'react-hook-form';
import { Product } from '@/config/types';


interface Props {
  product: Product;
  onClose: () => void;
}

export const EditProductModal = ({ product, onClose }: Props) => {
  const { register, handleSubmit } = useForm<Product>({
    defaultValues: product,
  });

  const onSubmit = (data: Product) => {
    console.log(data);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96">
        <form onSubmit={handleSubmit(onSubmit)}>
          <input {...register('title')} className="border p-2 w-full mb-4" />
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Save
          </button>
        </form>
      </div>
    </div>
  );
};
