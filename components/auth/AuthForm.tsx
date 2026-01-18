"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { LOGIN_MUTATION, REGISTER_MUTATION } from "@/lib/graphql/mutations";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store/userStore";
import Image from "next/image";
import loginImage from "@/assets/login.png";
import registerImage from "@/assets/register.png";

interface AuthFormProps {
  type: "login" | "register";
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
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
  const setUserId = useUserStore((state) => state.setUserId);
  const isRegister = type === "register";
  const [formData, setFormData] = useState<RegisterInput>({
    name: "",
    email: "",
    password: ""
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

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
          localStorage.setItem("user", JSON.stringify(data.login));
          setUserId(data.login.userId);
        }
        setFormSuccess("Logged in successfully.");
        setFormData((prev) => ({ ...prev, password: "", email: "" }));
        router.push("/")
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



  const isSubmitting = isRegister ? registerLoading : loginLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10">
      <div
        className={`w-full max-w-5xl rounded-3xl bg-gradient-to-t from-amber-50 via-white to-white shadow-[0_18px_50px_rgba(15,23,42,0.18)] overflow-hidden flex flex-col md:flex-row ${
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
          <div className="absolute inset-0 bg-gradient-to-tr from-white/70 via-white/10 to-transparent" />
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

            <form onSubmit={handleSubmit} className="space-y-4">
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
