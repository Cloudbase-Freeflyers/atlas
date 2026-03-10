"use client";

import React, {useState, useEffect, useMemo} from 'react';
import { useAuth } from '@/lib/authContext';
import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import UserModal from '@/components/admin/UserModal';
import { useRouter } from 'next/navigation';

import { useUsers } from '@/hooks/useUsers';

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: users, isLoading: usersLoading, error } = useUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const router = useRouter();
  console.log(users)

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      router.push('/reports');
    }
  }, [user, authLoading, router]);

  const columns = useMemo(() => [
    { header: 'ID', accessorKey: 'id' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Role', accessorKey: 'role' },
    {
      header: 'Status',
      accessorKey: 'is_active',
      cell: ({ getValue }) => (
          <span className={getValue() ? "tw:text-green-400" : "tw:text-red-400"}>
          {getValue() ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
          <div className="tw:flex tw:gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedUser(row.original);
                  setIsModalOpen(true);
                }}
            >
              Manage
            </Button>
          </div>
      )
    }
  ])

  if (authLoading || user?.role !== 'admin') return null;

  return (
    <div className="tw:p-8 tw:space-y-6">
      <div className="tw:flex tw:justify-between tw:items-center">
        <div>
          <h1 className="tw:text-2xl tw:font-bold tw:text-white">User Management</h1>
          <p className="tw:text-zinc-500 tw:text-sm">Manage system users and their company assignments.</p>
        </div>
        <Button onClick={() => {
          setSelectedUser(null);
          setIsModalOpen(true);
        }}>
          Add New User
        </Button>
      </div>

      <div className="tw:bg-white/5 tw:border tw:border-white/10 tw:rounded-xl tw:p-4">
        <DataTable 
          columns={columns} 
          rows={users}
          loading={usersLoading}
        />
        {error && (
          <div className="tw:mt-4 tw:p-4 tw:bg-red-500/10 tw:border tw:border-red-500/20 tw:text-red-400 tw:rounded-lg">
            Error loading users: {error.message}
          </div>
        )}
      </div>

      {isModalOpen && (
        <UserModal
          key={selectedUser?.id || 'new'}
          user={selectedUser}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
