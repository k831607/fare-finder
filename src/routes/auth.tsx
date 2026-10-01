import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { BrandMark } from "@/components/brand-mark";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Flight Price Notifier" },
      {
        name: "description",
        content: "Sign in or create your Flight Price Notifier account.",
      },
      { property: "og:title", content: "Sign in — Flight Price Notifier" },
      {
        property: "og:description",
        content: "Sign in to manage your future flight price alerts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) void navigate({ to: "/app", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin },
          });

    setPending(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      setError("請查看信箱並確認帳號。Check your email to confirm your account.");
      return;
    }

    await navigate({ to: "/app", replace: true });
  }

  function changeMode(nextMode: "signin" | "signup") {
    setMode(nextMode);
    setError("");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="route-grid absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <Link to="/" aria-label="Flight Price Notifier home">
            <BrandMark />
          </Link>
          <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
            <Link to="/">
              <ArrowLeft aria-hidden="true" />
              Back
            </Link>
          </Button>
        </header>

        <section className="flex flex-1 items-center justify-center py-12">
          <div className="auth-panel w-full max-w-md border border-border bg-card/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="mb-7">
              <p className="mb-3 text-xs font-semibold uppercase text-primary">Welcome aboard</p>
              <h1 className="font-display text-3xl font-semibold text-foreground">
                {mode === "signin" ? "Sign in / 登入" : "Create account / 註冊"}
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {mode === "signin"
                  ? "登入後管理你的機票降價通知。"
                  : "建立帳號，準備追蹤你的理想票價。"}
              </p>
            </div>

            <div className="mb-7 grid grid-cols-2 gap-1 rounded-md bg-secondary p-1" role="tablist">
              <Button
                type="button"
                variant={mode === "signin" ? "default" : "ghost"}
                className="h-9"
                onClick={() => changeMode("signin")}
                role="tab"
                aria-selected={mode === "signin"}
              >
                Sign In
              </Button>
              <Button
                type="button"
                variant={mode === "signup" ? "default" : "ghost"}
                className="h-9"
                onClick={() => changeMode("signup")}
                role="tab"
                aria-selected={mode === "signup"}
              >
                Sign Up
              </Button>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-11 bg-background/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    minLength={6}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 6 characters"
                    className="h-11 bg-background/60 pr-11"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 size-9 text-muted-foreground"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button className="h-11 w-full" type="submit" disabled={pending}>
                {pending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
                {mode === "signin" ? "Sign in / 登入" : "Create account / 建立帳號"}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
              {mode === "signin" ? "還沒有帳號？" : "已經有帳號？"}{" "}
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={() => changeMode(mode === "signin" ? "signup" : "signin")}
              >
                {mode === "signin" ? "立即註冊" : "返回登入"}
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}