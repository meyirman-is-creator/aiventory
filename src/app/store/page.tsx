'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserStore } from '@/store/user-store';
import { useStoreItemsStore } from '@/store/store-items-store';
import ActiveItemsTable from '@/components/store/active-items-table';
import ExpiredItemsTable from '@/components/store/expired-items-table';
import StoreStats from '@/components/store/store-stats';

// Define explicit colors
const colors = {
  purple: '#6322FE',
  purpleLight: '#EBE3FF',
  textDark: '#1f2937',
  textMuted: '#4b5563',
  red: '#ef4444',
  redLight: '#FEE2E2',
  white: '#ffffff',
  border: '#e5e7eb',
};

export default function StorePage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useUserStore();
  const { 
    fetchActiveItems, 
    fetchExpiredItems, 
    fetchReports,
    activeItems,
    expiredItems,
    reports,
    isLoadingItems,
    isLoadingReports
  } = useStoreItemsStore();
  
  useEffect(() => {
    const isLoggedIn = checkAuth();
    
    if (!isLoggedIn) {
      router.push('/auth/login');
    } else {
      fetchActiveItems();
      fetchExpiredItems();
      fetchReports();
    }
  }, [checkAuth, fetchActiveItems, fetchExpiredItems, fetchReports, router]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Store Management</h2>
        <p className="text-gray-600">
          Manage your store inventory, view expiring items, and record sales
        </p>
      </div>
      
      <StoreStats reports={reports} isLoading={isLoadingReports} />
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100">
          <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            Active Items 
            <span 
              className="ml-2 inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{backgroundColor: colors.purpleLight, color: colors.purple}}
            >
              {activeItems.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="expired" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            Expired Items
            <span 
              className="ml-2 inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{backgroundColor: colors.redLight, color: colors.red}}
            >
              {expiredItems.length}
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4 mt-4">
          <Card style={{borderColor: colors.border, backgroundColor: colors.white}}>
            <CardHeader>
              <CardTitle className="text-gray-900">Active Store Items</CardTitle>
              <CardDescription className="text-gray-600">
                All items currently available for sale in your store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActiveItemsTable items={activeItems} isLoading={isLoadingItems} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expired" className="space-y-4 mt-4">
          <Card style={{borderColor: colors.border, backgroundColor: colors.white}}>
            <CardHeader>
              <CardTitle className="text-gray-900">Expired & Removed Items</CardTitle>
              <CardDescription className="text-gray-600">
                Items that have expired or been removed from the store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpiredItemsTable items={expiredItems} isLoading={isLoadingItems} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}