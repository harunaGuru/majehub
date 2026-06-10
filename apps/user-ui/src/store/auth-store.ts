import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

interface AuthState {
  loggedIn: boolean;
  setLoggedIn: (value: boolean) => void;
}

// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set) => ({
//       loggedIn: false,

//       setLoggedIn: (value: boolean) =>
//         set(() => ({
//           loggedIn: value,
//         })),
//     }),
//     {
//       name: 'auth-storage', // localStorage key
//     }
//   )
// );

export const useAuthStore = create<AuthState>((set) => ({
  loggedIn: false,
  setLoggedIn: (value) => set({ loggedIn: value }),
}));
