"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { LOGIN_MUTATION, REGISTER_MUTATION } from "@/lib/graphql/mutations";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/lib/store/userStore";
import Image from "next/image";
import loginImage from "@/assets/login.png";
import registerImage from "@/assets/register.png";
import { UserRole } from "@/lib/constants/constants";

interface AuthFormProps {
  type: "login" | "register";
}

interface AuthUser {
  _id: string;
  email: string;
  name?: string | null;
  role?: UserRole | null;
  picture?: string | null;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  user?: AuthUser;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterResponse {
  register: AuthResponse;
}

interface LoginResponse {
  login: AuthResponse;
}

interface RegisterVariables {
  registerInput: RegisterInput;
}

interface LoginVariables {
  loginInput: LoginInput;
}


const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useUserStore((state) => state.setAuth);
  const isRegister = type === "register";
  const googleAuthUrl = useMemo(() => {
    const explicitUrl = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL;
    if (explicitUrl && explicitUrl.length > 0) {
      return explicitUrl;
    }
    const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
    if (!graphqlEndpoint) {
      return "";
    }
    return graphqlEndpoint.replace(/\/graphql\/?$/, "") + "/auth/google";
  }, []);
  const [formData, setFormData] = useState<RegisterInput>({
    name: "",
    email: "",
    password: ""
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams.get("error");
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const userId = searchParams.get("userId");

    if (error) {
      setFormError("Google login failed. Please try again.");
      router.replace(isRegister ? "/register" : "/login");
      return;
    }

    if (accessToken && refreshToken && userId) {
      if (typeof window !== "undefined") {
        setAuth({ accessToken, refreshToken, userId });
      }
      router.replace("/dashboard");
    }
  }, [searchParams, router, isRegister, setAuth]);

  const [registerUser, { loading: registerLoading }] = useMutation<
    RegisterResponse,
    RegisterVariables
  >(REGISTER_MUTATION);
  const [loginUser, { loading: loginLoading }] = useMutation<
    LoginResponse,
    LoginVariables
  >(LOGIN_MUTATION);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (isRegister) {
      // 🟩 Registration logic
      try {
        const payload: RegisterVariables = {
          registerInput: {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
          },
        };

        const { data } = await registerUser({
          variables: payload,
          errorPolicy: "none",
          context: { skipAuthRedirect: true },
        });
        console.log("Register data:", data);

        if (data?.register) {
          setFormSuccess("Account created successfully. You can now log in.");
          setFormData({ name: "", email: "", password: "" });
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          setFormError(error.message)
        } else {
          setFormError("Something went wrong")
          console.log("An unknown error occurred:", error);
        }
      }


      return;
    }

    // 🟦 Login logic
    try {
      const payload: LoginVariables = {
        loginInput: {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        },
      };

      const { data } = await loginUser({
        variables: payload,
        context: { skipAuthRedirect: true },
      });
      console.log("Login data:", data);

      if (data?.login) {
        if (typeof window !== "undefined") {
          setAuth({
            accessToken: data.login.accessToken,
            refreshToken: data.login.refreshToken,
            userId: data.login.userId,
            user: data.login.user ?? null,
          });
        }
        setFormSuccess("Logged in successfully.");
        setFormData((prev) => ({ ...prev, password: "", email: "" }));
        router.push("/dashboard")
      } else {
        setFormError("Unable to log in. Please try again.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setFormError(error.message)
      } else {
        setFormError("Something went wrong")
        console.log("An unknown error occurred:", error);
      }
    }
  };

  const handleGoogleLogin = () => {
    setFormError(null);
    setFormSuccess(null);
    if (!googleAuthUrl) {
      setFormError("Google login is not configured yet.");
      return;
    }
    if (typeof window !== "undefined") {
      window.location.href = googleAuthUrl;
    }
  };



  const isSubmitting = isRegister ? registerLoading : loginLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-100 px-4 py-10">
      <div
        className={`w-full max-w-5xl rounded-3xl bg-linear-to-t from-amber-50 via-white to-white shadow-[0_18px_50px_rgba(15,23,42,0.18)] overflow-hidden flex flex-col md:flex-row ${
          isRegister ? "md:flex-row-reverse" : "md:flex-row"
        }`}
      >
        <div className="relative hidden md:block md:w-1/2 min-h-[560px] bg-slate-50">
          <Image
            src={isRegister ? registerImage : loginImage}
            alt={isRegister ? "Register illustration" : "Login illustration"}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-tr from-white/70 via-white/10 to-transparent" />
        </div>

        <div className="w-full md:w-1/2 px-8 py-10 md:px-12 md:py-14 flex items-center justify-center">
          <div className="w-full max-w-sm rounded-3xl bg-white/80 px-8 py-10">
            <div className="text-center mb-8">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {type === "login" ? "Welcome back" : "Create your account"}
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                {type === "login" ? "Login" : "Register"}
              </h1>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
                  <svg
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.13 1.53 7.54 2.8l5.2-5.2C33.64 4.1 29.26 2 24 2 14.95 2 7.16 7.18 3.7 14.6l6.8 5.28C12.14 13.65 17.58 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.1 24.5c0-1.62-.14-2.79-.45-4H24v7.6h12.6c-.25 2.06-1.6 5.17-4.6 7.26l7.1 5.5c4.1-3.8 6.4-9.4 6.4-16.36z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.5 28.88a14.75 14.75 0 0 1-.78-4.38c0-1.52.26-2.98.72-4.38l-6.8-5.28A22.02 22.02 0 0 0 2 24.5c0 3.58.86 6.96 2.4 9.96l6.1-5.58z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 46c5.26 0 9.7-1.74 12.93-4.74l-7.1-5.5c-1.9 1.33-4.45 2.22-5.83 2.22-6.42 0-11.86-4.15-13.5-9.88l-6.1 5.58C7.16 40.82 14.95 46 24 46z"
                    />
                  </svg>
                </span>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                or
                <span className="h-px flex-1 bg-slate-200" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {isRegister && (
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Name"
                  className="mt-2 w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-emerald-100"
                  required
                />
              </div>
            )}

            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="mt-2 w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-emerald-100"
                required
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="mt-2 w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-emerald-100"
                required
              />
            </div>

            {formError && (
              <p className="text-sm text-red-600" role="alert">
                {formError}
              </p>
            )}

            {formSuccess && (
              <p className="text-sm text-green-600" role="status">
                {formSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-emerald-500 py-3 text-white shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:bg-emerald-600 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? "Submitting..." : isRegister ? "Register" : "Login"}
            </button>
            </form>

            <p className="text-sm text-center text-slate-600 mt-5">
              {isRegister ? (
                <>
                  Already have an account?{" "}
                  <Link href="/login" className="text-slate-900 hover:underline">
                    Login
                  </Link>
                </>
              ) : (
                <>
                  Don’t have an account?{" "}
                  <Link href="/register" className="text-slate-900 hover:underline">
                    Register
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
