import { useTranslate } from "@refinedev/core";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { QrCode, X, RefreshCw, ChevronLeft, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/toast";
import { useCustomer } from "@/hooks/useCustomer";
import jsQR from "jsqr";
import { PageHeader } from "@/components/shared/PageHeader";
import { useRedeemCode } from "@/features/points/hooks/useRedeemCode";
import { useQRScanner } from "@/features/points/hooks/useQRScanner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const ScanPage = () => {
  const t = useTranslate();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { refreshCustomer } = useCustomer();
  const [data, setData] = useState("");
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [hasError, setHasError] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { redeemCode, isRedeeming } = useRedeemCode({
    onSuccess: (points: number) => {
      setPointsEarned(points);
      addToast(
        t("Success! You earned {{points}} points!", {
          points,
        }),
        "success"
      );
      refreshCustomer();
    },
    onError: (error: Error) => {
      setError(error.message || t("Failed to redeem code"));
      addToast(error.message || t("Failed to redeem code"), "error");
    },
  });

  const { isScanning, startScanner, stopScanner, resetScanner } = useQRScanner({
    videoRef,
    canvasRef,
    onQRCodeScanned: (code: string) => {
      setData(code);
      redeemCode(code);
    },
    onError: (error: Error) => {
      setError(t("Unable to access camera. Please check your permissions."));
    },
  });

  useEffect(() => {
    setHasError(error ? true : false);
  }, [error]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      startScanner();
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      stopScanner();
    };
  }, []);

  const handleReset = async () => {
    setData("");
    setPointsEarned(null);
    setError("");
    resetScanner();
    setHasError(false);
  };

  return (
    <div className="bg-background">
      <PageHeader
        title={t("Scan to Redeem")}
        onBack={() => {
          stopScanner();
          navigate(-1);
        }}
      />

      <div className="flex flex-col pt-16">
        {!data && (
          <div className="px-4 py-2">
            <div className="max-w-sm mx-auto mb-2 p-4 bg-blue-800 rounded-lg flex items-start">
              <QrCode className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-blue-200">
                {t(
                  "Point your camera at a QR code to scan and earn points. Make sure the code is well-lit and centered in the frame."
                )}
              </p>
            </div>
          </div>
        )}

        {!data && (
          <div className="flex-1 flex justify-center px-4">
            <div className="w-full max-w-sm relative">
              <div className="aspect-square rounded-lg overflow-hidden bg-black relative">
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                  muted
                  autoPlay
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 border-2 border-white/30">
                  <div className="absolute inset-[25%] border-2 border-white rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        )}

        {(data || (!hasError && error)) && (
          <div className="px-4 py-4 flex-1 flex">
            <div className="max-w-sm mx-auto w-full animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-red-600 rounded-lg shadow-lg overflow-hidden">
                {data && (
                  <div className="p-4 border-b">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{t("Scanned Code")}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm mt-1 text-gray-600">{data}</p>
                  </div>
                )}

                <div className="p-4">
                  {isRedeeming ? (
                    <div className="flex flex-col justify-center py-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-2" />
                      <p className="text-sm text-gray-600">
                        {t("Redeeming code...")}
                      </p>
                    </div>
                  ) : pointsEarned ? (
                    <div className="text-center">
                      <p className="text-lg font-semibold text-green-600">
                        +{pointsEarned} {t("Points")}
                      </p>
                      <Button className="mt-2" onClick={handleReset}>
                        {t("Scan Another Code")}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}

        <Sheet open={hasError}>
          <SheetContent
            side="bottom"
            className="h-[40%] bg-background rounded-t-xl p-0 pb-8 overflow-auto max-width-mobile outline-none"
            hideCloseButton={true}
          >
            <SheetHeader className="p-4 pt-9 rounded-t-xl bg-background backdrop-blur-xl items-center before:top-3 max-width-mobile w-full -translate-y-[1px] gap-2">
              <XCircle className="text-red-500 h-16 w-16" />
              <SheetTitle className="font-semibold tracking-tight w-full text-center">
                {error}
              </SheetTitle>
            </SheetHeader>

            <div className="flex items-center gap-2 px-5">
              <Button
                onClick={() => navigate(-1)}
                className="gap-2 secondary-btn text-white w-full"
              >
                <X className="h-4 w-4" />
                {t("Close")}
              </Button>
              <Button onClick={handleReset} className="gap-2 main-btn w-full">
                <RefreshCw className="h-4 w-4" />
                {t("Try Again")}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default ScanPage;
