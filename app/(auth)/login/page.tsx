import AuthForm from "@/components/auth/AuthForm";
import { Suspense } from "react";

const page = () => {
  return (
    <Suspense fallback={<div />}>
      <AuthForm type="login" />
    </Suspense>
  );
};

export default page;
