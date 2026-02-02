"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogOut, Users, Key, Store, ScrollText, User } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  const isAdmin = session?.user?.role === "Admin";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-semibold">
                Seller Management
              </Link>
              <nav className="flex gap-1">
                <Button
                  variant={isActive("/sellers") ? "secondary" : "ghost"}
                  asChild
                >
                  <Link href="/sellers">
                    <Store className="w-4 h-4 mr-2" />
                    Sellers
                  </Link>
                </Button>
                {isAdmin && (
                  <>
                    <Button
                      variant={isActive("/users") ? "secondary" : "ghost"}
                      asChild
                    >
                      <Link href="/users">
                        <Users className="w-4 h-4 mr-2" />
                        Users
                      </Link>
                    </Button>
                    <Button
                      variant={isActive("/audit-logs") ? "secondary" : "ghost"}
                      asChild
                    >
                      <Link href="/audit-logs">
                        <ScrollText className="w-4 h-4 mr-2" />
                        Audit Logs
                      </Link>
                    </Button>
                  </>
                )}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                {session?.user?.name || session?.user?.email}
              </div>
              <Select
                onValueChange={(value) => {
                  if (value === "logout") {
                    signOut({ callbackUrl: "/login" });
                  } else if (value === "password") {
                    window.location.href = "/settings/password";
                  }
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="password">
                    <div className="flex items-center">
                      <Key className="w-4 h-4 mr-2" />
                      Change Password
                    </div>
                  </SelectItem>
                  <SelectItem value="logout">
                    <div className="flex items-center text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
