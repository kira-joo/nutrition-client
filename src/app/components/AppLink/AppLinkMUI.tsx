"use client";
import AppRoute from "@/constant/AppRoute.enum";
import { Link } from "@mui/material";
import { useParams } from "next/navigation";
import React from "react";

interface AppLinkProps {
  href: AppRoute;
  children: React.ReactNode;
  params?: { [key: string | number]: string | number };
  [key: string]: any;
}

const AppLinkMUI: React.FC<AppLinkProps> = ({
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
      sx={{ textDecoration: "none", color: "inherit" }}
      {...props}
    >
      {children}
    </Link>
  );
};

export default AppLinkMUI;
