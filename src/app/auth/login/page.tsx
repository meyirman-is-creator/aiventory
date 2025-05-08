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
      <Card className="shadow-md border-[#e5e7eb] bg-[#ffffff]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-[#1f2937]">Вход в систему</CardTitle>
          <CardDescription className="text-center text-[#4b5563]">
            Введите свои данные для доступа к аккаунту
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#374151]">Электронная почта</Label>
              <Input
                id="email"
                type="email"
                placeholder="mail@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-[#d1d5db] focus:border-[#6322FE] focus:ring-[#6322FE] placeholder-[#9ca3af]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#374151]">Пароль</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-[#d1d5db] focus:border-[#6322FE] focus:ring-[#6322FE] placeholder-[#9ca3af]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className={`w-full text-[#ffffff] hover:opacity-90 transition-opacity ${isLoading ? 'bg-[#5719d8]' : 'bg-[#6322FE]'}`}
              disabled={isLoading}
            >
              {isLoading ? 'Выполняется вход...' : 'Войти'}
            </Button>
            <div className="text-center text-sm text-[#4b5563]">
              Нет аккаунта?{' '}
              <Link
                href="/auth/register"
                className="font-medium hover:underline text-[#6322FE]"
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