import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole {
  user_id: string;
  full_name: string | null;
  roles: AppRole[];
}

const AdminUsersPage = () => {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<AppRole>("student");
  const [newPassword, setNewPassword] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      const rolesMap: Record<string, AppRole[]> = {};
      (rolesRes.data ?? []).forEach((r) => {
        if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
        rolesMap[r.user_id].push(r.role);
      });
      return (profilesRes.data ?? []).map((p) => ({
        user_id: p.user_id,
        full_name: p.full_name,
        roles: rolesMap[p.user_id] ?? ["student"],
      })) as UserWithRole[];
    },
  });

  const addRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Role added" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const removeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Role removed" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const students = users?.filter((u) => u.roles.includes("student")) ?? [];
  const teachers = users?.filter((u) => u.roles.includes("teacher")) ?? [];

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword) {
      toast({ title: "Email and password required", variant: "destructive" });
      return;
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
        options: { data: { full_name: newName } },
      });
      if (error) throw error;
      if (data.user && newRole !== "student") {
        await supabase.from("user_roles").insert({ user_id: data.user.id, role: newRole });
      }
      toast({ title: `${newRole} account created`, description: `Account for ${newEmail} created.` });
      setCreateOpen(false);
      setNewEmail("");
      setNewName("");
      setNewPassword("");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e: any) {
      toast({ title: "Error creating user", description: e.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout title="User Management">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground font-body">Manage students and teachers.</p>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm"><UserPlus className="h-4 w-4 mr-1" /> Create Account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Create New Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>Full Name</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name" /></div>
              <div><Label>Email</Label><Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@example.com" /></div>
              <div><Label>Password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" /></div>
              <div>
                <Label>Role</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" variant="hero" onClick={handleCreateUser}>Create Account</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
          <TabsTrigger value="teachers">Teachers ({teachers.length})</TabsTrigger>
          <TabsTrigger value="all">All Users ({users?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <UserTable users={students} onAddRole={(uid, r) => addRole.mutate({ userId: uid, role: r })} onRemoveRole={(uid, r) => removeRole.mutate({ userId: uid, role: r })} loading={isLoading} />
        </TabsContent>
        <TabsContent value="teachers">
          <UserTable users={teachers} onAddRole={(uid, r) => addRole.mutate({ userId: uid, role: r })} onRemoveRole={(uid, r) => removeRole.mutate({ userId: uid, role: r })} loading={isLoading} />
        </TabsContent>
        <TabsContent value="all">
          <UserTable users={users ?? []} onAddRole={(uid, r) => addRole.mutate({ userId: uid, role: r })} onRemoveRole={(uid, r) => removeRole.mutate({ userId: uid, role: r })} loading={isLoading} />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

const UserTable = ({
  users, onAddRole, onRemoveRole, loading,
}: {
  users: UserWithRole[];
  onAddRole: (uid: string, role: AppRole) => void;
  onRemoveRole: (uid: string, role: AppRole) => void;
  loading: boolean;
}) => {
  if (loading) return <div className="flex justify-center py-10"><div className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!users.length) return <p className="text-center text-muted-foreground py-10">No users found.</p>;

  return (
    <Card className="mt-4">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.user_id}>
                <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {u.roles.map((r) => (
                      <Badge key={r} variant={r === "admin" ? "destructive" : r === "teacher" ? "default" : "secondary"} className="text-xs">
                        {r}
                        {r !== "student" && (
                          <button className="ml-1 hover:text-destructive" onClick={() => onRemoveRole(u.user_id, r)}>×</button>
                        )}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {!u.roles.includes("teacher") && (
                      <Button variant="outline" size="sm" onClick={() => onAddRole(u.user_id, "teacher")}>
                        <Shield className="h-3 w-3 mr-1" /> Make Teacher
                      </Button>
                    )}
                    {!u.roles.includes("admin") && (
                      <Button variant="outline" size="sm" onClick={() => onAddRole(u.user_id, "admin")}>
                        <Shield className="h-3 w-3 mr-1" /> Make Admin
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminUsersPage;
