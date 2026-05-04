"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateClient } from "@/hooks/useClients";

export default function ClientManifestEditor({ client }) {
  const router = useRouter();
  const updateMut = useUpdateClient();
  const [manifest, setManifest] = useState(client?.brand_manifest ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    setManifest(client?.brand_manifest ?? "");
  }, [client]);

  const save = async () => {
    setError("");
    try {
      await updateMut.mutateAsync({
        id: client.id,
        data: { brand_manifest: manifest },
      });
      router.refresh();
    } catch (e) {
      setError(e.message || "Save failed");
    }
  };

  return (
    <div className="tw:container tw:mx-auto tw:max-w-4xl tw:px-4 tw:py-8 tw:space-y-6">
      <div className="tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-4">
        <div>
          <p className="tw:text-xs tw:text-zinc-500 tw:font-mono">Client: {client.name}</p>
          <h1 className="tw:text-2xl tw:font-bold tw:text-white">Brand manifest</h1>
        </div>
        <div className="tw:flex tw:flex-wrap tw:gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/clients/${client.id}`}>Back to account</Link>
          </Button>
          <Button onClick={save} disabled={updateMut.isPending}>
            {updateMut.isPending ? "Saving…" : "Save manifest"}
          </Button>
        </div>
      </div>
      {error && (
        <div className="tw:rounded-lg tw:border tw:border-red-500/30 tw:bg-red-500/10 tw:px-4 tw:py-3 tw:text-sm tw:text-red-300">
          {error}
        </div>
      )}
      <Textarea
        value={manifest}
        onChange={(e) => setManifest(e.target.value)}
        className="tw:min-h-[60vh] tw:font-mono tw:text-sm"
        placeholder="Brand story, positioning, creative guardrails, channel notes…"
      />
    </div>
  );
}
