"use client";
import AppRoute from "@/constant/AppRoute.enum";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

interface AppLinkProps {
  href: AppRoute;
  children: React.ReactNode;
  params?: { [key: string | number]: string | number };
  [key: string]: any;
}

const AppLink: React.FC<AppLinkProps> = ({
  href,
  children,
  params,
  ...props
}) => {
  const { locale } = useParams();
  let localizedHref = `/${locale}${href}`;
  if (params) {
    Object.keys(params).forEach((key) => {
      localizedHref = localizedHref.replace(`:${key}`, String(params[key]));
    });
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
