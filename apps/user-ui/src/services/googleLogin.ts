import { signInWithGoogle } from '@/lib/googleAuth';
import { axiosInstance } from '@/utils/axiosInstance';

export const loginWithGoogle = async () => {
  const { token } = await signInWithGoogle();

  const response = await axiosInstance.post('/auth/api/google-login', {
    token,
  });

  return response.data;
};
