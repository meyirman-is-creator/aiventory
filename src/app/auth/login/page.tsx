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
import { Eye, EyeOff, AlertCircle, Mail, Lock, LogIn } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useUserStore();
  const { toast } = useToast();
  const router = useRouter();
  
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Электронная почта обязательна';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Неверный формат электронной почты';
    }
    
    if (!password) {
      newErrors.password = 'Пароль обязателен';
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
      await login(email, password);
      toast({
        title: 'Успешный вход',
        description: 'Добро пожаловать в систему!',
      });
      router.push('/');
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : 'Произошла ошибка при входе';
      
      if (errorMessage.includes('not verified')) {
        sessionStorage.setItem('verificationEmail', email);
        toast({
          title: 'Email не подтвержден',
          description: 'Пожалуйста, подтвердите вашу электронную почту',
          variant: 'destructive',
        });
        router.push('/auth/verify');
        return;
      }
      
      setErrors({ general: errorMessage });
      toast({
        title: 'Ошибка входа',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
            AIventory
          </h1>
          <p className="text-gray-600 mt-2">Система управления запасами</p>
        </div>
        
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">Вход в систему</CardTitle>
            <CardDescription className="text-center">
              Введите свои данные для доступа к аккаунту
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errors.general && (
                <Alert variant="destructive" className="animate-in fade-in-0 slide-in-from-top-1">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Электронная почта
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                    className={`pl-10 h-11 transition-all ${
                      errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-purple-500'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 animate-in fade-in-0 slide-in-from-top-1">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Пароль
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    Забыли пароль?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                    className={`pl-10 pr-10 h-11 transition-all ${
                      errors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-purple-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 animate-in fade-in-0 slide-in-from-top-1">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                  Запомнить меня
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4">
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium transition-all transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Выполняется вход...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="h-4 w-4 mr-2" />
                    Войти
                  </div>
                )}
              </Button>
              
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-4 text-gray-500">или</span>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                Нет аккаунта?{' '}
                <Link
                  href="/auth/register"
                  className="font-medium text-purple-600 hover:text-purple-700 transition-colors"
                >
                  Зарегистрироваться
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        
      </div>
    </div>
  );
}