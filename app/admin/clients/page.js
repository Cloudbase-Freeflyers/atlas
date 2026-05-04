import ReportAdminClients from "@/components/admin/ReportAdminClients";
import { listClients } from "@/lib/clientsStore";
import { getServerUsers } from "@/lib/serverApi";

export default async function AdminClientsPage() {
  const [clients, users] = await Promise.all([listClients(), getServerUsers()]);

  return <ReportAdminClients initialClients={clients} users={users} />;
}
