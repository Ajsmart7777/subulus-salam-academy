import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AdminSettingsPage = () => {
  const queryClient = useQueryClient();
  const [siteName, setSiteName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [flwPublicKey, setFlwPublicKey] = useState("");
  const [flwSecretKey, setFlwSecretKey] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value");
      if (error) throw error;
      const map: Record<string, string> = {};
      (data ?? []).forEach((s) => { map[s.key] = s.value; });
      return map;
    },
  });

  useEffect(() => {
    if (settings) {
      setSiteName(settings.site_name ?? "");
      setContactEmail(settings.contact_email ?? "");
      setContactPhone(settings.contact_phone ?? "");
      setAddress(settings.address ?? "");
      setFlwPublicKey(settings.flutterwave_public_key ?? "");
      setFlwSecretKey(settings.flutterwave_secret_key ?? "");
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (entries: { key: string; value: string }[]) => {
      for (const entry of entries) {
        const { error } = await supabase
          .from("site_settings")
          .update({ value: entry.value })
          .eq("key", entry.key);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast({ title: "Settings saved", description: "Site settings have been updated." });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const handleSave = () => {
    saveMutation.mutate([
      { key: "site_name", value: siteName },
      { key: "contact_email", value: contactEmail },
      { key: "contact_phone", value: contactPhone },
      { key: "address", value: address },
      { key: "flutterwave_public_key", value: flwPublicKey },
      { key: "flutterwave_secret_key", value: flwSecretKey },
    ]);
  };

  const flwConfigured = !!(settings?.flutterwave_public_key && settings?.flutterwave_secret_key);

  if (isLoading) {
    return (
      <AdminLayout title="Site Settings">
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Site Settings">
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Site Name</Label>
              <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            </div>
            <div>
              <Label>Contact Email</Label>
              <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="info@sabiluljannah.com" />
            </div>
            <div>
              <Label>Contact Phone</Label>
              <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+234..." />
            </div>
            <div>
              <Label>Address</Label>
              <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="School address" rows={2} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading">Flutterwave Payment Gateway</CardTitle>
              {flwConfigured ? (
                <Badge className="bg-primary/10 text-primary text-xs gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-muted-foreground">Not Configured</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground font-body">
              Enter your Flutterwave API keys below. Once saved, course payments will be automatically enabled.
              Get your keys from{" "}
              <a href="https://dashboard.flutterwave.com/settings/apis" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Flutterwave Dashboard → Settings → API Keys
              </a>.
            </p>
            <div>
              <Label>Public Key</Label>
              <Input
                value={flwPublicKey}
                onChange={(e) => setFlwPublicKey(e.target.value)}
                placeholder="FLWPUBK-xxxxxxxxxxxxxxxx-X"
              />
            </div>
            <div>
              <Label>Secret Key</Label>
              <div className="relative">
                <Input
                  type={showSecret ? "text" : "password"}
                  value={flwSecretKey}
                  onChange={(e) => setFlwSecretKey(e.target.value)}
                  placeholder="FLWSECK-xxxxxxxxxxxxxxxx-X"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button variant="hero" onClick={handleSave} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
