'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useUserStore } from '@/store/user-store';
import { useStoreItemsStore } from '@/store/store-items-store';

import {
  LayoutDashboard,
  Store,
  PackageOpen,
  BarChart3,
  Upload,
  LogOut,
  Menu,
  X,
  ShoppingCart,
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, isAuthenticated, checkAuth } = useUserStore();
  const { fetchActiveItems, activeItems } = useStoreItemsStore();
  // Добавляем состояние для отслеживания клиентского рендеринга
  const [isClient, setIsClient] = useState(false);
  
  // Устанавливаем флаг клиентского рендеринга после монтирования
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Check if on auth pages
  const isAuthPage = pathname?.startsWith('/auth');
  
  useEffect(() => {
    if (!isAuthPage) {
      // If not on auth page, check authentication and fetch active items
      const isLoggedIn = checkAuth();
      if (isLoggedIn) {
        fetchActiveItems();
      }
    }
  }, [checkAuth, fetchActiveItems, isAuthPage]);
  
  // Don't render sidebar on auth pages
  if (isAuthPage) {
    return null;
  }
  
  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  const navItems = [
    {
      name: 'Панель управления',
      href: '/',
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: 'Магазин',
      href: '/store',
      icon: <Store size={20} />,
    },
    {
      name: 'Склад',
      href: '/warehouse',
      icon: <PackageOpen size={20} />,
    },
    {
      name: 'Прогнозирование',
      href: '/prediction',
      icon: <BarChart3 size={20} />,
    },
  ];
  
  const handleLogout = async () => {
    await logout();
    window.location.href = '/auth/login';
  };
  
  // Рендерим упрощенную версию для сервера, полную только на клиенте
  if (!isClient) {
    return null; // Или можно вернуть упрощенный плейсхолдер без интерактивных элементов
  }
  
  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          aria-label="Меню"
          className="rounded-full"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>
      
      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar for desktop */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 border-b">
            <h1 className="text-xl font-bold text-brand-purple">aiventory</h1>
          </div>
          
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-gray-100",
                    pathname === item.href
                      ? "bg-brand-purple/10 text-brand-purple"
                      : "text-gray-700"
                  )}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </div>
              </Link>
            ))}
            
            {activeItems.length > 0 && (
              <Link href="/store" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="flex items-center px-4 py-3 mt-4 text-sm font-medium text-white bg-brand-purple rounded-md">
                  <ShoppingCart size={20} />
                  <span className="ml-3">Продажа товаров</span>
                </div>
              </Link>
            )}
            
            <div className="mt-4">
              <Separator />
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 mt-4 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              <LogOut size={20} />
              <span className="ml-3">Выйти</span>
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;