import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Welcome, {session?.user?.name || session?.user?.email}
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Internal Seller Management System
          </p>
          <div className="flex gap-4">
            <Link href="/sellers" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Manage Sellers
            </Link>
            <Link href="/audit-logs" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
              Audit Logs
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
