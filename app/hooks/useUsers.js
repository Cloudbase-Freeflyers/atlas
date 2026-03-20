import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  createUserAction, 
  assignCompanyAction, 
  removeCompanyAction,
  getUserCompaniesAction,
  getUsersAction,
  getMyCompaniesAction
} from '@/lib/adminActions';

export const useUsers = (options = {}) => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      return await getUsersAction();
    },
    ...options
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData) => {
      const result = await createUserAction(userData);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useAssignCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, companyId }) => {
      const result = await assignCompanyAction(userId, companyId);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-companies', variables.userId] });
    },
  });
};

export const useRemoveCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, companyId }) => {
      const result = await removeCompanyAction(userId, companyId);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-companies', variables.userId] });
    },
  });
};

export const useMyCompanies = (options = {}) => {
  return useQuery({
    queryKey: ['my-companies'],
    queryFn: async () => {
      return await getMyCompaniesAction();
    },
    ...options,
  });
};

export const useUserCompanies = (userId, options = {}) => {
  return useQuery({
    queryKey: ['user-companies', userId],
    queryFn: async () => {
      if (!userId) return [];
      return await getUserCompaniesAction(userId);
    },
    enabled: !!userId,
    ...options
  });
};
