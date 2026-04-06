import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const AdminSettingsPage = () => {
  const [siteName, setSiteName] = useState("Sabilul Jannah International Online Islamiyya");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [faq, setFaq] = useState("");

  const handleSave = () => {
    // TODO: persist to database when site_settings table is added
    toast({ title: "Settings saved", description: "Site settings have been updated." });
  };

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
            <CardTitle className="font-heading">FAQ Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={faq} onChange={(e) => setFaq(e.target.value)} placeholder="Enter FAQ content..." rows={6} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Payment Gateway</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground font-body">
            <p>Flutterwave integration coming soon. You'll be able to set your API keys here to enable course payments.</p>
          </CardContent>
        </Card>

        <Button variant="hero" onClick={handleSave}>Save Settings</Button>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
