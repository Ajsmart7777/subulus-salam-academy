import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Gift, Trophy, Users } from "lucide-react";

const AdminReferralsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-referrals"],
    queryFn: async () => {
      const [rewardsRes, codesRes] = await Promise.all([
        supabase.from("referral_rewards").select("*"),
        supabase.from("referral_codes").select("*"),
      ]);

      // Build leaderboard from rewards
      const creditsByUser: Record<string, number> = {};
      (rewardsRes.data ?? []).forEach((r) => {
        creditsByUser[r.referrer_id] = (creditsByUser[r.referrer_id] ?? 0) + r.credits;
      });

      // Get profile names
      const userIds = [...new Set([
        ...Object.keys(creditsByUser),
        ...(codesRes.data ?? []).map((c) => c.user_id),
      ])];
      const { data: profiles } = userIds.length
        ? await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds)
        : { data: [] };
      const nameMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p.full_name]));

      const leaderboard = Object.entries(creditsByUser)
        .map(([userId, credits]) => ({ userId, name: nameMap[userId] ?? "Unknown", credits }))
        .sort((a, b) => b.credits - a.credits);

      return {
        totalReferrals: rewardsRes.data?.length ?? 0,
        totalCreditsAwarded: (rewardsRes.data ?? []).reduce((sum, r) => sum + r.credits, 0),
        totalCodes: codesRes.data?.length ?? 0,
        leaderboard,
        codes: (codesRes.data ?? []).map((c) => ({
          ...c,
          name: nameMap[c.user_id] ?? "Unknown",
        })),
      };
    },
  });

  return (
    <AdminLayout title="Referral System">
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Total Referrals</CardTitle>
                <Users className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent><p className="text-3xl font-heading font-bold">{data?.totalReferrals ?? 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Credits Awarded</CardTitle>
                <Gift className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent><p className="text-3xl font-heading font-bold">{data?.totalCreditsAwarded ?? 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-body text-muted-foreground">Active Codes</CardTitle>
                <Trophy className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent><p className="text-3xl font-heading font-bold">{data?.totalCodes ?? 0}</p></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" /> Referral Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!data?.leaderboard.length ? (
                <p className="text-sm text-muted-foreground">No referrals yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Credits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.leaderboard.map((entry, i) => (
                      <TableRow key={entry.userId}>
                        <TableCell>
                          <Badge variant={i === 0 ? "default" : "secondary"} className="text-xs">
                            #{i + 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{entry.name}</TableCell>
                        <TableCell>{entry.credits} credits</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading">All Referral Codes</CardTitle>
            </CardHeader>
            <CardContent>
              {!data?.codes.length ? (
                <p className="text-sm text-muted-foreground">No codes generated yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.codes.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell><code className="bg-muted px-2 py-1 rounded text-sm">{c.code}</code></TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(c.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminReferralsPage;
