import AdminSubnav from "@/components/admin/AdminSubnav";
import { requireServerAdmin } from "@/lib/serverApi";

export default async function AdminLayout({ children }) {
  await requireServerAdmin();

  return (
    <div className="tw:min-h-[calc(100vh-92px)] tw:bg-zinc-950">
      <AdminSubnav />
      {children}
    </div>
  );
}
