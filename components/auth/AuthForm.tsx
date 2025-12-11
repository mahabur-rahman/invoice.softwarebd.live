"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { LOGIN_MUTATION, REGISTER_MUTATION } from "@/lib/graphql/mutations";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store/userStore";

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
  role: string;
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
    password: "",
    role: "USER",
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
            role: formData.role.trim(),
          },
        };

        const { data } = await registerUser({
          variables: payload,
          errorPolicy: "none",
        });
        console.log("Register data:", data);

        if (data?.register) {
          setFormSuccess("Account created successfully. You can now log in.");
          setFormData({ name: "", email: "", password: "", role: "USER" });
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

      const { data } = await loginUser({ variables: payload });
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          {type === "login" ? "Login" : "Create Account"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-70"
          >
            {isSubmitting ? "Submitting..." : isRegister ? "Register" : "Login"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Register
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
