"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppLayout } from "@/components/app-layout";

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
}

export default function AuditLogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    // Redirect non-admins
    if (session?.user?.role !== "Admin" && status === "authenticated") {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/audit-logs")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setLogs(data);
          }
        });
    }
  }, [session]);

  if (status === "loading")
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Card className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  if (!session) return null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Audit Logs</h1>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No audit logs yet.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm">{log.userId}</TableCell>
                    <TableCell className="text-sm">{log.action}</TableCell>
                    <TableCell className="text-sm">{log.entityType}</TableCell>
                    <TableCell className="text-sm">{log.details}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppLayout>
  );
}
