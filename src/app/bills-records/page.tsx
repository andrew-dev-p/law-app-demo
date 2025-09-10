"use client";

import { BackLink } from "@/components/app/back-link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Provider = {
  id: string;
  name: string;
  recordsRequested: boolean;
  recordsReceived: boolean;
  billsReceived: boolean;
  notes?: string;
};

const KEY = "bills-records-providers";

export default function BillsRecordsPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setProviders(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify(providers));
  }, [providers]);

  const add = () => {
    if (!name.trim()) return;
    setProviders((arr) => [
      { id: crypto.randomUUID(), name: name.trim(), recordsRequested: false, recordsReceived: false, billsReceived: false },
      ...arr,
    ]);
    setName("");
  };
  const remove = (id: string) => setProviders((arr) => arr.filter((p) => p.id !== id));
  const toggle = (id: string, key: keyof Omit<Provider, "id" | "name" | "notes">) =>
    setProviders((arr) => arr.map((p) => (p.id === id ? { ...p, [key]: !p[key] } : p)));

  const stats = useMemo(() => {
    const total = providers.length;
    const requested = providers.filter((p) => p.recordsRequested).length;
    const haveRecords = providers.filter((p) => p.recordsReceived).length;
    const haveBills = providers.filter((p) => p.billsReceived).length;
    return { total, requested, haveRecords, haveBills };
  }, [providers]);

  // Pull count of general uploads from Intake to reflect bills/documents provided by the client
  const [uploadCount, setUploadCount] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("intake-state");
      if (raw) {
        const s = JSON.parse(raw);
        setUploadCount((s.uploads?.length as number) || 0);
      }
    } catch {}
  }, []);

  return (
    <div className="w-full p-6 space-y-6">
      <BackLink className="mb-3" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Bills & Records</h1>
          <p className="text-sm text-muted-foreground">Track providers and collection status for records and bills.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline">Providers: {stats.total}</Badge>
          <Badge variant={stats.requested ? "success" : "outline"}>Requested: {stats.requested}</Badge>
          <Badge variant={stats.haveRecords ? "success" : "outline"}>Records: {stats.haveRecords}</Badge>
          <Badge variant={(stats.haveBills + uploadCount) ? "success" : "outline"}>Bills/Docs: {stats.haveBills + uploadCount}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Provider</CardTitle>
          <CardDescription>Enter the clinic, hospital, or imaging center.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="e.g., City Chiropractic" value={name} onChange={(e) => setName(e.target.value)} />
            <Button onClick={add}>Add</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Providers</CardTitle>
          <CardDescription>Toggle stages as work progresses.</CardDescription>
        </CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <div className="text-sm text-muted-foreground">No providers yet. Add your first above.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2">Provider</th>
                    <th className="py-2">Requested</th>
                    <th className="py-2">Records Received</th>
                    <th className="py-2">Bills Received</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {providers.map((p) => (
                    <tr key={p.id} className="border-t border-card-border">
                      <td className="py-2 align-top">{p.name}</td>
                      <td className="py-2 align-top">
                        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={p.recordsRequested} onChange={() => toggle(p.id, "recordsRequested")} /> Requested</label>
                      </td>
                      <td className="py-2 align-top">
                        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={p.recordsReceived} onChange={() => toggle(p.id, "recordsReceived")} /> Received</label>
                      </td>
                      <td className="py-2 align-top">
                        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={p.billsReceived} onChange={() => toggle(p.id, "billsReceived")} /> Received</label>
                      </td>
                      <td className="py-2 align-top text-right">
                        <Button variant="ghost" onClick={() => remove(p.id)}>Remove</Button>
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


