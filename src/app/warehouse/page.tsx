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
          <h2 className="text-2xl font-bold tracking-tight">Warehouse Management</h2>
          <p className="text-muted-foreground">
            Manage your warehouse inventory and move items to store
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2 sm:mt-0">
          <MoveToStoreButton />
          <UploadFileButton />
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">
            All Items
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {items.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="expiring">
            Expiring Soon
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-amber-400/10 px-2.5 py-0.5 text-xs font-semibold text-amber-500">
              {expiringItems.length}
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Items</CardTitle>
              <CardDescription>
                All items currently stored in your warehouse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WarehouseItemsTable items={items} isLoading={isLoadingItems} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expiring" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Expiring Items</CardTitle>
              <CardDescription>
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