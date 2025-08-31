"use client";
import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Card, CardBody, Button } from "@heroui/react";
import { Camera, CameraOff, RefreshCw } from "lucide-react";

interface QRScannerProps {
  onScanResult: (data: string) => void;
  onError?: (error: string) => void;
  isActive: boolean;
  onToggle: () => void;
}

export default function QRScannerComponent({
  onScanResult,
  onError,
  isActive,
  onToggle,
}: QRScannerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleScan = (result: { text?: string } | string) => {
    if (result) {
      const text = typeof result === 'string' ? result : result.text ?? '';
      onScanResult(text);
    }
  };

  const handleError = (error: unknown) => {
    console.error("QR Scanner Error:", error);

    let errorMessage = "Camera error occurred";

    const errorObj = error as { name?: string; message?: string };
    if (
      errorObj?.name === "NotAllowedError" ||
      errorObj?.message?.includes("Permission denied")
    ) {
      errorMessage =
        "Camera permission denied. Please allow camera access and try again.";
    } else if (
      errorObj?.name === "NotFoundError" ||
      errorObj?.message?.includes("No camera found")
    ) {
      errorMessage = "No camera found on this device.";
    } else if (errorObj?.name === "NotSupportedError") {
      errorMessage = "Camera not supported on this device.";
    } else if (errorObj?.name === "NotReadableError") {
      errorMessage = "Camera is already in use by another application.";
    } else if (errorObj?.message) {
      errorMessage = errorObj.message;
    }

    onError?.(errorMessage);
  };

  const handleRetry = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onToggle();
    }, 500);
  };

  if (!isActive) {
    return (
      <Card className="w-full">
        <CardBody className="flex flex-col items-center justify-center space-y-4 py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Camera className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium">Ready to Scan</h3>
          <p className="max-w-sm text-center text-sm text-default-500">
            Tap the button below to start scanning QR codes for payments
          </p>
          <Button
            color="primary"
            onPress={onToggle}
            startContent={<Camera className="h-4 w-4" />}
          >
            Start Scanning
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardBody className="p-0">
        <div className="relative">
          {/* Scanner Controls */}
          <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between">
            <Button isIconOnly variant="flat" color="danger" onPress={onToggle}>
              <CameraOff className="h-4 w-4" />
            </Button>

            <Button
              isIconOnly
              variant="flat"
              color="default"
              onPress={handleRetry}
              isLoading={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Scanner Area */}
          <div className="relative mx-auto aspect-square max-w-md overflow-hidden rounded-lg bg-black">
            <Scanner
              {...{
                onDecode: handleScan,
                onError: handleError,
                constraints: {
                  facingMode: "environment",
                },
                scanDelay: 300,
                containerStyle: {
                  width: "100%",
                  height: "100%",
                },
                videoStyle: {
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }
              } as any}
            />

            {/* Scanning Overlay */}
            <div className="pointer-events-none absolute inset-0">
              {/* Corner frames */}
              <div className="absolute left-8 top-8 h-8 w-8 rounded-tl-lg border-l-2 border-t-2 border-white"></div>
              <div className="absolute right-8 top-8 h-8 w-8 rounded-tr-lg border-r-2 border-t-2 border-white"></div>
              <div className="absolute bottom-8 left-8 h-8 w-8 rounded-bl-lg border-b-2 border-l-2 border-white"></div>
              <div className="absolute bottom-8 right-8 h-8 w-8 rounded-br-lg border-b-2 border-r-2 border-white"></div>

              {/* Center guide */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-48 w-48 rounded-lg border-2 border-white/30"></div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 text-center">
            <p className="text-sm text-default-600">
              Position the QR code within the frame to scan
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
