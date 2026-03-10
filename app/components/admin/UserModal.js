"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CompanyAssignment from './CompanyAssignment';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
    SelectValue
} from '@/components/ui/select';

import { useCreateUser } from '@/hooks/useUsers';

export default function UserModal({ user, onClose }) {
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user?.role || 'customer');
  const [isActive, setIsActive] = useState(user?.is_active ?? true);
  const [error, setError] = useState('');

  const createUserMutation = useCreateUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (user) {
        // Edit logic if backend supports PATCH
      } else {
        await createUserMutation.mutateAsync({ 
          email, 
          password, 
          role, 
          is_active: isActive 
        });
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save user');
    }
  };

  const loading = createUserMutation.isPending;

  return (
    <Dialog  open={true} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className={"tw:sm:max-w-full tw:md:max-w-2xl" }>
        <DialogHeader >
          <DialogTitle >
            {user ? `Manage User: ${user.email}` : 'Add New User'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="tw:w-full">
          {user && (
              <TabsList variant="line" className="tw:h-10 tw:gap-6">
                <TabsTrigger
                  value="details"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="companies"
                >
                  Companies
                </TabsTrigger>
              </TabsList>
          )}

          <TabsContent value="details" className="tw:mt-0">
            <form onSubmit={handleSubmit} className="tw:space-y-6">
              {error && (
                  <div className="tw:p-4 tw:rounded-lg tw:bg-red-500/10 tw:border tw:border-red-500/20 tw:text-red-400 tw:text-sm">
                    {error}
                  </div>
              )}

              <div className="tw:space-y-2">
                <label className="tw:text-xs tw:font-medium tw:text-zinc-400 tw:uppercase tw:tracking-wider">Email Address</label>
                <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!!user}
                    className="tw:bg-white/5 tw:border-white/10 tw:h-11 focus:tw:ring-white/20"
                />
              </div>

              {!user && (
                  <div className="tw:space-y-2">
                    <label className="tw:text-xs tw:font-medium tw:text-zinc-400 tw:uppercase tw:tracking-wider">Password</label>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="tw:bg-white/5 tw:border-white/10 tw:h-11 focus:tw:ring-white/20"
                        placeholder="Set initial password"
                    />
                  </div>
              )}

              <div className="tw:grid tw:grid-cols-2 tw:gap-6">
                <div className="tw:space-y-2">
                  <label className="tw:text-xs tw:font-medium tw:text-zinc-400 tw:uppercase tw:tracking-wider">Role</label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="tw:bg-white/5 tw:border-white/10 tw:h-11">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="tw:bg-zinc-900 tw:border-white/10">
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="tw:space-y-2">
                  <label className="tw:text-xs tw:font-medium tw:text-zinc-400 tw:uppercase tw:tracking-wider">Status</label>
                  <div className="tw:flex tw:items-center tw:gap-3 tw:h-11 tw:px-4 tw:bg-white/5 tw:border tw:border-white/10 tw:rounded-md">
                    <input
                        type="checkbox"
                        id="isActive"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="tw:w-4 tw:h-4 tw:rounded tw:bg-white/10 tw:border-white/20"
                    />
                    <label htmlFor="isActive" className="tw:text-sm tw:text-zinc-300 cursor-pointer">
                      {isActive ? 'Account Active' : 'Account Disabled'}
                    </label>
                  </div>
                </div>
              </div>

              <div className="tw:pt-6 tw:flex tw:justify-end tw:gap-3">
                <Button variant="ghost" onClick={onClose} type="button" className="tw:h-11 hover:tw:bg-white/5">
                  Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="tw:h-11 tw:px-8 tw:bg-white tw:text-black hover:tw:bg-zinc-200"
                >
                  {loading ? 'Processing...' : (user ? 'Save Changes' : 'Create User')}
                </Button>
              </div>
            </form>
          </TabsContent>

          {user && (
              <TabsContent value="companies" className="tw:mt-0">
                <CompanyAssignment userId={user?.id} />
              </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>);
}
