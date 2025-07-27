"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FormInput from "@/components/form-input";

import { auth } from "@/lib/firebase/client";
import { signUp } from "@/lib/actions/auth.action";

const SignUpFormSchema = () => {
  return z.object({
    name: z.string().min(3),
    email: z.email(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    avatar: z.string().url().nonempty(),
  });
};

const SignUpForm = ({ onSwitch }: { onSwitch: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const formSchema = SignUpFormSchema();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      avatar: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { name, email, password, avatar } = data;

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const result = await signUp({
        uid: userCredential.user.uid,
        name: name!,
        email,
        photo_url: avatar,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Account created successfully. Please sign in.");
      router.push("/");
    } catch (error) {
      console.log(error);
      toast.error(`There was an error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-6 py-5 px-10 lg:min-w-[566px] border border-gray-200 rounded-lg shadow-sm">
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
            <div className="flex flex-col w-full gap-5">
              <FormInput
                control={form.control}
                name="name"
                label="Display Name"
                placeholder="Your display name"
                type="text"
              />

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
                description="Password must be at least 6 characters long"
                placeholder="Enter your password"
                type="password"
              />
            </div>

            <Button className="btn cursor-pointer" type="submit">
              {isLoading ? "Creating Account..." : "Create an Account"}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          Have an account already?
          <Button onClick={onSwitch} className="font-bold hover:underline ml-1">
            Sign In
          </Button>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;
