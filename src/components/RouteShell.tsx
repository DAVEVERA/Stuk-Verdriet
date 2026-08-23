"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import styles from "./RouteShell.module.css";

type RouteShellProps = {
  children: ReactNode;
  header: ReactNode;
  sideNavigation: ReactNode;
  accountDock: ReactNode;
  footer: ReactNode;
  cookieConsent: ReactNode;
};

export function RouteShell({
  children,
  header,
  sideNavigation,
  accountDock,
  footer,
  cookieConsent
}: RouteShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminRoute) {
    return (
      <div className={styles.adminShell}>
        <main className={styles.adminMain}>{children}</main>
      </div>
    );
  }

  return (
    <>
      <div className="site-shell">
        {header}
        {sideNavigation}
        {accountDock}
        <main className="main">{children}</main>
        {footer}
      </div>
      {cookieConsent}
    </>
  );
}
