'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Package,
  Store,
  AlertCircle,
  TrendingUp,
  ShoppingCart,
  Upload
} from 'lucide-react';
import { useUserStore } from '@/store/user-store';
import { useDashboardStore } from '@/store/dashboard-store';
import { useStoreItemsStore } from '@/store/store-items-store';
import { formatCurrency } from '@/lib/utils';
import UploadFileButton from '@/components/dashboard/upload-file-button';

// Defining colors directly in the component
const colors = {
  brandPurple: '#6322FE',
  brandPurpleHover: '#5719d8',
  brandGreen: '#26E989',
  textDark: '#1f2937',  // Dark text for good contrast
  textMuted: '#4b5563', // Medium gray for muted text
  bgLight: '#ffffff',   // White background
  bgWarning: '#fffbeb', // Amber light background
  warningText: '#92400e', // Amber dark for text
  warningAccent: '#f59e0b', // Amber accent color
  borderColor: '#e5e7eb',  // Light gray border
};

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useUserStore();
  const { stats, fetchStats, isLoading } = useDashboardStore();
  const { fetchActiveItems, fetchReports } = useStoreItemsStore();
  
  useEffect(() => {
    const isLoggedIn = checkAuth();
    
    if (!isLoggedIn) {
      router.push('/auth/login');
    } else {
      fetchStats();
      fetchActiveItems();
      fetchReports();
    }
  }, [checkAuth, fetchActiveItems, fetchReports, fetchStats, router]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Welcome to your Dashboard</h2>
        <div className="mt-2 sm:mt-0">
          <UploadFileButton />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card style={{backgroundColor: colors.bgLight, borderColor: colors.borderColor}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Total Products</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.total_products || 0}</div>
            <p className="text-xs text-gray-600">
              Products in your inventory
            </p>
          </CardContent>
        </Card>
        
        <Card style={{backgroundColor: colors.bgLight, borderColor: colors.borderColor}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Products in Warehouse</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.products_in_warehouse || 0}</div>
            <p className="text-xs text-gray-600">
              Products available in warehouse
            </p>
          </CardContent>
        </Card>
        
        <Card style={{backgroundColor: colors.bgLight, borderColor: colors.borderColor}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Products in Store</CardTitle>
            <Store className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.products_in_store || 0}</div>
            <p className="text-xs text-gray-600">
              Products available for sale
            </p>
          </CardContent>
        </Card>
        
        <Card style={{backgroundColor: colors.bgWarning, borderColor: '#fcd34d'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Expiring Soon</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800">{stats?.products_expiring_soon || 0}</div>
            <p className="text-xs text-amber-700">
              Products expiring in next 7 days
            </p>
            {stats?.products_expiring_soon ? (
              <Button 
                variant="link" 
                className="p-0 h-auto text-amber-600"
                onClick={() => router.push('/store')}
              >
                View expiring items →
              </Button>
            ) : null}
          </CardContent>
        </Card>
        
        <Card style={{backgroundColor: colors.bgLight, borderColor: colors.borderColor}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Revenue (30 days)</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats?.total_revenue_last_30_days || 0)}
            </div>
            <p className="text-xs text-gray-600">
              Total revenue in last 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card style={{backgroundColor: colors.bgLight, borderColor: colors.borderColor}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Sales (30 days)</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.total_sales_last_30_days || 0}</div>
            <p className="text-xs text-gray-600">
              Total items sold in last 30 days
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card style={{backgroundColor: colors.bgLight, borderColor: colors.borderColor}}>
          <CardHeader>
            <CardTitle className="text-gray-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-600">
              {isLoading ? (
                "Loading activity data..."
              ) : (
                "No recent activity"
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card style={{backgroundColor: colors.bgLight, borderColor: colors.borderColor}}>
          <CardHeader>
            <CardTitle className="text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-between border-gray-300 text-gray-800"
              onClick={() => router.push('/warehouse')}
            >
              Upload New Inventory <Upload className="h-4 w-4 ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between border-gray-300 text-gray-800"
              onClick={() => router.push('/store')}
            >
              Manage Store Items <Store className="h-4 w-4 ml-2" />
            </Button>
            
            <Button 
              className="w-full justify-between text-white"
              style={{backgroundColor: colors.brandPurple}}
              onClick={() => router.push('/store')}
            >
              Sell Products <ShoppingCart className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}