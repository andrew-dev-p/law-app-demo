"use client";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type BankInfo = {
  holder?: string;
  bankName?: string;
  type?: "checking" | "savings" | "other";
  accountLast4?: string;
  routingLast4?: string;
  updatedAt?: string;
};

const BANK_KEY = "settings-bank";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();

  // Profile state
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Bank state
  const [bank, setBank] = useState<BankInfo>({});
  const [holder, setHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [type, setType] = useState<"checking" | "savings" | "other">("checking");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [savingBank, setSavingBank] = useState(false);
  const [bankMsg, setBankMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    setFirst(user?.firstName || ((user?.unsafeMetadata as any)?.contactFirstName as string) || "");
    setLast(user?.lastName || ((user?.unsafeMetadata as any)?.contactLastName as string) || "");
    setEmail(user?.primaryEmailAddress?.emailAddress || ((user?.unsafeMetadata as any)?.contactEmail as string) || "");
    setPhone(((user?.unsafeMetadata as any)?.contactPhone as string) || "");
  }, [isLoaded, user]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(BANK_KEY);
      if (raw) {
        const parsed: BankInfo = JSON.parse(raw);
        setBank(parsed);
        setHolder(parsed.holder || "");
        setBankName(parsed.bankName || "");
        setType((parsed.type as any) || "checking");
      }
    } catch {}
  }, []);

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await user.update({
        unsafeMetadata: {
          ...(user.unsafeMetadata || {}),
          contactFirstName: first.trim(),
          contactLastName: last.trim(),
          contactEmail: email.trim(),
          contactPhone: phone.trim(),
        },
      } as any);
      setProfileMsg("Saved");
    } catch (e: any) {
      setProfileMsg(e?.message || "Failed to save");
    } finally {
      setSavingProfile(false);
    }
  };

  const saveBank = () => {
    setSavingBank(true);
    setBankMsg(null);
    try {
      const digits = (s: string) => (s || "").replace(/\D+/g, "");
      const acct = digits(accountNumber);
      const rout = digits(routingNumber);
      const next: BankInfo = {
        holder: holder.trim() || bank.holder,
        bankName: bankName.trim() || bank.bankName,
        type,
        accountLast4: acct ? acct.slice(-4) : bank.accountLast4,
        routingLast4: rout ? rout.slice(-4) : bank.routingLast4,
        updatedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(BANK_KEY, JSON.stringify(next));
      setBank(next);
      setAccountNumber("");
      setRoutingNumber("");
      setBankMsg("Saved");
    } catch (e: any) {
      setBankMsg(e?.message || "Failed to save");
    } finally {
      setSavingBank(false);
    }
  };

  const bankSummary = useMemo(() => {
    const parts = [] as string[];
    if (bank.bankName) parts.push(bank.bankName);
    if (bank.type) parts.push(bank.type);
    if (bank.accountLast4) parts.push(`Acct ••••${bank.accountLast4}`);
    if (bank.routingLast4) parts.push(`Routing ••••${bank.routingLast4}`);
    return parts.join(" · ") || "No bank info on file";
  }, [bank]);

  return (
    <div className="w-full p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and payout details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your name and contact information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
            <div>
              <Label htmlFor="first">First name</Label>
              <Input id="first" value={first} onChange={(e) => setFirst(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="last">Last name</Label>
              <Input id="last" value={last} onChange={(e) => setLast(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 555-5555" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={saveProfile} disabled={savingProfile}>Save Profile</Button>
            {profileMsg && <span className="text-sm text-muted-foreground">{profileMsg}</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank Account</CardTitle>
          <CardDescription>Add payout details to receive payments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-card-border p-3 text-sm bg-card">
            <div className="text-muted-foreground">Current</div>
            <div className="font-medium">{bankSummary}</div>
            {bank.updatedAt && (
              <div className="text-xs text-muted-foreground mt-1">Updated {new Date(bank.updatedAt).toLocaleString()}</div>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
            <div className="sm:col-span-2">
              <Label htmlFor="holder">Account holder name</Label>
              <Input id="holder" value={holder} onChange={(e) => setHolder(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bank">Bank name</Label>
              <Input id="bank" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="type">Account type</Label>
              <Select value={type} onValueChange={(v) => setType(v as any)}>
                <SelectTrigger id="type" className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="routing">Routing number</Label>
              <Input id="routing" value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value)} placeholder="123456789" />
            </div>
            <div>
              <Label htmlFor="account">Account number</Label>
              <Input id="account" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="000123456789" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={saveBank} disabled={savingBank}>Save Bank</Button>
            {bankMsg && <span className="text-sm text-muted-foreground">{bankMsg}</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
