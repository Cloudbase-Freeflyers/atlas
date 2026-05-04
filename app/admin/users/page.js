import ReportAdminUsers from "@/components/admin/ReportAdminUsers";
import { getServerUsers, getServerAllCompanies } from "@/lib/serverApi";

export default async function AdminUsersPage() {
  const [users, allCompanies] = await Promise.all([
    getServerUsers(),
    getServerAllCompanies()
  ]);

  return <ReportAdminUsers initialUsers={users} allCompanies={allCompanies} />;
}
