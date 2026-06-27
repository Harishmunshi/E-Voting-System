import { BrandHeader } from "@/components/brand-shell";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminLogin } from "@/components/admin-login";
import { getAdminDashboard } from "@/lib/data";
import { getAdminSession } from "@/lib/security";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();

  return (
    <main className="min-h-screen">
      <BrandHeader eyebrow="Administrator Access" />
      {session ? <AdminDashboard initial={await getAdminDashboard()} /> : <AdminLogin />}
    </main>
  );
}
