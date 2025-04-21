"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrganizationReportsPage() {
  const router = useRouter();

  useEffect(() => {
    // Kullanıcıyı organizasyonlar sayfasına yönlendir
    router.replace("/organizations");
  }, [router]);

  return (
    <div className="container py-12 px-4 md:px-8">
      <div className="flex flex-col items-center justify-center space-y-4 min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-muted-foreground">Yönlendiriliyor...</p>
      </div>
    </div>
  );
}
