"use client";

import React from "react";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const AuthDialog: React.FC = () => {
  const [type, setType] = React.useState<"login" | "register">("login");
  const [open, setOpen] = React.useState(false);

  const handleAuthComplete = () => {
    setOpen(false);
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="text-center rounded-full">
            {type === "login" ? "Sign In" : "Sign Up"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>{type === "login" ? "Sign In" : "Sign Up"}</DialogTitle>
          {type === "login" ? (
            <SignInForm
              onSwitch={() => setType("register")}
              onAuthComplete={handleAuthComplete}
            />
          ) : (
            <SignUpForm
              onSwitch={() => setType("login")}
              onAuthComplete={handleAuthComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthDialog;
