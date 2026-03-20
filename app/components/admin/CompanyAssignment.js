import React, { useState, useEffect } from 'react';
import { useAssignCompany, useRemoveCompany, useUserCompanies } from '@/hooks/useUsers';
import { useRequest } from '@/hooks/useData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2 } from 'lucide-react';

export default function CompanyAssignment({ userId, allCompanies }) {
  const assignMutation = useAssignCompany();
  const removeMutation = useRemoveCompany();
  const { data: assignedCompanies, isLoading: assignedLoading } = useUserCompanies(userId);

  const payload = React.useMemo(() => ({
    "dimensions": ["Companies.name", "Companies.id"]
  }), []);

  // Fetch all available companies from Cube.js
  const { data: availableCompanies, isLoading: allLoading } = useRequest(payload, (data) => data.map(item => ({
    name: item['Companies.name'],
    id: item['Companies.id']
  })), "all-companies", { initialData: allCompanies });

  const handleAssign = async (companyId) => {
    try {
      await assignMutation.mutateAsync({ userId, companyId });
    } catch (error) {
      console.error('Failed to assign company:', error);
    }
  };

  const handleRemove = async (companyId) => {
    try {
      await removeMutation.mutateAsync({ userId, companyId });
    } catch (error) {
      console.error('Failed to remove company:', error);
    }
  };

  const mutationLoading = assignMutation.isPending || removeMutation.isPending;

  if (assignedLoading || allLoading) {
    return (
      <div className="tw:flex tw:items-center tw:justify-center tw:p-12">
        <Loader2 className="tw:w-6 tw:h-6 tw:animate-spin tw:text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="tw:space-y-8">
      {/* Assigned Companies */}
      <div className="tw:space-y-4">
        <h3 className="tw:text-sm tw:font-medium tw:text-zinc-400 tw:uppercase tw:tracking-wider">Current Access</h3>
        <div className="tw:grid tw:grid-cols-1 tw:gap-3">
          {assignedCompanies?.length > 0 ? (
            assignedCompanies.map(company => (
              <div key={company.id} className="tw:flex tw:items-center tw:justify-between tw:p-4 tw:bg-white/5 tw:border tw:border-white/10 tw:rounded-xl group hover:tw:border-white/20 transition-all">
                <div className="tw:flex tw:items-center tw:gap-3">
                  <div className="tw:w-8 tw:h-8 tw:rounded-lg tw:bg-green-500/10 tw:flex tw:items-center tw:justify-center">
                    <div className="tw:w-2 tw:h-2 tw:rounded-full tw:bg-green-500" />
                  </div>
                  <span className="tw:text-sm tw:font-medium tw:text-white">{company.name}</span>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="tw:text-zinc-500 hover:tw:text-red-400 transition-colors"
                  onClick={() => handleRemove(company.id)}
                  disabled={mutationLoading}
                >
                  <Trash2 className="tw:w-4 tw:h-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="tw:p-8 tw:border tw:border-dashed tw:border-white/10 tw:rounded-xl tw:text-center">
              <p className="tw:text-sm tw:text-zinc-500">No companies assigned yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Available Companies */}
      <div className="tw:space-y-4">
        <h3 className="tw:text-sm tw:font-medium tw:text-zinc-400 tw:uppercase tw:tracking-wider">Available Companies</h3>
        <div className="tw:grid tw:grid-cols-2 tw:gap-3">
          {availableCompanies?.filter(c => !assignedCompanies?.some(ac => ac.id === c.id)).map(company => (
            <div key={company.id} className="tw:flex tw:items-center tw:justify-between tw:p-3 tw:bg-white/5 tw:border tw:border-white/10 tw:rounded-xl hover:tw:bg-white/10 transition-all">
              <span className="tw:text-sm tw:text-zinc-300">{company.name}</span>
              <Button 
                size="sm" 
                variant="outline" 
                className="tw:border-white/10 hover:tw:bg-white tw:hover:text-black"
                onClick={() => handleAssign(company.id)} 
                disabled={mutationLoading}
              >
                <Plus className="tw:w-4 tw:h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="tw:p-4 tw:bg-blue-500/5 tw:border tw:border-blue-500/10 tw:rounded-lg">
        <p className="tw:text-xs tw:text-blue-400">
          Tip: Granting access allows the user to see all data associated with the selected company in their dashboard.
        </p>
      </div>
    </div>
  );
}
