"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

import { Logo } from "@/shared/components/layout/Logo";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useAuth } from "@/shared/providers/AuthProvider";
import { users } from "@/shared/data/users";

export default function SignInPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dashboardPath = (role?: string) =>
    role === "student" ? "/explore" : "/admin";

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    void submitCurrentMode();
  };

  const submitSignIn = async () => {
    const result = await signIn(email.trim(), password);

    if (result.ok === false) {
      setError(result.error);
      return;
    }

    router.push(dashboardPath(result.user.role));
  };

  const submitSignUp = async () => {
    const result = await signUp({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    if (result.ok === false) {
      setError(result.error);
      return;
    }

    router.push(dashboardPath(result.user.role));
  };

  const quick = (id: string) => {
    setError(null);
    setMode("signin");

    const foundUser = users.find((user) => user.id === id);

    if (foundUser?.password) {
      setEmail(foundUser.email);
      setPassword(foundUser.password);
    }
  };

  const submitCurrentMode = async () => {
    if (mode === "signup") {
      await submitSignUp();
      return;
    }

    await submitSignIn();
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

          <h1 className="font-serif-paper text-3xl font-semibold">
            {mode === "signup" ? "Create student account" : "Sign in"}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Students can create an account and start learning immediately."
              : "Use a student or admin demo account below."}
          </p>

          <div className="mt-5 grid grid-cols-2 border border-border bg-muted/30 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className={[
                "h-10 text-sm font-semibold transition-colors",
                mode === "signin"
                  ? "bg-[#1557c0] text-white"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className={[
                "h-10 text-sm font-semibold transition-colors",
                mode === "signup"
                  ? "bg-[#1557c0] text-white"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              Sign up
            </button>
          </div>

          <form
            onSubmit={submit}
            className="mt-6 space-y-4"
          >
            {mode === "signup" ? (
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
            ) : null}

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
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="********"
                  className="pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-[#1557c0] text-white hover:bg-[#124aa3]"
              size="lg"
            >
              {mode === "signup" ? "Create student account" : "Sign in"}
            </Button>
          </form>

          {mode === "signin" ? (
            <>
              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                fill demo credentials
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
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className="mt-6 w-full text-center text-sm font-semibold text-[#1557c0] hover:text-[#124aa3]"
            >
              Already have an account? Sign in
            </button>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Student and admin access only.
          </p>
        </div>
      </div>
    </div>
  );
}
