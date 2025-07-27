"use client";

import React from "react";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

const AuthForm: React.FC = () => {
  const [type, setType] = React.useState<"login" | "register">("login");
  return type === "login" ? (
    <SignInForm onSwitch={() => setType("register")} />
  ) : (
    type === "register" && <SignUpForm onSwitch={() => setType("login")} />
  );
};

export default AuthForm;
// This component renders a simple authentication form with fields for username and password.
