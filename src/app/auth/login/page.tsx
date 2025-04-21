'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useUserStore } from '@/store/user-store';

const colors = {
  purple: '#6322FE',
  purpleHover: '#5719d8',
  textDark: '#1f2937',
  textMuted: '#4b5563',
  white: '#ffffff',
  border: '#e5e7eb',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUserStore();
  const { toast } = useToast();
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, заполните все поля',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(email, password);
      router.push('/');
    } catch (error: any) {
      toast({
        title: 'Ошибка входа',
        description: error.response?.data?.detail || 'Произошла ошибка при входе',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <Card style={{borderColor: colors.border, backgroundColor: colors.white}} className="shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-gray-900">Вход в систему</CardTitle>
          <CardDescription className="text-center text-gray-600">
            Введите свои данные для доступа к аккаунту
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Электронная почта</Label>
              <Input
                id="email"
                type="email"
                placeholder="mail@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700">Пароль</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 placeholder-gray-400"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              style={{backgroundColor: isLoading ? colors.purpleHover : colors.purple}}
              className="w-full text-white hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? 'Выполняется вход...' : 'Войти'}
            </Button>
            <div className="text-center text-sm text-gray-600">
              Нет аккаунта?{' '}
              <Link
                href="/auth/register"
                style={{color: colors.purple}}
                className="font-medium hover:underline"
              >
                Зарегистрироваться
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}