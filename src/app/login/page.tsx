'use client';

import { signIn, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { Card, CardBody, CardHeader } from "@nextui-org/react";

const Page = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn("google", { callbackUrl: "/" });
    } else if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background bg-gradient-to-br from-background to-background/50">
          <Card className="w-[400px] shadow-2xl">
            <CardHeader className="flex gap-3 justify-center pb-0">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
                <FcGoogle className="text-4xl animate-bounce" />
              </div>
            </CardHeader>
            <CardBody className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-2">Redirecting to Google</h1>
              <p className="text-foreground/80 mb-6">
                Please wait while we redirect you to Google for authentication.
              </p>
              <div className="flex justify-center items-center space-x-3">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse delay-150"></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse delay-300"></div>
              </div>
            </CardBody>
          </Card>
        </div>
    );
  }

  return null;
};

export default Page;
