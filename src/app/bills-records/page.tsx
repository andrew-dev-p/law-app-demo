"use client";

import { BackLink } from "@/components/app/back-link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type RequestStatus = "idle" | "pending" | "done" | "failed";

type Provider = {
  id: string;
  name: string;
  recordsRequested: boolean;
  recordsReceived: boolean;
  billsReceived: boolean;
  notes?: string;
  request?: {
    status: RequestStatus;
    startedAt?: string; // ISO
    completedAt?: string; // ISO
    phone?: string;
    fax?: string;
    email?: string;
  };
};

type DirectoryEntry = {
  name: string;
  phone?: string;
  fax?: string;
  email?: string;
};

const KEY = "bills-records-providers";
const DIRECTORY: DirectoryEntry[] = [
  {
    name: "City Chiropractic",
    phone: "(555) 201-1122",
    fax: "(555) 201-1188",
    email: "records@citychiro.example",
  },
  {
    name: "Metro Imaging Center",
    phone: "(555) 441-9000",
    fax: "(555) 441-9001",
    email: "roi@metroimg.example",
  },
  {
    name: "General Hospital",
    phone: "(555) 800-3000",
    fax: "(555) 800-3005",
    email: "medical.records@generalhosp.example",
  },
];

export default function BillsRecordsPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [name, setName] = useState("");
  // Request Records form state
  const [reqName, setReqName] = useState("");
  const [reqPhone, setReqPhone] = useState("");
  const [reqFax, setReqFax] = useState("");
  const [reqEmail, setReqEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

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

  // Simulate async API delivering records a short time after request
  useEffect(() => {
    if (pollRef.current != null) window.clearInterval(pollRef.current);
    pollRef.current = window.setInterval(() => {
      setProviders((arr) => {
        const now = Date.now();
        let changed = false;
        const next = arr.map((p) => {
          if (p.request?.status === "pending" && p.request.startedAt) {
            const started = new Date(p.request.startedAt).getTime();
            if (now - started > 10000) {
              changed = true;
              return {
                ...p,
                recordsReceived: true,
                request: {
                  ...p.request,
                  status: "done" as RequestStatus,
                  completedAt: new Date().toISOString(),
                },
              };
            }
          }
          return p;
        });
        return changed ? next : arr;
      });
    }, 2000);
    return () => {
      if (pollRef.current != null) window.clearInterval(pollRef.current);
    };
  }, []);

  const add = () => {
    if (!name.trim()) return;
    setProviders((arr) => [
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        recordsRequested: false,
        recordsReceived: false,
        billsReceived: false,
      },
      ...arr,
    ]);
    setName("");
  };
  const remove = (id: string) =>
    setProviders((arr) => arr.filter((p) => p.id !== id));
  const toggle = (
    id: string,
    key: keyof Omit<Provider, "id" | "name" | "notes" | "request">
  ) =>
    setProviders((arr) =>
      arr.map((p) => (p.id === id ? { ...p, [key]: !(p as any)[key] } : p))
    );

  const searchDirectory = async () => {
    const term = reqName.trim();
    if (!term) return;
    setSearching(true);
    setSearchMsg("Searching directory…");
    await new Promise((r) => setTimeout(r, 900));
    const hit = DIRECTORY.find((d) =>
      d.name.toLowerCase().includes(term.toLowerCase())
    );
    if (hit) {
      setReqName(hit.name);
      setReqPhone(hit.phone || "");
      setReqFax(hit.fax || "");
      setReqEmail(hit.email || "");
      setSearchMsg("Found provider. Details prefilled.");
    } else {
      setSearchMsg("No exact match. Please complete details.");
    }
    setSearching(false);
  };

  const requestRecords = () => {
    if (!reqName.trim()) return;
    const exists = providers.find(
      (p) => p.name.toLowerCase() === reqName.trim().toLowerCase()
    );
    const id = exists?.id || crypto.randomUUID();
    const base: Provider = exists || {
      id,
      name: reqName.trim(),
      recordsRequested: false,
      recordsReceived: false,
      billsReceived: false,
    };
    const updated: Provider = {
      ...base,
      recordsRequested: true,
      request: {
        status: "pending",
        startedAt: new Date().toISOString(),
        phone: reqPhone || base.request?.phone,
        fax: reqFax || base.request?.fax,
        email: reqEmail || base.request?.email,
      },
    };
    setProviders((arr) => {
      const others = arr.filter((p) => p.id !== id);
      return [updated, ...others];
    });
    setSearchMsg("Request sent. Status: Pending");
  };

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
          <p className="text-sm text-muted-foreground">
            Track providers and collection status for records and bills.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline">Providers: {stats.total}</Badge>
          <Badge variant={stats.requested ? "success" : "outline"}>
            Requested: {stats.requested}
          </Badge>
          <Badge variant={stats.haveRecords ? "success" : "outline"}>
            Records: {stats.haveRecords}
          </Badge>
          <Badge
            variant={stats.haveBills + uploadCount ? "success" : "outline"}
          >
            Bills/Docs: {stats.haveBills + uploadCount}
          </Badge>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Request Records</CardTitle>
          <CardDescription>
            Search a practice and send a records request. If not found, fill
            details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <Label htmlFor="req-name">Practice name</Label>
              <div className="mt-1 flex gap-2">
                <Input
                  id="req-name"
                  placeholder="e.g., City Chiropractic"
                  value={reqName}
                  onChange={(e) => setReqName(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={searchDirectory}
                  disabled={searching}
                >
                  {searching ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full border-2 border-muted border-t-primary animate-spin" />{" "}
                      Searching
                    </span>
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
              {searchMsg && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {searchMsg}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="req-phone">Phone</Label>
              <Input
                id="req-phone"
                placeholder="(555) 555-1212"
                value={reqPhone}
                onChange={(e) => setReqPhone(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="req-fax">Fax</Label>
              <Input
                id="req-fax"
                placeholder="(555) 555-3434"
                value={reqFax}
                onChange={(e) => setReqFax(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <Label htmlFor="req-email">Records email</Label>
              <Input
                id="req-email"
                type="email"
                placeholder="records@practice.com"
                value={reqEmail}
                onChange={(e) => setReqEmail(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                onClick={requestRecords}
                disabled={!reqName.trim()}
              >
                Request Records
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Add Provider</CardTitle>
          <CardDescription>
            Enter the clinic, hospital, or imaging center.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., City Chiropractic"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button onClick={add}>Add</Button>
          </div>
        </CardContent>
      </Card>{" "}
      <Card>
        <CardHeader>
          <CardTitle>Providers</CardTitle>
          <CardDescription>Toggle stages as work progresses.</CardDescription>
        </CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No providers yet. Add your first above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2">Provider</th>
                    <th className="py-2">Request Status</th>
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
                        {p.request?.status === "pending" && (
                          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="inline-block h-3 w-3 rounded-full border-2 border-muted border-t-primary animate-spin" />{" "}
                            Pending
                          </span>
                        )}
                        {p.request?.status === "done" && (
                          <Badge variant="success">Done</Badge>
                        )}
                        {!p.request?.status && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReqName(p.name);
                              setReqPhone(p.request?.phone || "");
                              setReqFax(p.request?.fax || "");
                              setReqEmail(p.request?.email || "");
                            }}
                          >
                            Prepare Request
                          </Button>
                        )}
                      </td>
                      <td className="py-2 align-top">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={p.recordsRequested}
                            onChange={() => toggle(p.id, "recordsRequested")}
                          />{" "}
                          Requested
                        </label>
                      </td>
                      <td className="py-2 align-top">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={p.recordsReceived}
                            onChange={() => toggle(p.id, "recordsReceived")}
                          />{" "}
                          Received
                        </label>
                      </td>
                      <td className="py-2 align-top">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={p.billsReceived}
                            onChange={() => toggle(p.id, "billsReceived")}
                          />{" "}
                          Received
                        </label>
                      </td>
                      <td className="py-2 align-top text-right">
                        <Button variant="ghost" onClick={() => remove(p.id)}>
                          Remove
                        </Button>
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
