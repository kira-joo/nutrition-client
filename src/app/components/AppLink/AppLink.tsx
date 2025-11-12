"use client";
import AppRoute from "@/constant/AppRoute.enum";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

interface AppLinkProps {
  href: AppRoute;
  children: React.ReactNode;
  params?: { [key: string | number]: string | number };
  query?: { [key: string]: string | number | null | undefined };
  [key: string]: any;
}

const AppLink: React.FC<AppLinkProps> = ({
  href,
  children,
  params,
  query,
  ...props
}) => {
  const { locale } = useParams();
  let localizedHref = `/${locale}${href}`;
  if (params) {
    Object.keys(params).forEach((key) => {
      localizedHref = localizedHref.replace(`:${key}`, String(params[key]));
    });
  }
  if (query) {
    const queryString = Object.entries(query)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join("&");
    if (queryString) {
      localizedHref += `?${queryString}`;
    }
  }

  return (
    <Link
      href={localizedHref}
      passHref
      {...props}
      style={{ textDecoration: "none", color: "inherit", ...props.style }}
    >
      {children}
    </Link>
  );
};

export default AppLink;
