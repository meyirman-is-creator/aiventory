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
  const [pageTitle, setPageTitle] = useState<string>('Dashboard');
  
  // Check if on auth pages
  const isAuthPage = pathname?.startsWith('/auth');
  
  useEffect(() => {
    // Set page title based on path
    switch (pathname) {
      case '/':
        setPageTitle('Dashboard');
        break;
      case '/store':
        setPageTitle('Store Management');
        break;
      case '/warehouse':
        setPageTitle('Warehouse Management');
        break;
      case '/prediction':
        setPageTitle('Prediction & Analytics');
        break;
      default:
        setPageTitle('Dashboard');
    }
    
    // Try to get user from localStorage if not in store
    if (!user?.email) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          if (tokenData.email) {
            setEmail(tokenData.email);
          }
        } catch (e) {
          // Invalid token format, ignore
        }
      }
    } else {
      setEmail(user.email);
    }
  }, [pathname, user]);
  
  // Don't render header on auth pages
  if (isAuthPage) {
    return null;
  }
  
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-8 bg-white border-b border-gray-200">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center">
          <span className="text-sm text-gray-600 mr-2">
            {email}
          </span>
        </div>
        <Avatar className="h-8 w-8 bg-brand-purple text-white">
          <AvatarFallback>
            {getInitials(email)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;