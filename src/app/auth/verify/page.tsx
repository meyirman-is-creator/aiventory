'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useUserStore } from '@/store/user-store';
import { Input } from '@/components/ui/input';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { verify } = useUserStore();
  const { toast } = useToast();
  const router = useRouter();
  
  useEffect(() => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Email is required. Please go back to registration page.',
        variant: 'destructive',
      });
    }
  }, [email, toast]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !code) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await verify(email, code);
      toast({
        title: 'Verification Successful',
        description: 'Your email has been verified. You can now log in.',
      });
      router.push('/auth/login');
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.response?.data?.detail || 'An error occurred during verification',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
        <CardDescription className="text-center">
          Enter the verification code sent to your email
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              readOnly
              className="bg-gray-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full bg-brand-purple hover:bg-brand-purple/90"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>
          <div className="text-center text-sm">
            Didn't receive the code?{' '}
            <Link
              href="/auth/register"
              className="text-brand-purple hover:underline"
            >
              Resend Code
            </Link>
          </div>
          <div className="text-center text-sm">
            <Link
              href="/auth/login"
              className="text-gray-500 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}