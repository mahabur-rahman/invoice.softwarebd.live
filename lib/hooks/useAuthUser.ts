"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { ME_QUERY } from "@/lib/graphql/queries";
import { useUserStore } from "@/lib/store/userStore";
import { UserRole } from "@/lib/constants/constants";

type MeResponse = {
  me: {
    _id: string;
    email: string;
    name?: string | null;
    picture?: string | null;
    role?: UserRole | null;
  };
};

export const useAuthUser = () => {
  const accessToken = useUserStore((state) => state.accessToken);
  const refreshToken = useUserStore((state) => state.refreshToken);
  const userId = useUserStore((state) => state.userId);
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  const shouldFetchUser = useMemo(
    () => Boolean(accessToken) && !user,
    [accessToken, user]
  );

  const { data } = useQuery<MeResponse>(ME_QUERY, {
    skip: !shouldFetchUser,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (!data?.me) return;
    setUser(data.me);
  }, [data, setUser]);

  const storedUser = useMemo(
    () => ({
      accessToken: accessToken ?? undefined,
      refreshToken: refreshToken ?? undefined,
      userId: userId ?? undefined,
      user: user ?? undefined,
    }),
    [accessToken, refreshToken, userId, user]
  );

  return {
    storedUser,
    user: user ?? null,
    isLoggedIn: Boolean(accessToken),
  };
};
