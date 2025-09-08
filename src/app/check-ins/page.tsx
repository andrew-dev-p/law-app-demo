"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type CheckIn = {
  id: string;
  dateISO: string; // YYYY-MM-DD
  pain: number; // 0-10
  visits: number; // visits this week
  notes: string;
};

const KEY = "checkins-data";

export default function CheckInsPage() {
  const [entries, setEntries] = useState<CheckIn[]>([]);
  const [dateISO, setDateISO] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [pain, setPain] = useState<number>(3);
  const [visits, setVisits] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify(entries));
  }, [entries]);

  const add = () => {
    const e: CheckIn = { id: crypto.randomUUID(), dateISO, pain, visits, notes };
    setEntries((arr) => [e, ...arr]);
    setNotes("");
  };
  const remove = (id: string) => setEntries((arr) => arr.filter((e) => e.id !== id));

  const lastDate = useMemo(() => entries[0]?.dateISO || null, [entries]);
  const avgPain = useMemo(() => {
    if (entries.length === 0) return null;
    const n = Math.min(entries.length, 5);
    const s = entries.slice(0, n).reduce((a, b) => a + b.pain, 0);
    return Math.round((s / n) * 10) / 10;
  }, [entries]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Medical Check-ins</h1>
          <p className="text-sm text-muted-foreground">Track pain, visits, and notes to help your case.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {lastDate && <Badge variant="outline">Last: {lastDate}</Badge>}
          {avgPain != null && <Badge variant={avgPain >= 6 ? "warning" : "success"}>Avg pain: {avgPain}</Badge>}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Check-in</CardTitle>
          <CardDescription>It takes less than a minute.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={dateISO} onChange={(e) => setDateISO(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="visits">Visits this week</Label>
              <Input id="visits" type="number" min={0} value={visits} onChange={(e) => setVisits(Number(e.target.value || 0))} />
            </div>
          </div>
          <div>
            <Label htmlFor="pain">Pain level: {pain}</Label>
            <input id="pain" type="range" min={0} max={10} step={1} value={pain} onChange={(e) => setPain(Number(e.target.value))} className="mt-2 w-full" />
          </div>
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <textarea id="notes" rows={3} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Any new issues, imaging, medications, or provider updates?" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={add}>Add Check-in</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Check-ins</CardTitle>
          <CardDescription>Your last entries appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-sm text-muted-foreground">No check-ins yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2">Date</th>
                    <th className="py-2">Pain</th>
                    <th className="py-2">Visits</th>
                    <th className="py-2">Notes</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id} className="border-t">
                      <td className="py-2 align-top">{e.dateISO}</td>
                      <td className="py-2 align-top">{e.pain}</td>
                      <td className="py-2 align-top">{e.visits}</td>
                      <td className="py-2 align-top max-w-[480px]">
                        <div className="line-clamp-3 whitespace-pre-wrap">{e.notes || "—"}</div>
                      </td>
                      <td className="py-2 align-top text-right">
                        <Button variant="ghost" onClick={() => remove(e.id)}>Remove</Button>
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

