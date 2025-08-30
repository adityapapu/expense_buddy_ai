"use client";
import { useState, useEffect } from 'react';

export interface UPIData {
  pa?: string;  // Payee address (UPI ID)
  pn?: string;  // Payee name
  am?: string;  // Amount
  cu?: string;  // Currency
  tn?: string;  // Transaction note
  tr?: string;  // Transaction reference
  mc?: string;  // Merchant code
  url?: string; // URL
}

export function parseUPIData(qrData: string): UPIData | null {
  try {
    // Check if it's a UPI URL
    if (qrData.startsWith('upi://pay?')) {
      const url = new URL(qrData);
      const params = url.searchParams;
      
      return {
        pa: params.get('pa') || undefined,
        pn: params.get('pn') || undefined, 
        am: params.get('am') || undefined,
        cu: params.get('cu') || 'INR',
        tn: params.get('tn') || undefined,
        tr: params.get('tr') || undefined,
        mc: params.get('mc') || undefined,
        url: params.get('url') || undefined,
      };
    }
    
    // Try to parse as JSON (some QR codes contain JSON)
    if (qrData.startsWith('{')) {
      const parsed = JSON.parse(qrData);
      if (parsed.pa || parsed.upi) {
        return {
          pa: parsed.pa || parsed.upi,
          pn: parsed.pn || parsed.name,
          am: parsed.am || parsed.amount,
          cu: parsed.cu || 'INR',
          tn: parsed.tn || parsed.note,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error parsing UPI data:', error);
    return null;
  }
}

export function generateUPIURL(upiData: UPIData, amount?: number): string {
  const params = new URLSearchParams();
  
  if (upiData.pa) params.set('pa', upiData.pa);
  if (upiData.pn) params.set('pn', upiData.pn);
  if (amount) {
    params.set('am', amount.toString());
  } else if (upiData.am) {
    params.set('am', upiData.am);
  }
  params.set('cu', upiData.cu || 'INR');
  if (upiData.tn) params.set('tn', upiData.tn);
  if (upiData.tr) params.set('tr', upiData.tr);
  if (upiData.mc) params.set('mc', upiData.mc);

  return `upi://pay?${params.toString()}`;
}

export function detectUPIApps() {
  const userAgent = navigator.userAgent.toLowerCase();
  const isAndroid = userAgent.includes('android');
  const isIOS = userAgent.includes('iphone') || userAgent.includes('ipad');
  
  return {
    canOpenUPIApps: isAndroid || isIOS,
    isAndroid,
    isIOS,
    availableApps: [
      { name: 'Google Pay', scheme: 'tez://', packageName: 'com.google.android.apps.nbu.paisa.user' },
      { name: 'PhonePe', scheme: 'phonepe://', packageName: 'com.phonepe.app' },
      { name: 'Paytm', scheme: 'paytmmp://', packageName: 'net.one97.paytm' },
      { name: 'BHIM', scheme: 'bhim://', packageName: 'in.org.npci.upiapp' },
      { name: 'Amazon Pay', scheme: 'amazonpay://', packageName: 'in.amazon.mShop.android.shopping' },
    ]
  };
}

export function openUPIApp(upiUrl: string, appScheme?: string): boolean {
  try {
    let finalUrl = upiUrl;
    
    // If specific app scheme is provided, replace upi:// with app scheme
    if (appScheme && appScheme !== 'upi://') {
      finalUrl = upiUrl.replace('upi://', appScheme);
    }
    
    // Try to open the URL
    window.location.href = finalUrl;
    
    // For web browsers, also try opening as a new window (fallback)
    if (!appScheme || appScheme === 'upi://') {
      setTimeout(() => {
        try {
          window.open(finalUrl, '_blank');
        } catch (e) {
          console.log('Fallback window.open failed:', e);
        }
      }, 1000);
    }
    
    return true;
  } catch (error) {
    console.error('Error opening UPI app:', error);
    return false;
  }
}

export interface UPIHandlerProps {
  upiData: UPIData;
  amount: number;
  onPaymentInitiated?: () => void;
  onError?: (error: string) => void;
}

export function useUPIHandler({ upiData, amount, onPaymentInitiated, onError }: UPIHandlerProps) {
  const [isPaymentInProgress, setIsPaymentInProgress] = useState(false);
  const apps = detectUPIApps();

  const initiatePayment = (appScheme?: string) => {
    if (!upiData.pa) {
      onError?.('Invalid UPI data: No payee address found');
      return false;
    }

    setIsPaymentInProgress(true);
    
    try {
      const upiUrl = generateUPIURL(upiData, amount);
      const success = openUPIApp(upiUrl, appScheme);
      
      if (success) {
        onPaymentInitiated?.();
        // Reset the progress state after a delay
        setTimeout(() => setIsPaymentInProgress(false), 3000);
      } else {
        setIsPaymentInProgress(false);
        onError?.('Failed to open UPI app');
      }
      
      return success;
    } catch (error) {
      setIsPaymentInProgress(false);
      onError?.('Error initiating payment: ' + (error as Error).message);
      return false;
    }
  };

  return {
    initiatePayment,
    isPaymentInProgress,
    availableApps: apps.availableApps,
    canOpenUPIApps: apps.canOpenUPIApps,
  };
}