import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Plus, Target } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const AdminCampaignsPage = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalAmount, setGoalAmount] = useState(0);

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      const { data } = await supabase.from("donation_campaigns").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const createCampaign = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("donation_campaigns").insert({ title, description, goal_amount: goalAmount });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      toast({ title: "Campaign created" });
      setOpen(false);
      setTitle(""); setDescription(""); setGoalAmount(0);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("donation_campaigns").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] }),
  });

  return (
    <AdminLayout title="Campaigns">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-foreground">Campaigns</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" className="gap-2"><Plus className="h-4 w-4" /> New Campaign</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading">Create Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
                <div><Label>Goal Amount (₦)</Label><Input type="number" value={goalAmount || ""} onChange={(e) => setGoalAmount(Number(e.target.value))} /></div>
                <Button variant="hero" className="w-full" onClick={() => createCampaign.mutate()} disabled={!title || createCampaign.isPending}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {campaigns?.map((c: any) => {
              const progress = c.goal_amount > 0 ? Math.round((c.raised_amount / c.goal_amount) * 100) : 0;
              return (
                <Card key={c.id}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-heading font-bold">{c.title}</h3>
                          <p className="text-xs text-muted-foreground">{c.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={c.active ? "default" : "outline"}>{c.active ? "Active" : "Inactive"}</Badge>
                        <Switch checked={c.active} onCheckedChange={(val) => toggleActive.mutate({ id: c.id, active: val })} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>₦{Number(c.raised_amount).toLocaleString()} raised</span>
                        <span>Goal: ₦{Number(c.goal_amount).toLocaleString()}</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCampaignsPage;
