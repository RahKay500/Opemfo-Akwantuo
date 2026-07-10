"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SplashRedirect({ target }: { target: string }) {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace(target), 2000);
    return () => clearTimeout(t);
  }, [router, target]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-primary">
      <div className="flex size-[120px] items-center justify-center rounded-[60px] bg-white">
        <Image src="/images/logo.png" alt="" width={100} height={100} priority />
      </div>
      <p className="mt-6 font-heading text-[26px] font-bold tracking-[-0.5px] text-white">
        Ɔpemfoɔ Akwantuo
      </p>
      <p className="mt-1 font-body text-[15px] text-white">Caring for every mother</p>
    </main>
  );
}
