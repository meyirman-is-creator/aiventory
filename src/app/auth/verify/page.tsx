'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useUserStore } from '@/store/user-store';
import { AlertCircle, Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

function VerifyPageContent() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const { verify } = useUserStore();
  const { toast } = useToast();
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('verificationEmail');
    
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      toast({
        title: 'Ошибка',
        description: 'Электронная почта не указана. Пожалуйста, вернитесь на страницу регистрации.',
        variant: 'destructive',
      });
      router.push('/auth/register');
    }
  }, [toast, router]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split('');
      const newCode = [...code];
      pastedCode.forEach((digit, i) => {
        if (i < 6) {
          newCode[i] = digit;
        }
      });
      setCode(newCode);
      const lastFilledIndex = Math.min(pastedCode.length - 1, 5);
      inputRefs.current[lastFilledIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setIsResending(true);
    setError('');
    
    try {
      const response = await fetch('/api/v1/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend code');
      }

      toast({
        title: 'Код отправлен',
        description: 'Новый код подтверждения отправлен на вашу почту.',
      });
      
      setResendTimer(60);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить код повторно.',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fullCode = code.join('');
    
    if (!email) {
      setError('Электронная почта не указана');
      return;
    }
    
    if (fullCode.length !== 6) {
      setError('Введите 6-значный код подтверждения');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await verify(email, fullCode);
      toast({
        title: 'Подтверждение успешно',
        description: 'Ваша электронная почта подтверждена. Теперь вы можете войти в систему.',
      });
      
      sessionStorage.removeItem('verificationEmail');
      
      router.push('/auth/login');
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : 'Произошла ошибка при подтверждении';
      
      setError(errorMessage);
      toast({
        title: 'Ошибка подтверждения',
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
            <CardTitle className="text-2xl font-bold text-center">Подтверждение почты</CardTitle>
            <CardDescription className="text-center">
              Введите 6-значный код, отправленный на вашу почту
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className="animate-in fade-in-0 slide-in-from-top-1">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Электронная почта</Label>
                <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-700 font-medium">{email || 'Не указана'}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Код подтверждения</Label>
                <div className="flex justify-center gap-2 sm:gap-3">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold border-2 rounded-lg transition-all ${
                        error 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                      } focus:outline-none focus:ring-2`}
                      disabled={isLoading}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center mt-3">
                  Проверьте папку &quot;Спам&quot;, если не видите письмо
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4">
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium transition-all transform hover:scale-[1.02]"
                disabled={isLoading || code.join('').length !== 6}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Проверка...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Подтвердить
                  </div>
                )}
              </Button>
              
              <div className="text-center space-y-3">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending || resendTimer > 0}
                  className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isResending ? 'animate-spin' : ''}`} />
                  {resendTimer > 0 
                    ? `Отправить повторно через ${resendTimer}с` 
                    : 'Отправить код повторно'
                  }
                </button>
                
                <div className="text-sm text-gray-500">
                  <Link
                    href="/auth/login"
                    className="font-medium text-gray-600 hover:text-gray-700 transition-colors"
                  >
                    Вернуться к входу
                  </Link>
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    }>
      <VerifyPageContent />
    </Suspense>
  );
}