"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/public";

type RequireAuthProps = {
  children: React.ReactNode;
};

const LOOP_GUARD_PREFIXES = ["/login", "/signup", "/paywall"] as const;

function isLoopGuardPath(pathname: string): boolean {
  return LOOP_GUARD_PREFIXES.some((p) => pathname.startsWith(p));
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "authenticated" | "unauthenticated">("checking");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        setStatus("authenticated");
      } else if (typeof window !== "undefined" && isLoopGuardPath(pathname ?? "")) {
        setStatus("authenticated");
      } else {
        const next =
          typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : pathname ?? "";
        router.replace(`/login?next=${encodeURIComponent(next)}`);
        setStatus("unauthenticated");
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (status === "checking") {
    return (
      <div className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center gap-4">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-cyan-500"
          aria-hidden
        />
        <p className="text-sm text-zinc-400">Checking access…</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
