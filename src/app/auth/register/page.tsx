'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, AlertCircle, Mail, Lock, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authApi } from '@/lib/api';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; general?: string }>({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });
  const { toast } = useToast();
  const router = useRouter();

  const checkPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    const strength = [
      { score: 0, text: '', color: '' },
      { score: 1, text: 'Очень слабый', color: 'text-red-500' },
      { score: 2, text: 'Слабый', color: 'text-orange-500' },
      { score: 3, text: 'Средний', color: 'text-yellow-500' },
      { score: 4, text: 'Хороший', color: 'text-blue-500' },
      { score: 5, text: 'Отличный', color: 'text-green-500' }
    ];

    setPasswordStrength(strength[score]);
  };

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
        description: 'На вашу почту отправлен код подтверждения.',
      });
      
      router.push('/auth/verify');
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
            <CardTitle className="text-2xl font-bold text-center">Создание аккаунта</CardTitle>
            <CardDescription className="text-center">
              Заполните форму для регистрации в системе
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
                <Label htmlFor="password" className="text-sm font-medium">
                  Пароль
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      checkPasswordStrength(e.target.value);
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
                {passwordStrength.text && (
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.score === 1 ? 'w-1/5 bg-red-500' :
                          passwordStrength.score === 2 ? 'w-2/5 bg-orange-500' :
                          passwordStrength.score === 3 ? 'w-3/5 bg-yellow-500' :
                          passwordStrength.score === 4 ? 'w-4/5 bg-blue-500' :
                          passwordStrength.score === 5 ? 'w-full bg-green-500' : 'w-0'
                        }`}
                      />
                    </div>
                    <span className={`text-xs ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                )}
                {errors.password && (
                  <p className="text-sm text-red-500 animate-in fade-in-0 slide-in-from-top-1">{errors.password}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Подтверждение пароля
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                    className={`pl-10 pr-10 h-11 transition-all ${
                      errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'focus:ring-purple-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {password && confirmPassword && password === confirmPassword && (
                    <CheckCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 animate-in fade-in-0 slide-in-from-top-1">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>Пароль должен содержать:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li>Минимум 8 символов</li>
                  <li>Заглавные и строчные буквы</li>
                  <li>Цифры и специальные символы</li>
                </ul>
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
                    Создание аккаунта...
                  </div>
                ) : (
                  'Создать аккаунт'
                )}
              </Button>
              <div className="text-center text-sm text-gray-600">
                Уже есть аккаунт?{' '}
                <Link
                  href="/auth/login"
                  className="font-medium text-purple-600 hover:text-purple-700 transition-colors"
                >
                  Войти
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}