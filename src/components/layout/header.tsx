'use client';

import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUserStore } from '@/store/user-store';
import { getInitials } from '@/lib/utils';
import { useState, useEffect } from 'react';

const Header = () => {
  const pathname = usePathname();
  const { user } = useUserStore();
  const [email, setEmail] = useState<string>('');
  const [pageTitle, setPageTitle] = useState<string>('Панель управления');

  const isAuthPage = pathname?.startsWith('/auth');

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
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 sm:px-8 bg-[#ffffff] border-b border-[#e5e7eb]">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-[#1f2937]">{pageTitle}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center">
          <span className="text-sm text-[#6b7280] mr-2">
            {email}
          </span>
        </div>
        <Avatar className="h-8 w-8 bg-[#6322FE] text-[#ffffff]">
          <AvatarFallback className="bg-[#6322FE] text-[#ffffff]">
            {getInitials(email)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;