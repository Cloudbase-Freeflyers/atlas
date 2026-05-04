import { notFound } from "next/navigation";
import ClientManifestEditor from "@/components/admin/ClientManifestEditor";
import { getClient } from "@/lib/clientsStore";

export default async function ClientManifestPage({ params }) {
  const { id } = await params;
  const client = await getClient(id);

  if (!client) {
    notFound();
  }

  return <ClientManifestEditor client={client} />;
}
