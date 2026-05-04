import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listClientsAction,
  createClientAction,
  updateClientAction,
  deleteClientAction,
} from "@/lib/clientActions";

export const useClients = (options = {}) => {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      return await listClientsAction();
    },
    ...options,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const result = await createClientAction(payload);
      if (!result.success) throw new Error(result.message || "Create failed");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const result = await updateClientAction(id, data);
      if (!result.success) throw new Error(result.message || "Update failed");
      return result.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client", variables.id] });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const result = await deleteClientAction(id);
      if (!result.success) throw new Error(result.message || "Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};
