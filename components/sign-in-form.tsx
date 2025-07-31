"use client";

import { useState } from "react";
import { z } from "zod";
import Image from "next/image";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { signInWithEmailAndPassword } from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FormInput from "@/components/form-input";

import { auth } from "@/lib/firebase/client";
import { signIn } from "@/lib/actions/auth.action";

const signInFormSchema = () => {
  return z.object({
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  });
};

const SignInForm = ({
  onSwitch,
  onAuthComplete,
}: {
  onSwitch: () => void;
  onAuthComplete: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const formSchema = signInFormSchema();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { email, password } = data;

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const idToken = await userCredential.user.getIdToken();
      if (!idToken) {
        toast.error("Sign in Failed. Please try again.");
        return;
      }

      const result = await signIn({
        email,
        idToken,
      });

      if (result?.success) {
        toast.success("Signed in successfully.");
        onAuthComplete();
        router.refresh();
      } else {
        toast.error(result.message || "Sign in Failed. Please try again.");
      }
    } catch (error: any) {
      let errorMessage = "An unknown error occurred. Please try again.";
      if (error.code) {
        switch (error.code) {
          case "auth/invalid-credential":
            errorMessage = "Invalid email or password.";
            break;
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-6 py-3 px-10 w-full border border-gray-200 rounded-lg shadow-sm">
        <div className="flex flex-row gap-2 justify-center items-center">
          <Image src="/next.svg" alt="logo" height={32} width={38} />
          <h2 className="font-bold ">Talk</h2>
        </div>

        <h3 className="font-medium">Sign in and continue where you left off</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 flex flex-col items-center"
          >
            <FormInput
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
            />

            <FormInput
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

            <Button className="btn cursor-pointer" type="submit">
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          No account yet?
          <Button onClick={onSwitch} className="font-bold hover:underline ml-1">
            Sign Up
          </Button>
        </p>
      </div>
    </div>
  );
};

export default SignInForm;
