import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users/');
      return response.data;
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData) => {
      const response = await api.post('/users/', userData);
      return response.data;
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
      const response = await api.post(`/users/${userId}/companies/${companyId}`);
      return response.data;
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
      const response = await api.delete(`/users/${userId}/companies/${companyId}`);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-companies', variables.userId] });
    },
  });
};

export const useMyCompanies = () => {
  return useQuery({
    queryKey: ['my-companies'],
    queryFn: async () => {
      const response = await api.get('/users/me/companies');
      return response.data;
    },
  });
};

export const useUserCompanies = (userId) => {
  return useQuery({
    queryKey: ['user-companies', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await api.get(`/users/${userId}/companies`);
      return response.data;
    },
    enabled: !!userId,
  });
};
