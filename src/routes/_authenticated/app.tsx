import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BellRing, LogOut, Plane, Sparkles } from "lucide-react";
import { useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({
    meta: [
      { title: "Dashboard — Flight Price Notifier" },
      { name: "description", content: "Your Flight Price Notifier dashboard." },
      { property: "og:title", content: "Dashboard — Flight Price Notifier" },
      { property: "og:description", content: "Manage your flight price notifications." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AppPage,
});

function AppPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
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
              Dashboard preview
            </p>
            <h1 className="font-display text-3xl font-semibold text-foreground sm:text-5xl">
              Hi {user.email}
            </h1>
            <div className="mt-10 border-l-2 border-primary pl-6 sm:pl-8">
              <p className="max-w-2xl font-display text-2xl font-medium leading-snug text-foreground sm:text-4xl">
                你的航線追蹤儀表板即將上線
              </p>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                下一個里程碑會加上訂閱航線的功能。
              </p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-subtle-foreground">
                Your dashboard is coming soon. Route-subscription will be added in the next
                milestone.
              </p>
            </div>

            <div className="mt-14 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { icon: Plane, label: "Route", value: "Taipei → Anywhere" },
                { icon: BellRing, label: "Alert", value: "Target price" },
                { icon: Sparkles, label: "Status", value: "Coming soon" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="border border-border bg-card/60 p-4 backdrop-blur-sm">
                  <Icon className="mb-5 size-5 text-primary" aria-hidden="true" />
                  <p className="text-[11px] font-semibold uppercase text-subtle-foreground">{label}</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}