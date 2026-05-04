import { notFound } from "next/navigation";
import ClientForm from "@/components/admin/ClientForm";
import { getClient } from "@/lib/clientsStore";
import { getServerUsers } from "@/lib/serverApi";

export default async function EditClientPage({ params }) {
  const { id } = await params;
  const [client, users] = await Promise.all([getClient(id), getServerUsers()]);

  if (!client) {
    notFound();
  }

  return (
    <div className="tw:container tw:mx-auto tw:max-w-6xl tw:px-4 tw:py-8">
      <ClientForm client={client} users={users} />
    </div>
  );
}
