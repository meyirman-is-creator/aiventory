'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserStore } from '@/store/user-store';
import { useWarehouseStore } from '@/store/warehouse-store';
import WarehouseItemsTable from '@/components/warehouse/items-table';
import ExpiringItemsTable from '@/components/warehouse/expiring-items-table';
import UploadFileButton from '@/components/dashboard/upload-file-button';
import MoveToStoreButton from '@/components/warehouse/move-to-store-button';

// Define explicit colors
const colors = {
  purple: '#6322FE',
  purpleLight: '#EBE3FF',
  textDark: '#1f2937',
  textMuted: '#4b5563',
  amber: '#f59e0b',
  amberLight: '#FEF3C7',
  white: '#ffffff',
  border: '#e5e7eb',
};

export default function WarehousePage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useUserStore();
  const {
    fetchItems,
    fetchExpiringItems,
    items,
    expiringItems,
    isLoadingItems,
    isLoadingExpiringItems
  } = useWarehouseStore();
  
  useEffect(() => {
    const isLoggedIn = checkAuth();
    
    if (!isLoggedIn) {
      router.push('/auth/login');
    } else {
      fetchItems();
      fetchExpiringItems();
    }
  }, [checkAuth, fetchItems, fetchExpiringItems, router]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Warehouse Management</h2>
          <p className="text-gray-600">
            Manage your warehouse inventory and move items to store
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2 sm:mt-0">
          <MoveToStoreButton />
          <UploadFileButton />
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100">
          <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            All Items
            <span 
              className="ml-2 inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{backgroundColor: colors.purpleLight, color: colors.purple}}
            >
              {items.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="expiring" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            Expiring Soon
            <span 
              className="ml-2 inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{backgroundColor: colors.amberLight, color: colors.amber}}
            >
              {expiringItems.length}
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4 mt-4">
          <Card style={{borderColor: colors.border, backgroundColor: colors.white}}>
            <CardHeader>
              <CardTitle className="text-gray-900">Warehouse Items</CardTitle>
              <CardDescription className="text-gray-600">
                All items currently stored in your warehouse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WarehouseItemsTable items={items} isLoading={isLoadingItems} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expiring" className="space-y-4 mt-4">
          <Card style={{borderColor: colors.border, backgroundColor: colors.white}}>
            <CardHeader>
              <CardTitle className="text-gray-900">Expiring Items</CardTitle>
              <CardDescription className="text-gray-600">
                Warehouse items that will expire within the next 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpiringItemsTable items={expiringItems} isLoading={isLoadingExpiringItems} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}