import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, DollarSign } from "lucide-react";

const AdminDonationsPage = () => {
  const { data: donations, isLoading } = useQuery({
    queryKey: ["admin-donations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const totalCompleted = donations?.filter((d: any) => d.status === "completed").reduce((sum: number, d: any) => sum + Number(d.amount), 0) ?? 0;
  const totalCount = donations?.filter((d: any) => d.status === "completed").length ?? 0;

  return (
    <AdminLayout title="Donations">
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Donations</h1>

        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl gradient-hero flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-body">Total Donated</p>
                <p className="text-2xl font-heading font-bold text-foreground">₦{totalCompleted.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl gradient-gold flex items-center justify-center">
                <Heart className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-body">Total Donations</p>
                <p className="text-2xl font-heading font-bold text-foreground">{totalCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">All Donations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Donor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donations?.map((d: any) => (
                      <TableRow key={d.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{d.donor_name}</p>
                            <p className="text-xs text-muted-foreground">{d.donor_email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold">₦{Number(d.amount).toLocaleString()}</TableCell>
                        <TableCell><Badge variant="outline">{d.type}</Badge></TableCell>
                        <TableCell>
                          <Badge className={d.status === "completed" ? "bg-primary/10 text-primary" : d.status === "failed" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}>
                            {d.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDonationsPage;
