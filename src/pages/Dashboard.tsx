import { useNavigate } from "react-router";
import { LogOut, Sparkles } from "lucide-react";
import { useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import { PlanCards } from "@/components/plan-cards";
import { Button } from "@/components/ui/button";
import { useAuthenticatedUser } from "@/components/layout/require-auth";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { supabase } from "@/integrations/supabase/client";


export default function AppPage() {
  const user = useAuthenticatedUser();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  useDocumentMeta({
    title: "Dashboard — Flight Price Notifier",
    description: "Your Flight Price Notifier dashboard.",
  });

  async function handleSignOut() {
    setPending(true);
    await supabase.auth.signOut();
    await navigate("/sign-in", { replace: true });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="route-grid absolute inset-0 opacity-30" aria-hidden="true" />
      <div className="relative mx-auto min-h-screen w-full max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <header className="flex min-h-20 items-center justify-between border-b border-border">
          <BrandMark />
          <Button variant="outline" onClick={handleSignOut} disabled={pending}>
            <LogOut aria-hidden="true" />
            Sign Out
          </Button>
        </header>

        <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl flex-col justify-center py-16">
          <div className="reveal-up">
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase text-primary">
              <Sparkles className="size-4" aria-hidden="true" />
              Dashboard
            </p>
            <h1 className="font-display text-3xl font-semibold text-foreground sm:text-5xl">
              Hi {user.email}
            </h1>
            <div className="mt-8 border-l-2 border-primary pl-6 sm:pl-8">
              <p className="max-w-2xl font-display text-2xl font-medium leading-snug text-foreground sm:text-4xl">
                選一條航線，設定你的目標價
              </p>
              <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
                票價一達標，我們就寄信通知你。
              </p>
            </div>

            <PlanCards email={user.email ?? ""} />
          </div>
        </section>
      </div>
    </main>
  );
}