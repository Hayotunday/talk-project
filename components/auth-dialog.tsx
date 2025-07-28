"use client";

import React from "react";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const AuthDialog: React.FC = () => {
  const [type, setType] = React.useState<"login" | "register">("login");
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="text-center rounded-full">
            {type === "login" ? "Sign In" : "Sign Up"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          {type === "login" ? (
            <SignInForm onSwitch={() => setType("register")} />
          ) : (
            <SignUpForm onSwitch={() => setType("login")} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthDialog;
// This component renders a simple authentication form with fields for username and password.
