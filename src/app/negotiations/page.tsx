"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Offer = {
  id: string;
  dateISO: string;
  from: "Insurer" | "Client";
  amount: number;
  note?: string;
};

const KEY = "negotiations-offers";

export default function NegotiationsPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setOffers(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify(offers));
  }, [offers]);

  const addCounter = () => {
    const amt = Number(amount.replace(/[^0-9.]/g, ""));
    if (!amt) return;
    const entry: Offer = {
      id: crypto.randomUUID(),
      dateISO: new Date().toISOString().slice(0, 10),
      from: "Client",
      amount: Math.round(amt),
      note: note.trim() || undefined,
    };
    setOffers((arr) => [entry, ...arr]);
    setAmount("");
    setNote("");
  };

  const bestInsurer = useMemo(() => {
    return offers.filter((o) => o.from === "Insurer").reduce((max, o) => (o.amount > (max?.amount ?? 0) ? o : max), undefined as Offer | undefined);
  }, [offers]);

  const lastClient = useMemo(() => offers.find((o) => o.from === "Client"), [offers]);

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Negotiations</h1>
          <p className="text-sm text-muted-foreground">Track insurer offers and propose counters.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant={bestInsurer ? "success" : "outline"}>Best offer: {bestInsurer ? `$${bestInsurer.amount.toLocaleString()}` : "—"}</Badge>
          <Badge variant={lastClient ? "outline" : "destructive"}>{lastClient ? `Last counter: $${lastClient.amount.toLocaleString()}` : "No counter yet"}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Propose Counter</CardTitle>
          <CardDescription>Enter your counter amount and an optional note.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" placeholder="$25,000" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="note">Note (optional)</Label>
              <Input id="note" placeholder="e.g., reflects ongoing PT" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={addCounter}>Submit Counter</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Newest first. Add insurer offers manually for demo.</CardDescription>
        </CardHeader>
        <CardContent>
          {offers.length === 0 ? (
            <div className="text-sm text-muted-foreground">No activity yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2">Date</th>
                    <th className="py-2">From</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((o) => (
                    <tr key={o.id} className="border-t border-card-border">
                      <td className="py-2">{o.dateISO}</td>
                      <td className="py-2">
                        <Badge variant={o.from === "Insurer" ? "outline" : "success"}>{o.from}</Badge>
                      </td>
                      <td className="py-2">${o.amount.toLocaleString()}</td>
                      <td className="py-2">{o.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Demo Controls</CardTitle>
          <CardDescription>Add a sample insurer offer (for testing).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setOffers((arr) => [
                  {
                    id: crypto.randomUUID(),
                    dateISO: new Date().toISOString().slice(0, 10),
                    from: "Insurer",
                    amount: Math.round(15000 + Math.random() * 20000),
                    note: "Initial offer",
                  },
                  ...arr,
                ])
              }
            >
              Add Insurer Offer
            </Button>
            <Button variant="outline" onClick={() => setOffers([])}>Clear History</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
