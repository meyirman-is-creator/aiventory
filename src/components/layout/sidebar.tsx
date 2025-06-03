'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useUserStore } from '@/store/user-store';
import { useStoreItemsStore } from '@/store/store-items-store';

import {
  LayoutDashboard,
  Store,
  PackageOpen,
  BarChart3,
  LogOut,
  ShoppingCart,
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();
  const { logout, isAuthenticated, checkAuth } = useUserStore();
  const { fetchActiveItems, activeItems } = useStoreItemsStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isAuthPage = pathname?.startsWith('/auth');

  useEffect(() => {
    if (!isAuthPage) {
      const isLoggedIn = checkAuth();
      if (isLoggedIn) {
        fetchActiveItems();
      }
    }
  }, [checkAuth, fetchActiveItems, isAuthPage]);

  if (isAuthPage || !isAuthenticated || !isClient) {
    return null;
  }

  const navItems = [
    {
      name: 'Панель управления',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Магазин',
      href: '/store',
      icon: Store,
    },
    {
      name: 'Склад',
      href: '/warehouse',
      icon: PackageOpen,
    },
    {
      name: 'Прогнозирование',
      href: '/prediction',
      icon: BarChart3,
    },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/auth/login';
  };

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-1 bg-white border-r border-gray-200">
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-purple-600">aiventory</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                    pathname === item.href
                      ? "bg-purple-50 text-purple-600"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="ml-3">{item.name}</span>
                </div>
              </Link>
            );
          })}

          {activeItems.length > 0 && (
            <Link href="/store">
              <div className="flex items-center px-4 py-3 mt-4 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                <span className="ml-3">Продажа товаров</span>
              </div>
            </Link>
          )}

          <div className="mt-4">
            <Separator className="bg-gray-200" />
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 mt-4 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-3">Выйти</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;