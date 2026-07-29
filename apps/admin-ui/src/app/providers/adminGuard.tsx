'use client';

import React from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useRouter } from "next/navigation";

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { admin, isLoading, isError } = useAdmin();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center bg-black justify-center text-white">
        <div className="animate-spin w-12 h-12 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isError || !admin) {
    router.replace("/");
    return null;
  }

  return <>{children}</>;
};

export default AdminGuard;
