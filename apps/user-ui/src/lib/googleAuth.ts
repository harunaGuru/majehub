import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();

  const result = await signInWithPopup(auth, provider);

  const token = await result.user.getIdToken();

  return {
    token,
    user: result.user,
  };
};
