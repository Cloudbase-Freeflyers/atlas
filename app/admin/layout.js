import { requireServerAdmin } from "@/lib/serverApi";

export default async function AdminLayout({ children }) {
  await requireServerAdmin();

  return (
    <div className="tw:min-h-screen tw:bg-zinc-950 tw:p-5">
      {children}
    </div>
  );
}
