'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authApi } from '@/lib/api';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; general?: string }>({});
  const { toast } = useToast();
  const router = useRouter();
  
  const validateForm = () => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};
    
    if (!email) {
      newErrors.email = 'Электронная почта обязательна';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Неверный формат электронной почты';
    }
    
    if (!password) {
      newErrors.password = 'Пароль обязателен';
    } else if (password.length < 8) {
      newErrors.password = 'Пароль должен содержать минимум 8 символов';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Подтверждение пароля обязательно';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      await authApi.register(email, password);
      
      sessionStorage.setItem('verificationEmail', email);
      
      toast({
        title: 'Регистрация успешна',
        description: 'Пожалуйста, проверьте вашу почту и введите код подтверждения.',
      });
      router.push(`/auth/login`);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : 'Произошла ошибка при регистрации';
      
      setErrors({ general: errorMessage });
      toast({
        title: 'Ошибка регистрации',
        description: errorMessage,
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
            {errors.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Электронная почта</Label>
              <Input
                id="email"
                type="email"
                placeholder="mail@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined });
                  }
                }}
                className={`border-gray-300 focus:border-purple-500 focus:ring-purple-500 placeholder-gray-400 ${
                  errors.email ? 'border-red-500' : ''
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors({ ...errors, password: undefined });
                    }
                  }}
                  className={`border-gray-300 focus:border-purple-500 focus:ring-purple-500 placeholder-gray-400 pr-10 ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">Минимум 8 символов</p>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">Подтверждение пароля</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: undefined });
                    }
                  }}
                  className={`border-gray-300 focus:border-purple-500 focus:ring-purple-500 placeholder-gray-400 pr-10 ${
                    errors.confirmPassword ? 'border-red-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
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