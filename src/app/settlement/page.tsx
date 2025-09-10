"use client";

import { BackLink } from "@/components/app/back-link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type SettlementState = {
  agreedAmount?: number;
  releaseSent: boolean;
  releaseSigned: boolean;
  fundsReceived: boolean;
  fundsReceivedDate?: string; // YYYY-MM-DD
  fundsAmount?: number;
  feePercent: number; // attorney fee percent
  costs: number; // case costs
};

type ProviderPay = { id: string; name: string; amount: number; paid: boolean; datePaid?: string };

const KEY = "settlement-state";
const PKEY = "settlement-providers";

export default function SettlementPage() {
  const [state, setState] = useState<SettlementState>({
    releaseSent: false,
    releaseSigned: false,
    fundsReceived: false,
    feePercent: 33,
    costs: 0,
  });
  const [providers, setProviders] = useState<ProviderPay[]>([]);

  // Add form states
  const [newProvider, setNewProvider] = useState("");
  const [newAmount, setNewAmount] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...state, ...(JSON.parse(raw) as SettlementState) });
      const p = window.localStorage.getItem(PKEY);
      if (p) setProviders(JSON.parse(p));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PKEY, JSON.stringify(providers));
  }, [providers]);

  // Derived totals
  const totals = useMemo(() => {
    const funds = state.fundsAmount || 0;
    const providerTotal = providers.reduce((a, p) => a + (p.amount || 0), 0);
    const fee = Math.round((funds * (state.feePercent || 0)) / 100);
    const costs = state.costs || 0;
    const net = Math.max(0, funds - providerTotal - fee - costs);
    const paidProviders = providers.filter((p) => p.paid).length;
    const allProvidersPaid = providers.length > 0 && paidProviders === providers.length;
    return { funds, providerTotal, fee, costs, net, paidProviders, allProvidersPaid };
  }, [state, providers]);

  const addProvider = () => {
    const amt = Number(newAmount.replace(/[^0-9.]/g, ""));
    if (!newProvider.trim() || !amt) return;
    setProviders((arr) => [
      { id: crypto.randomUUID(), name: newProvider.trim(), amount: Math.round(amt), paid: false },
      ...arr,
    ]);
    setNewProvider("");
    setNewAmount("");
  };

  const markFundsReceived = () => {
    setState((s) => ({ ...s, fundsReceived: true }));
  };

  return (
    <div className="w-full p-6 space-y-6">
      <BackLink className="mb-3" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Settlement</h1>
          <p className="text-sm text-muted-foreground">Finalize release, record funds receipt, and pay providers.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant={state.releaseSigned ? "success" : "destructive"}>{state.releaseSigned ? "Release signed" : "Release pending"}</Badge>
          <Badge variant={state.fundsReceived ? "success" : "destructive"}>{state.fundsReceived ? "Funds received" : "Funds pending"}</Badge>
          <Badge variant={totals.allProvidersPaid ? "success" : "outline"}>{totals.allProvidersPaid ? "Providers paid" : "Payments pending"}</Badge>
        </div>
      </div>

      {/* Settlement details */}
      <Card>
        <CardHeader>
          <CardTitle>Settlement Details</CardTitle>
          <CardDescription>Record agreed amount and release status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="agreed">Agreed settlement</Label>
              <Input id="agreed" placeholder="$50,000" value={state.agreedAmount?.toString() ?? ""}
                     onChange={(e) => setState((s) => ({ ...s, agreedAmount: Number(e.target.value.replace(/[^0-9.]/g, "")) || undefined }))} />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input id="rel-sent" type="checkbox" className="h-4 w-4" checked={state.releaseSent}
                     onChange={(e) => setState((s) => ({ ...s, releaseSent: e.target.checked }))} />
              <Label htmlFor="rel-sent">Release sent</Label>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input id="rel-signed" type="checkbox" className="h-4 w-4" checked={state.releaseSigned}
                     onChange={(e) => setState((s) => ({ ...s, releaseSigned: e.target.checked }))} />
              <Label htmlFor="rel-signed">Release signed</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funds receipt */}
      <Card>
        <CardHeader>
          <CardTitle>Settlement Funds</CardTitle>
          <CardDescription>Log receipt and amount for distribution.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="funds-date">Date received</Label>
              <DatePicker id="funds-date" value={state.fundsReceivedDate ?? ""}
                     onChange={(v) => setState((s) => ({ ...s, fundsReceivedDate: v }))} />
            </div>
            <div>
              <Label htmlFor="funds-amt">Amount received</Label>
              <Input id="funds-amt" placeholder="$50,000" value={state.fundsAmount?.toString() ?? ""}
                     onChange={(e) => setState((s) => ({ ...s, fundsAmount: Number(e.target.value.replace(/[^0-9.]/g, "")) || undefined }))} />
            </div>
            <div className="flex items-end">
              <Button onClick={markFundsReceived} disabled={!state.fundsAmount || !state.fundsReceivedDate}>Mark Received</Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="fee">Attorney fee %</Label>
              <Input id="fee" type="number" min={0} max={60} value={state.feePercent}
                     onChange={(e) => setState((s) => ({ ...s, feePercent: Math.max(0, Math.min(60, Number(e.target.value || 0))) }))} />
            </div>
            <div>
              <Label htmlFor="costs">Case costs</Label>
              <Input id="costs" placeholder="$0" value={state.costs?.toString() ?? "0"}
                     onChange={(e) => setState((s) => ({ ...s, costs: Number(e.target.value.replace(/[^0-9.]/g, "")) || 0 }))} />
            </div>
          </div>

          <div className="rounded-md border border-card-border p-4 text-sm grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div><div className="text-muted-foreground">Funds received</div><div className="font-medium">${totals.funds.toLocaleString()}</div></div>
            <div><div className="text-muted-foreground">Attorney fee</div><div className="font-medium">${totals.fee.toLocaleString()} ({state.feePercent}%)</div></div>
            <div><div className="text-muted-foreground">Case costs</div><div className="font-medium">${totals.costs.toLocaleString()}</div></div>
            <div><div className="text-muted-foreground">To providers</div><div className="font-medium">${totals.providerTotal.toLocaleString()}</div></div>
            <div className="sm:col-span-2 lg:col-span-4"><div className="text-muted-foreground">Net to client</div><div className="text-xl font-semibold">${totals.net.toLocaleString()}</div></div>
          </div>
        </CardContent>
      </Card>

      {/* Provider payments */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Payments</CardTitle>
          <CardDescription>Add payees and track payment status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Provider name" value={newProvider} onChange={(e) => setNewProvider(e.target.value)} />
            <Input placeholder="$1,200" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
            <Button onClick={addProvider}>Add</Button>
          </div>

          {providers.length === 0 ? (
            <div className="text-sm text-muted-foreground">No providers added yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2">Provider</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Paid</th>
                    <th className="py-2">Date Paid</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {providers.map((p) => (
                    <tr key={p.id} className="border-t border-card-border">
                      <td className="py-2 align-top">{p.name}</td>
                      <td className="py-2 align-top">${p.amount.toLocaleString()}</td>
                      <td className="py-2 align-top">
                        <label className="inline-flex items-center gap-2">
                          <input type="checkbox" checked={p.paid} onChange={(e) => setProviders((arr) => arr.map((row) => row.id === p.id ? { ...row, paid: e.target.checked } : row))} /> Paid
                        </label>
                      </td>
                      <td className="py-2 align-top">
                        <DatePicker value={p.datePaid ?? ""} onChange={(v) => setProviders((arr) => arr.map((row) => row.id === p.id ? { ...row, datePaid: v } : row))} />
                      </td>
                      <td className="py-2 align-top text-right">
                        <Button variant="ghost" onClick={() => setProviders((arr) => arr.filter((row) => row.id !== p.id))}>Remove</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


