"use client";
import React, { useState } from 'react';
import { Card, CardBody, Button, Alert } from '@heroui/react';
import { QrCode, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import QRScannerComponent from '@/components/scan/qr-scanner';
import PaymentPreview from '@/components/scan/payment-preview';
import { parseUPIData, UPIData } from '@/components/scan/upi-handler';
import { createScanTransaction } from '@/server/services/transactionService';
import { getCurrentUser } from '@/server/services/userService';
import { generateTransactionSuggestion } from '@/server/services/aiService';

export default function ScanPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [isScanning, setIsScanning] = useState(false);
  const [upiData, setUpiData] = useState<UPIData | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [scanError, setScanError] = useState<string>('');
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false);

  const handleScanResult = (data: string) => {
    console.log('Scanned QR data:', data);
    setScanError('');
    
    const parsed = parseUPIData(data);
    if (parsed) {
      setUpiData(parsed);
      setIsScanning(false);
      toast({
        title: "QR Code Scanned Successfully",
        description: `Ready to pay ${parsed.pn || 'merchant'}`,
      });
    } else {
      setScanError('Invalid QR code. Please scan a valid UPI payment QR code.');
      toast({
        variant: "destructive",
        title: "Invalid QR Code",
        description: "This doesn't appear to be a valid UPI payment QR code.",
      });
    }
  };

  const handleScanError = (error: string) => {
    setScanError(error);
    toast({
      variant: "destructive",
      title: "Scanner Error",
      description: error,
    });
  };

  const handlePaymentInitiated = async () => {
    if (!upiData || !amount) return;

    setIsCreatingTransaction(true);
    
    try {
      // Get current user
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not found. Please log in again.');
      }

      // Generate AI suggestion for the transaction
      let description = `Payment to ${upiData.pn || 'Unknown Merchant'}`;
      let categoryId = '';
      
      try {
        const aiSuggestion = await generateTransactionSuggestion(
          upiData.pn || 'Unknown Merchant',
          upiData.pa || '',
          amount
        );
        if (aiSuggestion.description) {
          description = aiSuggestion.description;
        }
        if (aiSuggestion.categoryId) {
          categoryId = aiSuggestion.categoryId;
        }
      } catch (aiError) {
        console.error('AI suggestion failed, using fallback:', aiError);
      }

      // Create transaction record using createScanTransaction for automatic fallbacks
      const transactionData = {
        description,
        totalAmount: amount,
        date: new Date().toISOString(),
        notes: upiData.tn || `UPI Payment to ${upiData.pa}`,
        participants: [{
          userId: user.id,
          amount: amount,
          type: 'EXPENSE' as const,
          categoryId: categoryId || '', // Will be auto-filled by createScanTransaction
          paymentMethodId: '', // Will be auto-filled by createScanTransaction
          description: `UPI Payment via QR scan`,
          tagIds: []
        }]
      };
      
      const response = await createScanTransaction(transactionData);
      
      if (response.success) {
        toast({
          title: "Payment Initiated",
          description: "Transaction recorded. Complete the payment in your UPI app.",
        });
        
        // Reset the form
        setUpiData(null);
        setAmount(0);
        
        // Redirect to transactions page after a delay
        setTimeout(() => {
          router.push('/transactions');
        }, 2000);
        
      } else {
        throw new Error(response.message || 'Failed to create transaction');
      }
      
    } catch (error) {
      console.error('Failed to create transaction:', error);
      toast({
        variant: "destructive",
        title: "Transaction Error",
        description: error instanceof Error ? error.message : 'Failed to record transaction',
      });
    } finally {
      setIsCreatingTransaction(false);
    }
  };

  const resetScanner = () => {
    setUpiData(null);
    setAmount(0);
    setScanError('');
    setIsScanning(false);
  };

  return (
    <div className="container max-w-md mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="flat"
          onPress={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2">
          <QrCode className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold">Scan & Pay</h1>
        </div>
      </div>

      {/* Error Alert */}
      {scanError && (
        <Alert 
          color="danger"
          variant="faded"
          title="Scanner Error"
          description={scanError}
          startContent={<XCircle className="w-4 h-4" />}
        />
      )}

      {/* Main Content */}
      {!upiData ? (
        // Scanner Phase
        <div className="space-y-4">
          <QRScannerComponent
            onScanResult={handleScanResult}
            onError={handleScanError}
            isActive={isScanning}
            onToggle={() => setIsScanning(!isScanning)}
          />
          
          {!isScanning && (
            <Card>
              <CardBody className="text-center py-8 space-y-2">
                <QrCode className="w-12 h-12 text-default-300 mx-auto" />
                <h3 className="text-lg font-medium">Ready to Scan</h3>
                <p className="text-sm text-default-500">
                  Scan any UPI payment QR code to get started
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      ) : (
        // Payment Phase  
        <div className="space-y-4">
          <PaymentPreview
            upiData={upiData}
            onAmountChange={setAmount}
            onPaymentInitiated={handlePaymentInitiated}
            onError={(error) => {
              toast({
                variant: "destructive",
                title: "Payment Error",
                description: error,
              });
            }}
          />
          
          {/* Reset Button */}
          <Button
            fullWidth
            variant="flat"
            onPress={resetScanner}
            startContent={<QrCode className="w-4 h-4" />}
          >
            Scan Another QR Code
          </Button>
        </div>
      )}

      {/* Loading Overlay for Transaction Creation */}
      {isCreatingTransaction && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card>
            <CardBody className="text-center py-8 space-y-4">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <div>
                <h3 className="font-medium">Creating Transaction</h3>
                <p className="text-sm text-default-500">Please wait...</p>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}