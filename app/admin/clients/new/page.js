import ClientForm from "@/components/admin/ClientForm";
import { getServerUsers } from "@/lib/serverApi";

export default async function NewClientPage() {
  const users = await getServerUsers();

  return (
    <div className="tw:container tw:mx-auto tw:max-w-6xl tw:px-4 tw:py-8">
      <ClientForm client={null} users={users} />
    </div>
  );
}
