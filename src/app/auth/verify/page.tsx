'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useUserStore } from '@/store/user-store';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

// Определение цветов для консистентности дизайна
const colors = {
  purple: '#6322FE',
  purpleHover: '#5719d8',
  textDark: '#1f2937',
  textMuted: '#4b5563',
  white: '#ffffff',
  border: '#e5e7eb',
};

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { verify } = useUserStore();
  const { toast } = useToast();
  const router = useRouter();
  
  useEffect(() => {
    // Получаем email из URL параметров или из sessionStorage
    const urlEmail = searchParams.get('email');
    const storedEmail = sessionStorage.getItem('verificationEmail');
    
    if (urlEmail) {
      setEmail(urlEmail);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      toast({
        title: 'Ошибка',
        description: 'Электронная почта не указана. Пожалуйста, вернитесь на страницу регистрации.',
        variant: 'destructive',
      });
    }
  }, [searchParams, toast]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !code || code.length !== 6) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, введите корректный код подтверждения',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await verify(email, code);
      toast({
        title: 'Подтверждение успешно',
        description: 'Ваша электронная почта подтверждена. Теперь вы можете войти в систему.',
      });
      
      // Очищаем sessionStorage после успешной верификации
      sessionStorage.removeItem('verificationEmail');
      
      router.push('/auth/login');
    } catch (error: any) {
      toast({
        title: 'Ошибка подтверждения',
        description: error.response?.data?.detail || 'Произошла ошибка при подтверждении',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <Card style={{borderColor: colors.border, backgroundColor: colors.white}} className="shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-gray-900">Подтверждение почты</CardTitle>
          <CardDescription className="text-center text-gray-600">
            Введите код подтверждения, отправленный на вашу почту
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Электронная почта</Label>
              <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700 font-medium">
                {email}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="code" className="text-gray-700">Код подтверждения</Label>
              <div className="flex justify-center py-2">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={(value) => setCode(value)}
                  render={({ slots }) => (
                    <InputOTPGroup>
                      {slots.map((slot, index) => (
                        <InputOTPSlot
                          key={index}
                          {...slot}
                          className="w-10 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        />
                      ))}
                    </InputOTPGroup>
                  )}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              style={{backgroundColor: isLoading ? colors.purpleHover : colors.purple}}
              className="w-full text-white hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? 'Проверка...' : 'Подтвердить'}
            </Button>
            <div className="text-center text-sm text-gray-600">
              Не получили код?{' '}
              <Link
                href="/auth/register"
                style={{color: colors.purple}}
                className="font-medium hover:underline"
              >
                Отправить повторно
              </Link>
            </div>
            <div className="text-center text-sm">
              <Link
                href="/auth/login"
                className="text-gray-500 hover:underline font-medium"
              >
                Вернуться к входу
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}