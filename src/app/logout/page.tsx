"use client";

import { FcGoogle } from 'react-icons/fc';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, CardHeader, Divider } from "@heroui/react";

const LogoutPage = () => {
  const router = useRouter();

  const handleRedirectToLogin = () => {
    router.push('/login');
  };

  return (
      <div className="flex items-center justify-center min-h-screen bg-background bg-gradient-to-br from-background to-background/50">
        <Card className="w-[400px] shadow-2xl">
          <CardHeader className="flex gap-3 justify-center pb-0">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
              <FcGoogle className="text-4xl" />
            </div>
          </CardHeader>
          <CardBody className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">You've been logged out</h1>
            <p className="text-foreground/80 mb-6">
              Thank you for using Expense Buddy AI.
            </p>
            <Divider className="my-4" />
            <Button
                color="primary"
                variant="shadow"
                onClick={handleRedirectToLogin}
                className="w-full font-semibold"
                size="lg"
            >
              Log In Again
            </Button>
            <p className="mt-6 text-sm text-foreground/60">
              Need help? <span className="text-primary cursor-pointer hover:underline">Contact our support team</span>.
            </p>
          </CardBody>
        </Card>
      </div>
  );
};

export default LogoutPage;
