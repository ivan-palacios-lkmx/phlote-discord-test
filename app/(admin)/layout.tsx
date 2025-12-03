"use client";

import AdminHeader from "@/components/admin/Header/Header";
import kebabCase from "lodash/kebabCase";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import "./layout.scss";

const OverlayProfileWrapper = dynamic(
  () => import("@/components/OverlayProfile/OverlayProfileWrapper"),
  { ssr: false },
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  const routeName = useMemo(() => {
    if (!pathname) return "";
    return kebabCase(pathname.replace("/admin", "").replace("/", "") || "index");
  }, [pathname]);

  const classes = useMemo(() => {
    return ["container", "admin", routeName, mounted ? "mounted" : ""].filter(Boolean).join(" ");
  }, [routeName, mounted]);

  return (
    <div className={classes} data-lenis-prevent>
      <AdminHeader />
      {children}
      <OverlayProfileWrapper />
    </div>
  );
}
