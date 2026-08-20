"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SplashRedirect({ target }: { target: string }) {
  const router = useRouter();

  useEffect(() => {
    // The app-style splash pause is a mobile convention — on a desktop
    // browser tab it just reads as a stalled page load, so skip straight
    // to the destination there instead of waiting out the same 2s.
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const t = setTimeout(() => router.replace(target), isDesktop ? 0 : 2000);
    return () => clearTimeout(t);
  }, [router, target]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-primary lg:hidden">
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
