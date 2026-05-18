"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Logo } from "@/shared/components/layout/Logo";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useAuth } from "@/shared/providers/AuthProvider";
import { users } from "@/shared/data/users";

export default function SignInPage() {
  const router = useRouter();
  const { signIn, loginAs } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const dashboardPath = (role?: string) =>
    role === "student" ? "/subjects" : "/admin";

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const result = signIn(email.trim(), password);

    if (result.ok === false) {
      setError(result.error);
      return;
    }

    const foundUser = users.find(
      (user) => user.email.toLowerCase() === email.trim().toLowerCase(),
    );

    router.push(dashboardPath(foundUser?.role));
  };

  const quick = (id: string) => {
    loginAs(id);

    const foundUser = users.find((user) => user.id === id);

    router.push(dashboardPath(foundUser?.role));
  };

  return (
    <div className="theme-light-only grid min-h-screen bg-background lg:grid-cols-[1.1fr_0.9fr]">
      <div className="relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.08),transparent_45%)]" />

        <div className="relative">
          <Logo size="lg" />
        </div>

        <div className="relative max-w-3xl">
          <h2 className="font-serif-paper text-4xl font-medium leading-tight tracking-tight text-foreground">
            &quot;It&apos;s the closest thing to marking on a real script - but
            with a mark scheme always in view.&quot;
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            - Examiner feedback, internal pilot
          </p>
        </div>

        <div className="relative text-xs text-muted-foreground">
          © Faazhi - Demo prototype
        </div>
      </div>

      <div className="flex items-center justify-center border-l border-border p-6 lg:p-10">
        <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/70 p-8 backdrop-blur">
          <div className="mb-8 lg:hidden">
            <Logo size="md" />
          </div>

          <h1 className="font-serif-paper text-3xl font-semibold">Sign in</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Use a demo account or quick-enter as a role below.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" size="lg">
              Sign in
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or quick demo access
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-2">
            {users.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => quick(user.id)}
                className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5 text-left transition-colors hover:border-primary/50 hover:bg-primary-soft"
              >
                <div
                  className="grid h-9 w-9 place-items-center rounded-full text-sm font-semibold text-primary-foreground"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {user.name
                    .split(" ")
                    .map((namePart) => namePart[0])
                    .slice(0, 2)
                    .join("")}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </div>
                </div>

                <span className="mr-1 text-[10px] uppercase tracking-wider text-foreground/60">
                  {user.role}
                </span>

                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}