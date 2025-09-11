"use client";

import { BackLink } from "@/components/app/back-link";
import { useEffect, useMemo, useState } from "react";
import VoiceRecorder from "@/components/app/voice-recorder";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic } from "lucide-react";

type CheckIn = {
  id: string;
  dateISO: string; // YYYY-MM-DD
  notes: string; // transcript text
  transcript?: string;
};

const KEY = "checkins-data";

export default function CheckInsPage() {
  const [entries, setEntries] = useState<CheckIn[]>([]);
  const [showVoice, setShowVoice] = useState(false);

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

  const addVoice = (transcript: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const e: CheckIn = {
      id: crypto.randomUUID(),
      dateISO: today,
      notes: transcript,
      transcript,
    };
    setEntries((arr) => [e, ...arr]);
  };

  const remove = (id: string) =>
    setEntries((arr) => arr.filter((e) => e.id !== id));

  const lastDate = useMemo(() => entries[0]?.dateISO || null, [entries]);

  return (
    <div className="w-full p-6 space-y-6">
      <BackLink className="mb-3" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Medical Check-ins</h1>
          <p className="text-sm text-muted-foreground">
            Use voice to log updates for your case.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {lastDate && <Badge variant="outline">Last: {lastDate}</Badge>}
        </div>
      </div>

      <Card>
        {!showVoice ? (
          <div className="flex items-center justify-between pr-6">
            <CardHeader>
              <CardTitle>Law AI Agent Check-In</CardTitle>
              <CardDescription>
                Tap the mic and speak your update.
              </CardDescription>
            </CardHeader>
            <Button onClick={() => setShowVoice(true)}>
              <Mic size={16} />
              Speak to Agent
            </Button>
          </div>
        ) : (
          <div className="fixed inset-0 z-50 bg-white">
            <VoiceRecorder
              onClose={() => setShowVoice(false)}
              onSave={(t) => {
                addVoice(t);
                setShowVoice(false);
              }}
            />
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Check-ins</CardTitle>
          <CardDescription>Your last entries appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No check-ins yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2">Date</th>
                    <th className="py-2">Notes</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id} className="border-t border-card-border">
                      <td className="py-2 align-top">{e.dateISO}</td>
                      <td className="py-2 align-top max-w-[480px]">
                        <div className="line-clamp-3 whitespace-pre-wrap">
                          {e.notes || "—"}
                        </div>
                      </td>
                      <td className="py-2 align-top text-right">
                        <Button variant="ghost" onClick={() => remove(e.id)}>
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
