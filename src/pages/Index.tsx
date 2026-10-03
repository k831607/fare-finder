import { Link } from "react-router";
import { ArrowRight, BellRing, Eye, PlaneTakeoff, X } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { useDocumentMeta } from "@/hooks/use-document-meta";


const features = [
  {
    number: "01",
    icon: Eye,
    title: "盯緊熱門航線",
    english: "Always-on route watching",
    description: "持續監控台北出發的熱門航線（東京、首爾），自動抓最低票價。",
  },
  {
    number: "02",
    icon: BellRing,
    title: "達標自動通知",
    english: "Target-price email alerts",
    description: "低於你設定的目標價，就寄 email 提醒你，附上立即訂購連結。",
  },
  {
    number: "03",
    icon: X,
    title: "隨時取消",
    english: "Cancel anytime",
    description: "月訂閱制，不想用隨時停，沒有綁約。",
  },
];

export default function Index() {
  useDocumentMeta({
    title: "Flight Price Notifier — 機票降價通知",
    description:
      "設定航線與目標價，機票降價就通知你。Set a route and target price and get an email when fares drop.",
  });

  return (
    <main className="overflow-hidden bg-background">
      <section className="relative min-h-[92vh] border-b border-border">
        <div className="route-grid absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="hero-beam absolute left-[58%] top-0 h-full w-px" aria-hidden="true" />

        <div className="relative mx-auto flex min-h-[92vh] w-full max-w-[1400px] flex-col px-5 sm:px-8 lg:px-12">
          <header className="flex min-h-20 items-center justify-between border-b border-border/70">
            <BrandMark />
            <Button asChild>
              <Link to="/sign-in">
                Sign in / 登入
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </header>

          <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.25fr_0.75fr] lg:py-20">
            <div className="reveal-up max-w-4xl">
              <div className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase text-primary">
                <span className="inline-block size-2 rounded-full bg-primary shadow-[0_0_18px_var(--violet-glow)]" />
                Taipei departures · Price watch active
              </div>
              <h1 className="font-display text-[clamp(3.6rem,8.8vw,8.4rem)] font-semibold leading-[0.87] text-foreground">
                Flight Price
                <span className="block text-primary">Notifier</span>
              </h1>
              <div className="mt-10 max-w-2xl border-l-2 border-primary pl-6">
                <p className="font-display text-2xl font-medium leading-snug text-foreground sm:text-4xl">
                  設定航線與目標價，機票降價就通知你
                </p>
                <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                  Set a route and a target price — we email you when the fare drops.
                </p>
              </div>
              <Button asChild size="lg" className="mt-10 h-12 px-6">
                <Link to="/sign-in">
                  Start watching fares
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <div className="reveal-up relative hidden min-h-[440px] lg:block" aria-hidden="true">
              <div className="absolute left-6 top-10 text-xs font-semibold text-subtle-foreground">TPE</div>
              <div className="absolute bottom-14 right-4 text-xs font-semibold text-subtle-foreground">NRT</div>
              <svg viewBox="0 0 440 440" className="absolute inset-0 h-full w-full overflow-visible">
                <path
                  d="M48 92 C 142 88, 194 298, 382 348"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="1"
                  strokeDasharray="5 9"
                />
                <circle cx="48" cy="92" r="6" fill="var(--primary)" />
                <circle cx="382" cy="348" r="6" fill="var(--primary)" />
              </svg>
              <div className="absolute left-[48%] top-[45%] grid size-16 -rotate-12 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary shadow-[0_0_50px_var(--violet-glow)]">
                <PlaneTakeoff className="size-7" />
              </div>
              <div className="absolute right-3 top-14 w-48 border border-border bg-card/80 p-4 backdrop-blur">
                <p className="text-[10px] font-semibold uppercase text-subtle-foreground">Price signal</p>
                <p className="mt-2 font-display text-3xl font-semibold text-foreground">-18%</p>
                <div className="mt-4 h-1 bg-secondary">
                  <div className="h-full w-4/5 bg-primary" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border/70 py-5 text-[11px] font-semibold uppercase text-subtle-foreground">
            <span>Tokyo · Seoul</span>
            <span>Scroll to explore ↓</span>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="mb-12 grid gap-5 md:grid-cols-2 md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase text-primary">Built for flexible travelers</p>
            <h2 className="font-display text-3xl font-semibold text-foreground sm:text-5xl">
              你定預算，我們盯價格。
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-muted-foreground md:justify-self-end">
            不需要先決定日期。告訴我們你想去哪裡、願意付多少，剩下的交給我們。
          </p>
        </div>

        <div className="grid border-l border-t border-border md:grid-cols-3">
          {features.map(({ number, icon: Icon, title, english, description }) => (
            <article
              key={title}
              className="feature-card group min-h-[310px] border-b border-r border-border bg-card/30 p-7 sm:p-8"
            >
              <div className="flex items-start justify-between">
                <Icon className="size-6 text-primary" aria-hidden="true" />
                <span className="font-mono text-xs text-subtle-foreground">{number}</span>
              </div>
              <div className="mt-20">
                <h3 className="font-display text-2xl font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-xs font-semibold uppercase text-primary">{english}</p>
                <p className="mt-5 text-sm leading-7 text-muted-foreground">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <BrandMark />
          <p>© 2026 Flight Price Notifier</p>
        </div>
      </footer>
    </main>
  );
}
