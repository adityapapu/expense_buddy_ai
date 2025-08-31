"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Input, Button, Chip, Divider, Select, SelectItem, Spinner } from '@heroui/react';
import { IndianRupee, User, CreditCard, Smartphone, RefreshCw, Sparkles } from 'lucide-react';
import type { UPIData } from './upi-handler';
import { useUPIHandler } from './upi-handler';
import { generateTransactionSuggestion } from '@/server/services/aiService';

interface PaymentPreviewProps {
  upiData: UPIData;
  onAmountChange: (amount: number) => void;
  onPaymentInitiated: () => void;
  onError: (error: string) => void;
}

export default function PaymentPreview({ upiData, onAmountChange, onPaymentInitiated, onError }: PaymentPreviewProps) {
  const [amount, setAmount] = useState<string>('');
  const [aiSuggestion, setAiSuggestion] = useState<{
    description: string;
    categoryId: string | null;
    categoryName: string | null;
    confidence: number;
  } | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedApp, setSelectedApp] = useState<string>('default');

  const { initiatePayment, isPaymentInProgress, availableApps, canOpenUPIApps } = useUPIHandler({
    upiData,
    amount: parseFloat(amount) || 0,
    onPaymentInitiated,
    onError,
  });

  // Generate AI suggestions when UPI data changes
  useEffect(() => {
    const generateSuggestion = async () => {
      if (!upiData.pa || !upiData.pn) return;
      
      setIsLoadingAI(true);
      try {
        const suggestion = await generateTransactionSuggestion(
          upiData.pn,
          upiData.pa,
          parseFloat(amount) || 0
        );
        setAiSuggestion(suggestion);
      } catch (error) {
        console.error('Failed to generate AI suggestion:', error);
      } finally {
        setIsLoadingAI(false);
      }
    };

    void generateSuggestion();
  }, [upiData.pa, upiData.pn, amount]);

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const numericAmount = parseFloat(value) || 0;
    onAmountChange(numericAmount);
  };

  const handlePayment = () => {
    if (!amount || parseFloat(amount) <= 0) {
      onError('Please enter a valid amount');
      return;
    }

    const appScheme = selectedApp === 'default' ? undefined : availableApps.find(app => app.packageName === selectedApp)?.scheme;
    initiatePayment(appScheme);
  };

  const refreshAISuggestion = async () => {
    if (!upiData.pa || !upiData.pn) return;
    
    setIsLoadingAI(true);
    try {
      const suggestion = await generateTransactionSuggestion(
        upiData.pn,
        upiData.pa,
        parseFloat(amount) || 0
      );
      setAiSuggestion(suggestion);
    } catch (error) {
      console.error('Failed to refresh AI suggestion:', error);
      onError('Failed to generate AI suggestion');
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Payment Details Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold">Payment Details</h3>
            <Chip size="sm" color="primary" variant="flat">
              UPI
            </Chip>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* Merchant Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-default-500" />
              <span className="text-sm text-default-500">Pay to</span>
            </div>
            <div className="pl-6">
              <p className="font-medium">{upiData.pn || 'Unknown Merchant'}</p>
              <p className="text-sm text-default-500">{upiData.pa}</p>
            </div>
          </div>

          <Divider />

          {/* Amount Input */}
          <div className="space-y-2">
            <Input
              type="number"
              label="Amount"
              placeholder="Enter amount to pay"
              value={amount}
              onValueChange={handleAmountChange}
              startContent={
                <div className="pointer-events-none flex items-center">
                  <IndianRupee className="w-4 h-4 text-default-400" />
                </div>
              }
              size="lg"
              isRequired
              min="1"
              step="0.01"
            />
          </div>

          {/* Pre-filled amount from QR */}
          {upiData.am && (
            <div className="flex items-center justify-between p-2 bg-primary/10 rounded-lg">
              <span className="text-sm">QR Code Amount:</span>
              <Button
                size="sm"
                color="primary"
                variant="flat"
                onPress={() => handleAmountChange(upiData.am ?? '0')}
              >
                Use ₹{upiData.am}
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* AI Suggestion Card */}
      {(aiSuggestion || isLoadingAI) && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h4 className="text-md font-medium">AI Suggestion</h4>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={refreshAISuggestion}
                isLoading={isLoadingAI}
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            {isLoadingAI ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span className="text-sm text-default-500">Generating smart description...</span>
              </div>
            ) : aiSuggestion ? (
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-default-500">Suggested Description</p>
                  <p className="font-medium">{aiSuggestion?.description ?? 'No description available'}</p>
                </div>
                {aiSuggestion?.categoryName && (
                  <div>
                    <p className="text-sm text-default-500">Category</p>
                    <div className="flex items-center gap-2">
                      <Chip size="sm" color="secondary" variant="flat">
                        {aiSuggestion?.categoryName}
                      </Chip>
                      <span className="text-xs text-default-400">
                        {Math.round((aiSuggestion?.confidence ?? 0) * 100)}% confident
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </CardBody>
        </Card>
      )}

      {/* Payment App Selection */}
      {canOpenUPIApps && availableApps.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-default-500" />
              <h4 className="text-md font-medium">Payment App</h4>
            </div>
          </CardHeader>
          <CardBody>
            <Select
              label="Choose UPI App"
              selectedKeys={[selectedApp]}
              onSelectionChange={(keys) => setSelectedApp(Array.from(keys)[0] as string)}
              size="sm"
            >
              {[
                <SelectItem key="default">Any UPI App</SelectItem>,
                ...availableApps.map((app) => (
                  <SelectItem key={app.packageName}>{app.name}</SelectItem>
                ))
              ]}
            </Select>
          </CardBody>
        </Card>
      )}

      {/* Pay Button */}
      <Card>
        <CardBody>
          <Button
            color="primary"
            size="lg"
            fullWidth
            onPress={handlePayment}
            isLoading={isPaymentInProgress}
            isDisabled={!amount || parseFloat(amount) <= 0}
            startContent={!isPaymentInProgress && <CreditCard className="w-4 h-4" />}
          >
            {isPaymentInProgress ? 'Opening Payment App...' : `Pay ₹${amount || '0'}`}
          </Button>
          
          {!canOpenUPIApps && (
            <p className="text-xs text-default-500 text-center mt-2">
              UPI apps may not be available on this device
            </p>
          )}
        </CardBody>
      </Card>

      {/* Transaction Note */}
      {upiData.tn && (
        <Card>
          <CardBody>
            <div className="space-y-1">
              <p className="text-sm text-default-500">Transaction Note</p>
              <p className="text-sm">{upiData.tn}</p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}