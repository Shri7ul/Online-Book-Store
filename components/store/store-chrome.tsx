"use client";

import { usePathname } from "next/navigation";
import { StoreFooter } from "@/components/store/footer";
import { StoreHeader } from "@/components/store/header";
import type { StoreSettings } from "@/lib/types";

export function StoreChrome({
  children,
  settings
}: {
  children: React.ReactNode;
  settings: StoreSettings;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;
  return (
    <>
      <StoreHeader settings={settings} />
      <main className="min-h-[70vh]">{children}</main>
      <StoreFooter settings={settings} />
    </>
  );
}
