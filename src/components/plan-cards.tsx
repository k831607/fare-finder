import { BellRing, Check, CreditCard, Loader2, Plane } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

// Public API Gateway endpoint (no secrets — only Lambdas touch AWS).
const FLIGHT_API_URL = (
  import.meta.env["VITE_FLIGHT_API_URL"] || "https://qolfh8rrj7.execute-api.us-east-1.amazonaws.com"
).replace(/\/$/, "");

// Display only — the charged amount comes from the server-side flight/ecpay secret.
const MONTHLY_FEE_TWD = 300;

type PlanName = "tokyo" | "seoul";
type Status = "active" | "pending_payment" | "cancelled" | "expired";

const PLANS: { plan: PlanName; route: string; title: string; hint: number }[] = [
  { plan: "tokyo", route: "TPE-TYO", title: "台北 ✈ 東京", hint: 9325 },
  { plan: "seoul", route: "TPE-SEL", title: "台北 ✈ 首爾", hint: 5989 },
];

type Subscription = {
  route: string;
  plan_name: string;
  target_price: number;
  subscription_status?: Status;
  current_period_end_date?: string;
};

const twd = (n: number) => `NT$${n.toLocaleString("en-US")}`;
// M1 rows have no status: treat them as unpaid so users self-migrate by paying.
const statusOf = (s?: Subscription): Status | undefined => (s ? (s.subscription_status ?? "pending_payment") : undefined);

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function PlanCards({ email }: { email: string }) {
  const [subs, setSubs] = useState<Record<string, Subscription>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();
  const purchase = params.get("purchase");

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

  // Back from ECPay: the server-to-server callback may land a few seconds after the browser does.
  useEffect(() => {
    if (purchase !== "success") return;
    const timers = [3000, 8000, 15000].map((ms) => setTimeout(() => void refresh(), ms));
    return () => timers.forEach(clearTimeout);
  }, [purchase, refresh]);

  return (
    <div className="mt-12 max-w-3xl">
      <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase text-primary">
        <BellRing className="size-4" aria-hidden="true" />
        降價通知 · Price alerts
      </p>
      {purchase && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-border bg-card/80 p-4 text-sm">
          <p className="text-foreground">
            {purchase === "success"
              ? "付款完成！正在確認你的訂閱，幾秒後卡片會顯示「已訂閱」。"
              : "付款未完成，你可以再試一次。"}
          </p>
          <button
            className="text-xs text-subtle-foreground underline"
            onClick={() => {
              params.delete("purchase");
              setParams(params, { replace: true });
            }}
          >
            關閉
          </button>
        </div>
      )}
      {loadError && <p className="mb-4 text-sm text-destructive">{loadError}</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PLANS.map((p) => (
          <PlanCard
            key={p.plan}
            plan={p}
            sub={subs[p.route]}
            loading={loading}
            onChanged={(s) => setSubs((prev) => ({ ...prev, [s.route]: { ...prev[s.route], ...s } }))}
          />
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-subtle-foreground">
        每條航線月費 {twd(MONTHLY_FEE_TWD)}，透過綠界信用卡定期定額付款，可隨時取消。付費後每 30 分鐘檢查一次下個月的最低票價，達到目標價時寄 email 通知 {email}。
      </p>
    </div>
  );
}

function PlanCard({
  plan,
  sub,
  loading,
  onChanged,
}: {
  plan: (typeof PLANS)[number];
  sub: Subscription | undefined;
  loading: boolean;
  onChanged: (s: Subscription) => void;
}) {
  const status = statusOf(sub);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    if (sub) setValue(String(sub.target_price));
  }, [sub]);

  const paid = status === "active" || status === "cancelled";

  async function subscribe() {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) {
      setError("請輸入有效的目標價（新台幣）");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${FLIGHT_API_URL}/subscribe`, {
        method: "POST",
        headers: { "content-type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ plan_name: plan.plan, target_price: Math.round(n) }),
      });
      const type = res.headers.get("content-type") ?? "";
      if (res.ok && type.includes("text/html")) {
        // Unpaid: hand the browser to ECPay's cashier (the returned form auto-submits).
        const html = await res.text();
        document.open();
        document.write(html);
        document.close();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      // Paid user: in-place target update, no re-payment.
      onChanged({
        route: data.route,
        plan_name: data.plan_name,
        target_price: data.target_price,
        subscription_status: data.subscription_status,
        current_period_end_date: data.current_period_end_date,
      });
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? `失敗：${e.message}` : "失敗，請再試一次");
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${FLIGHT_API_URL}/cancel`, {
        method: "POST",
        headers: { "content-type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ route: plan.route }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      onChanged({
        ...(sub as Subscription),
        subscription_status: "cancelled",
        current_period_end_date: data.current_period_end_date,
      });
      setConfirmCancel(false);
    } catch (e) {
      setError(e instanceof Error ? `取消失敗：${e.message}` : "取消失敗");
    } finally {
      setBusy(false);
    }
  }

  const badge =
    status === "active" ? (
      <Badge className="gap-1">
        <Check className="size-3" aria-hidden="true" />
        已訂閱
      </Badge>
    ) : status === "pending_payment" ? (
      <Badge variant="outline">未完成付款</Badge>
    ) : status === "cancelled" ? (
      <Badge variant="secondary">已取消</Badge>
    ) : status === "expired" ? (
      <Badge variant="outline">已結束</Badge>
    ) : null;

  const showForm = !paid || editing;
  const submitLabel = paid ? "儲存目標價" : status === "pending_payment" ? "完成付款" : status === "expired" ? "重新訂閱" : "訂閱並付款";

  return (
    <div className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <Plane className="mb-3 size-5 text-primary" aria-hidden="true" />
          <p className="font-display text-xl font-semibold text-foreground">{plan.title}</p>
          <p className="mt-1 text-xs text-subtle-foreground">近期最低約 {twd(plan.hint)}</p>
        </div>
        {badge}
      </div>

      {paid && !editing && (
        <div>
          <p className="text-sm text-muted-foreground">
            目標價 <span className="font-semibold text-foreground">{twd(sub!.target_price)}</span>
          </p>
          {status === "active" && sub?.current_period_end_date && (
            <p className="mt-1 text-xs text-subtle-foreground">下次扣款日 {sub.current_period_end_date}</p>
          )}
          {status === "cancelled" && (
            <p className="mt-1 text-xs text-subtle-foreground">
              有效至 {sub?.current_period_end_date ?? "本期結束"}（仍會通知到該日）
            </p>
          )}
          <Button variant="outline" className="mt-4 w-full" onClick={() => setEditing(true)} disabled={busy}>
            更新目標價
          </Button>
          {status === "active" &&
            (confirmCancel ? (
              <div className="mt-2 flex gap-2">
                <Button variant="destructive" className="flex-1" onClick={cancel} disabled={busy}>
                  {busy && <Loader2 className="animate-spin" aria-hidden="true" />}
                  確定取消
                </Button>
                <Button variant="ghost" className="flex-1" onClick={() => setConfirmCancel(false)} disabled={busy}>
                  先不要
                </Button>
              </div>
            ) : (
              <Button variant="ghost" className="mt-2 w-full text-subtle-foreground" onClick={() => setConfirmCancel(true)}>
                取消訂閱
              </Button>
            ))}
        </div>
      )}

      {showForm && (
        <div>
          {status === "pending_payment" && (
            <p className="mb-3 text-xs text-subtle-foreground">付款完成後才會開始通知。</p>
          )}
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
            disabled={loading || busy}
          />
          <Button className="mt-4 w-full" onClick={subscribe} disabled={loading || busy}>
            {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : !paid && <CreditCard aria-hidden="true" />}
            {submitLabel}
            {!paid && ` · ${twd(MONTHLY_FEE_TWD)}/月`}
          </Button>
          {paid && (
            <Button variant="ghost" className="mt-2 w-full" onClick={() => setEditing(false)} disabled={busy}>
              取消編輯
            </Button>
          )}
        </div>
      )}
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}
