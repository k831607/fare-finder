import { BellRing, Check, Loader2, Plane } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Public API Gateway endpoint (no secrets — only Lambdas touch AWS).
const FLIGHT_API_URL = (
  import.meta.env["VITE_FLIGHT_API_URL"] || "https://qolfh8rrj7.execute-api.us-east-1.amazonaws.com"
).replace(/\/$/, "");

type PlanName = "tokyo" | "seoul";

const PLANS: { plan: PlanName; route: string; title: string; hint: number }[] = [
  { plan: "tokyo", route: "TPE-TYO", title: "台北 ✈ 東京", hint: 9325 },
  { plan: "seoul", route: "TPE-SEL", title: "台北 ✈ 首爾", hint: 5989 },
];

type Subscription = { route: string; plan_name: string; target_price: number };

const twd = (n: number) => `NT$${n.toLocaleString("en-US")}`;

export function PlanCards({ email }: { email: string }) {
  const [subs, setSubs] = useState<Record<string, Subscription>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${FLIGHT_API_URL}/subscriptions?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { subscriptions: Subscription[] };
      setSubs(Object.fromEntries(data.subscriptions.map((s) => [s.route, s])));
      setLoadError(null);
    } catch {
      setLoadError("無法載入你的訂閱，請稍後再試。");
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="mt-12 max-w-3xl">
      <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase text-primary">
        <BellRing className="size-4" aria-hidden="true" />
        降價通知 · Price alerts
      </p>
      {loadError && <p className="mb-4 text-sm text-destructive">{loadError}</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PLANS.map((p) => (
          <PlanCard
            key={p.plan}
            email={email}
            plan={p}
            sub={subs[p.route]}
            loading={loading}
            onSaved={(s) => setSubs((prev) => ({ ...prev, [s.route]: s }))}
          />
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-subtle-foreground">
        每 30 分鐘檢查一次下個月的最低票價；達到你的目標價時會寄 email 通知 {email}。
      </p>
    </div>
  );
}

function PlanCard({
  email,
  plan,
  sub,
  loading,
  onSaved,
}: {
  email: string;
  plan: (typeof PLANS)[number];
  sub: Subscription | undefined;
  loading: boolean;
  onSaved: (s: Subscription) => void;
}) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (sub) setValue(String(sub.target_price));
  }, [sub]);

  const subscribed = Boolean(sub) && !editing;

  async function save() {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) {
      setError("請輸入有效的目標價（新台幣）");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${FLIGHT_API_URL}/subscribe`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, plan_name: plan.plan, target_price: Math.round(n) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      onSaved({ route: data.route, plan_name: data.plan_name, target_price: data.target_price });
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? `儲存失敗：${e.message}` : "儲存失敗");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <Plane className="mb-3 size-5 text-primary" aria-hidden="true" />
          <p className="font-display text-xl font-semibold text-foreground">{plan.title}</p>
          <p className="mt-1 text-xs text-subtle-foreground">近期最低約 {twd(plan.hint)}</p>
        </div>
        {sub && (
          <Badge className="gap-1">
            <Check className="size-3" aria-hidden="true" />
            已訂閱
          </Badge>
        )}
      </div>

      {subscribed ? (
        <div>
          <p className="text-sm text-muted-foreground">
            目標價 <span className="font-semibold text-foreground">{twd(sub!.target_price)}</span>
          </p>
          <Button variant="outline" className="mt-4 w-full" onClick={() => setEditing(true)}>
            更新目標價
          </Button>
        </div>
      ) : (
        <div>
          <label className="text-xs font-semibold uppercase text-subtle-foreground" htmlFor={`tp-${plan.plan}`}>
            目標價（TWD）
          </label>
          <Input
            id={`tp-${plan.plan}`}
            type="number"
            inputMode="numeric"
            min={1}
            placeholder={String(plan.hint + 1000)}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-1"
            disabled={loading || saving}
          />
          <Button className="mt-4 w-full" onClick={save} disabled={loading || saving}>
            {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
            {sub ? "儲存目標價" : "開始追蹤"}
          </Button>
          {sub && (
            <Button variant="ghost" className="mt-2 w-full" onClick={() => setEditing(false)} disabled={saving}>
              取消
            </Button>
          )}
        </div>
      )}
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}
