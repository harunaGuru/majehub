'use client';

import GoogleIcon from '@/assets/svgs/google-icon';
import { loginWithGoogle } from '@/services/googleLogin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

const GoogleButton = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: loginWithGoogle,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['user'],
      });

      router.push('/');
    },
  });

  return (
    <button
      onClick={() => mutation.mutate()}
      className="bg-blue-400/15 p-2 flex gap-2 items-center cursor-pointer rounded-md hover:bg-blue-400/60"
    >
      <GoogleIcon width={20} height={20} />

      <span className="text-sm font-normal">
        {mutation.isPending
          ? 'Signing in...'
          : 'Sign in with Google'}
      </span>
    </button>
  );
};

export default GoogleButton;