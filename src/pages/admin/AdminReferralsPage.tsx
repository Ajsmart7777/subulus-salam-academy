import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift } from "lucide-react";

const AdminReferralsPage = () => {
  return (
    <AdminLayout title="Referral System">
      <div className="max-w-2xl mx-auto py-12 text-center">
        <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Referral System</h2>
        <p className="text-muted-foreground font-body mb-6">
          The automated referral system is coming soon. Each valued referral will earn 100 credits
          when the referred student enrolls in a course. Leaderboards will be auto-updated monthly.
        </p>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Planned Features</CardTitle>
          </CardHeader>
          <CardContent className="text-left text-sm text-muted-foreground font-body space-y-2">
            <p>• Automatic 100 credit reward per successful referral</p>
            <p>• Referral tracking linked to course enrollment</p>
            <p>• Monthly/yearly leaderboard auto-update</p>
            <p>• Top referrers overview</p>
            <p>• Student referral dashboard</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminReferralsPage;
