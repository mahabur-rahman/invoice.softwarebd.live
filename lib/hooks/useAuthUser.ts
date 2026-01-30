"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { ME_QUERY } from "@/lib/graphql/queries";
import {
  mergeStoredUser,
  readStoredUser,
  type StoredUser,
} from "@/utils/auth-storage";

type MeResponse = {
  me: {
    _id: string;
    email: string;
    name?: string | null;
    picture?: string | null;
  };
};

export const useAuthUser = () => {
  const [storedUser, setStoredUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    setStoredUser(readStoredUser());
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "user") return;
      setStoredUser(readStoredUser());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const accessToken = storedUser?.accessToken;
  const shouldFetchUser = useMemo(
    () => Boolean(accessToken) && !storedUser?.user,
    [accessToken, storedUser?.user]
  );

  const { data } = useQuery<MeResponse>(ME_QUERY, {
    skip: !shouldFetchUser,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (!data?.me) return;
    const next = mergeStoredUser({ user: data.me });
    setStoredUser(next);
  }, [data]);

  return {
    storedUser,
    user: storedUser?.user ?? null,
    isLoggedIn: Boolean(accessToken),
  };
};
