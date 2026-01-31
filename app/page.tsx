import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/app-layout";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">
            Welcome, {session?.user?.name || session?.user?.email}
          </h1>
          <p className="text-muted-foreground mt-2">
            Internal Seller Management System
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Sellers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                View, create, and manage seller accounts and their information.
              </p>
              <Button variant="secondary" asChild>
                <Link href="/sellers">Go to Sellers</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                View system activity and track all actions performed by users.
              </p>
              <Button variant="secondary" asChild>
                <Link href="/audit-logs">View Logs</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
