'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle 
} from '@/components/ui/sheet';
import { useUserStore } from '@/store/user-store';
import { useStoreItemsStore } from '@/store/store-items-store';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Menu,
  LayoutDashboard,
  Store,
  PackageOpen,
  BarChart3,
  LogOut,
  ShoppingCart,
} from 'lucide-react';

const Header = () => {
  const pathname = usePathname();
  const { user, logout } = useUserStore();
  const { activeItems } = useStoreItemsStore();
  const [email, setEmail] = useState<string>('');
  const [pageTitle, setPageTitle] = useState<string>('Панель управления');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAuthPage = pathname?.startsWith('/auth');

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

  useEffect(() => {
    switch (pathname) {
      case '/':
        setPageTitle('Панель управления');
        break;
      case '/store':
        setPageTitle('Управление магазином');
        break;
      case '/warehouse':
        setPageTitle('Управление складом');
        break;
      case '/prediction':
        setPageTitle('Прогнозирование и аналитика');
        break;
      default:
        setPageTitle('Панель управления');
    }

    if (!user?.email) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          if (tokenData.email) {
            setEmail(tokenData.email);
          }
        } catch {
          console.error('Error parsing token');
        }
      }
    } else {
      setEmail(user.email);
    }
  }, [pathname, user]);

  if (isAuthPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 md:px-8 bg-white border-b border-gray-200 md:ml-64">
      <div className="flex items-center">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="mr-4 h-9 w-9"
            >
              <Menu className="h-5 w-5 text-purple-600" />
              <span className="sr-only">Открыть меню</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetHeader className="border-b px-6 py-4">
              <SheetTitle>Меню навигации</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
                <h1 className="text-xl font-bold text-purple-600">aiventory</h1>
              </div>

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
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
                  <Link href="/store" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="flex items-center px-4 py-3 mt-4 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors">
                      <ShoppingCart className="w-5 h-5" />
                      <span className="ml-3">Продажа товаров</span>
                    </div>
                  </Link>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="ml-3">Выйти</span>
                  </button>
                </div>
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">{pageTitle}</h1>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="hidden sm:flex items-center">
          <span className="text-xs sm:text-sm text-gray-600 mr-2">
            {email}
          </span>
        </div>
        <Avatar className="h-8 w-8 bg-purple-600 text-white">
          <AvatarFallback className="bg-purple-600 text-white">
            {getInitials(email)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;