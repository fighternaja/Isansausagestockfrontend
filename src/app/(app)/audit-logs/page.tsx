"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function AuditLogsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => api.dashboard.auditLogs(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground">
          บันทึกการเปลี่ยนแปลงข้อมูลทั้งหมด
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border overflow-x-auto bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left">วันที่</th>
                <th className="p-3 text-left">ผู้ใช้</th>
                <th className="p-3 text-left">การกระทำ</th>
                <th className="p-3 text-left">ตาราง</th>
                <th className="p-3 text-left">Record ID</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((log) => (
                <tr key={log.id} className="border-b">
                  <td className="p-3 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("th-TH")}
                  </td>
                  <td className="p-3">
                    <div>{log.user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {log.user.email}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline">{log.action}</Badge>
                  </td>
                  <td className="p-3">{log.tableName}</td>
                  <td className="p-3 font-mono text-xs">{log.recordId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
