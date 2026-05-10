"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function RootPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login"); // Redirect to the NEW login
    } else if (status === "authenticated") {
      router.push("/dashboard"); // Redirect to the NEW unified dashboard
    }
  }, [status, router]);

  return <div className="p-10 text-center">Loading Safety Portal...</div>;
}