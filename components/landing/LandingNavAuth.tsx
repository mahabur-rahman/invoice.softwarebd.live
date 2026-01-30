"use client";

import Link from "next/link";
import { useAuthUser } from "@/lib/hooks/useAuthUser";
import { getUserInitials } from "@/utils/auth-storage";

const LandingNavAuth = () => {
  const { isLoggedIn, user } = useAuthUser();
  const initials = getUserInitials(user);

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          Get started
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/dashboard"
        className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition hover:-translate-y-0.5 hover:bg-slate-800"
      >
        Go to Dashboard
      </Link>
      <Link
        href="/dashboard"
        className="group flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5"
        aria-label="Open dashboard"
        title={user?.name || user?.email || "Dashboard"}
      >
        {user?.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.picture}
            alt={user?.name || "User avatar"}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="text-sm font-semibold text-slate-700">
            {initials}
          </span>
        )}
      </Link>
    </div>
  );
};

export default LandingNavAuth;
