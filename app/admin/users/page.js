import ReportAdminUsers from "@/components/admin/ReportAdminUsers";
import { getServerUsers, getServerAllCompanies, requireServerAuth } from "@/lib/serverApi";

export default async function AdminUsersPage() {
  await requireServerAuth();
  const [users, allCompanies] = await Promise.all([
    getServerUsers(),
    getServerAllCompanies()
  ]);

  return <ReportAdminUsers initialUsers={users} allCompanies={allCompanies} />;
}
