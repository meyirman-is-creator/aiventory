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

// Определение цветов для консистентности дизайна
const colors = {
  purple: '#6322FE',
  purpleHover: '#5719d8',
  textDark: '#1f2937',
  textMuted: '#4b5563',
  white: '#ffffff',
  border: '#e5e7eb',
};

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useUserStore();
  const { toast } = useToast();
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, заполните все поля',
        variant: 'destructive',
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive',
      });
      return;
    }
    
    if (password.length < 8) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен содержать не менее 8 символов',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const user = await register(email, password);
      
      // Сохраняем email в sessionStorage для страницы верификации
      sessionStorage.setItem('verificationEmail', email);
      
      toast({
        title: 'Регистрация успешна',
        description: 'Пожалуйста, проверьте вашу почту и введите код подтверждения.',
      });
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      toast({
        title: 'Ошибка регистрации',
        description: error.response?.data?.detail || 'Произошла ошибка при регистрации',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <Card style={{borderColor: colors.border, backgroundColor: colors.white}} className="shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-gray-900">Создание аккаунта</CardTitle>
          <CardDescription className="text-center text-gray-600">
            Заполните форму для создания нового аккаунта
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
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500">Минимум 8 символов</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">Подтверждение пароля</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
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
              {isLoading ? 'Создание аккаунта...' : 'Создать аккаунт'}
            </Button>
            <div className="text-center text-sm text-gray-600">
              Уже есть аккаунт?{' '}
              <Link
                href="/auth/login"
                style={{color: colors.purple}}
                className="font-medium hover:underline"
              >
                Войти
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}