"use client";
import { useEffect, useMemo, useState } from "react";
import { SignedIn, useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SetupAccountGate() {
  const { isLoaded, user } = useUser();
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alreadyCompleted = useMemo(() => {
    // Track completion in unsafeMetadata (client-writable)
    return Boolean((user?.unsafeMetadata as any)?.setupCompleted);
  }, [user]);

  useEffect(() => {
    if (!isLoaded || !user) return;
    const preEmail = user.primaryEmailAddress?.emailAddress || "";
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setEmail(preEmail);
    setPhone(((user.unsafeMetadata as any)?.contactPhone as string) || "");
    // Open if not completed yet
    setOpen(!alreadyCompleted);
  }, [isLoaded, user, alreadyCompleted]);

  const disabled = saving || !firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim();

  const submit = async () => {
    if (!user) return;
    try {
      setSaving(true);
      setError(null);
      // Store contact info in unsafeMetadata to avoid server-side requirements
      await user.update({
        // Keep Clerk profile names if available, but do not rely on them being writable client-side
        unsafeMetadata: {
          ...(user.unsafeMetadata || {}),
          setupCompleted: true,
          contactFirstName: firstName.trim(),
          contactLastName: lastName.trim(),
          contactEmail: email.trim(),
          contactPhone: phone.trim(),
        },
      } as any);
      setOpen(false);
    } catch (e: any) {
      setError(e?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <SignedIn>
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Setup Account</CardTitle>
            <CardDescription>Help us contact you with case updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sa-first">First name</Label>
                <Input id="sa-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="sa-last">Last name</Label>
                <Input id="sa-last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="sa-email">Email</Label>
              <Input id="sa-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="sa-phone">Phone</Label>
              <Input id="sa-phone" placeholder="(555) 555-5555" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            {error && <div className="text-sm text-muted-foreground">{error}</div>}
            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={submit} disabled={disabled}>{saving ? "Saving..." : "Save"}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SignedIn>
  );
}
