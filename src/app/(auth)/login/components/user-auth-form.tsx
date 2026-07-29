"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HTMLAttributes, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuthSession } from "@/components/auth/auth-session";
import { getAdministrationUserByEmail } from "@/components/administration/users-data";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getHomePath } from "@/lib/soc-roles";
import { cn } from "@/lib/utils";

/** Demo login — Ava Reed, Tier 2 Analyst on the admin roster. */
const DEMO_EMAIL = "ava.reed@svalbard.ca";
const DEMO_PASSWORD = "demodemo123";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your email" })
    .email({ message: "Invalid email address" }),
  password: z.string().min(1, {
    message: "Please enter your password",
  }),
});

export function UserAuthForm({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuthSession();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    const email = data.email.trim().toLowerCase();
    const rosterUser = getAdministrationUserByEmail(email);
    const isDemoCredential =
      email === DEMO_EMAIL && data.password === DEMO_PASSWORD;

    if (!rosterUser || !isDemoCredential) {
      form.setError("password", {
        message: rosterUser
          ? "Use ava.reed@svalbard.ca / demodemo123"
          : "No user with that email on the roster",
      });
      return;
    }

    setIsLoading(true);
    const session = signIn(rosterUser.email);
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : "",
    );
    const next = params.get("next");
    const destination =
      next && next.startsWith("/") ? next : getHomePath(session.user.jobRole);
    setTimeout(() => {
      setIsLoading(false);
      router.push(destination);
    }, 800);
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="ava.reed@svalbard.ca" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-muted-foreground text-sm font-medium hover:opacity-75"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="mt-2" disabled={isLoading}>
              Sign in
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
