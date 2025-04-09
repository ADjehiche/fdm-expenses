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
  success: false,
};

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction] = useActionState(login, initialState);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (state.success) {
      if (state.newLogin) {
        import("@/app/contexts/UserContext")
          .then(({ refreshUserData }) => {
            refreshUserData()
              .then(() => {
                router.push("/dashboard");
              })
              .catch((error) => {
                console.error("Error refreshing user data:", error);
                router.push("/dashboard");
              });
          })
          .catch((error) => {
            console.error("Error importing user context:", error);
            router.push("/dashboard");
          });
      } else {
        router.push("/dashboard");
      }
    }
  }, [state.success, state.newLogin, router]);

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
        <div className="container mx-auto px-6 py-10">
          <div className="flex items-center">
            <a href="." title="FDM Logo" className="flex-none">
              <Image
                src="/fdmlogo.png"
                alt="FDM Logo"
                width={150}
                height={0}
                priority
              />
            </a>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 z-0">
          <Image
            src="/fdm-login-background.png"
            alt="Background"
            layout="fill"
            objectFit="cover"
            className="opacity-50 blur-sm"
          />
        </div>

        <div className="w-full max-w-md z-10">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-50 py-4 px-6 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-900">Welcome Back</h1>
              <p className="text-gray-600 text-sm mt-1">
                Login to{" "}
                <span className="font-semibold text-lime-500">
                  FDMExpenses
                </span>
              </p>
            </div>

            <div className="p-6">
              <Form {...form}>
                <form
                  action={async (formData) => {
                    setIsPending(true);
                    await formAction(formData);
                    setIsPending(false);
                  }}
                  className="space-y-5"
                >
                  {state.error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {state.error}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Username
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c3fa04] focus:border-transparent transition-colors"
                            {...field}
                            name="username"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Password
                          </FormLabel>
                          <Link
                            href="/forgot-password"
                            className="text-xs text-lime-600 hover:underline"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c3fa04] focus:border-transparent transition-colors"
                            {...field}
                            name="password"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-xs" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-[#c3fa04] hover:bg-[#c3fa04]/90 text-black font-medium py-2.5 rounded-md transition-all duration-200 hover:shadow-md mt-4"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Signing In
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
