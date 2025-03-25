"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { login } from "@/actions/loginauth";

const LoginSchema = z.object({
  username: z.string().min(1, "Username is Required"),
  password: z.string().min(1, "Password is Required"),
});

const initialState = {
  error: "",
};

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction] = useActionState(login, initialState); // Login will be a callback function that actually validates the details
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-black text-white">
        <div className="container mx-auto px-4 py-10 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <a
              id="site-logo"
              href="."
              title="fdm logo"
              className="items-center px-5 flex-none"
            >
              <Image src="/fdmlogo.png" alt="" width={150} height={0} />
            </a>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 relative">
        <Image
          src="/fdm-login-background.png"
          alt="Login Background"
          layout="fill"
          objectFit="cover"
          className="blur-md"
        />
        <div className="w-full max-w-md z-10">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-black">
                Login to your Account
              </h1>
              <p className="text-gray-600 mt-2">
                Enter your credentials to access{" "}
                <em className="font-bold text-[#c3fa04]">FDMExpenses</em>
              </p>
            </div>

            <Form {...form}>
              <form
                action={async (formData) => {
                  setIsPending(true);
                  await formAction(formData);
                  setIsPending(false);
                }}
                className="space-y-6 text-black"
              >
                {state.error && (
                  <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">
                    {state.error}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your username"
                          {...field}
                          name="username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                          name="password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-fdm-green hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#c3fa04] hover:bg-[#c3fa04]/90 hover:cursor-pointer hover:scale-[1.02] transition-[0.2s]"
                  disabled={isPending}
                >
                  {isPending ? "Logging in..." : "Login"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
}
