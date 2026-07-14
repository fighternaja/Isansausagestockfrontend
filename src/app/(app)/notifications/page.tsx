"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.dashboard.notifications(),
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.dashboard.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-count"] });
      toast.success("อ่านทั้งหมดแล้ว");
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.dashboard.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-count"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">การแจ้งเตือน</h1>
          <p className="text-muted-foreground">แจ้งเตือนสต็อกและระบบ</p>
        </div>
        <Button
          variant="outline"
          onClick={() => markAllMutation.mutate()}
          disabled={markAllMutation.isPending}
        >
          <CheckCheck className="mr-2 h-4 w-4" />
          อ่านทั้งหมด
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : notifications?.length === 0 ? (
        <Card className="border-dashed bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Bell className="h-8 w-8 opacity-50" />
            </div>
            <p className="font-medium">ไม่มีการแจ้งเตือน</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications?.map((n) => (
            <Card
              key={n.id}
              className={n.read ? "opacity-70 bg-card" : "border-accent/30 bg-accent/5 shadow-sm"}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base text-foreground">{n.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    {!n.read && <Badge className="bg-accent text-accent-foreground hover:bg-accent/90">ใหม่</Badge>}
                    <Badge variant="outline">{n.type}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{n.message}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString("th-TH")}
                  </span>
                  {!n.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markReadMutation.mutate(n.id)}
                    >
                      ทำเครื่องหมายว่าอ่านแล้ว
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
