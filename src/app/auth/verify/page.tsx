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

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { verify } = useUserStore();
  const { toast } = useToast();
  const router = useRouter();
  
  useEffect(() => {
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
      <Card className="shadow-md border-[#e5e7eb] bg-[#ffffff]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-[#1f2937]">Подтверждение почты</CardTitle>
          <CardDescription className="text-center text-[#4b5563]">
            Введите код подтверждения, отправленный на вашу почту
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#374151]">Электронная почта</Label>
              <div className="p-2 bg-[#f9fafb] border border-[#e5e7eb] rounded-md text-[#374151] font-medium">
                {email}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="code" className="text-[#374151]">Код подтверждения</Label>
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
                          className="w-10 h-12 text-xl border-[#d1d5db] focus:border-[#6322FE] focus:ring-[#6322FE] bg-[#ffffff]"
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
              className={`w-full text-[#ffffff] hover:opacity-90 transition-opacity ${isLoading ? 'bg-[#5719d8]' : 'bg-[#6322FE]'}`}
              disabled={isLoading}
            >
              {isLoading ? 'Проверка...' : 'Подтвердить'}
            </Button>
            <div className="text-center text-sm text-[#4b5563]">
              Не получили код?{' '}
              <Link
                href="/auth/register"
                className="font-medium hover:underline text-[#6322FE]"
              >
                Отправить повторно
              </Link>
            </div>
            <div className="text-center text-sm">
              <Link
                href="/auth/login"
                className="text-[#6b7280] hover:underline font-medium"
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