import { useTranslate } from "@refinedev/core";
import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, QrCode, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";

interface RedeemResponse {
  points_earned: number;
}

const ScanToRedeemPage = () => {
  const t = useTranslate();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [data, setData] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const redeemCode = async (code: string) => {
    try {
      setIsRedeeming(true);
      console.log('Attempting to redeem code:', code);
      
      const { data, error } = await supabase
        .rpc('redeem_campaign_code', {
          p_code: code // Match the parameter name from the SQL function
        })
        .single();

      if (error) {
        console.error('Redemption error:', error);
        throw error;
      }

      console.log('Redemption response:', data);
      const response = data as RedeemResponse;
      setPointsEarned(response.points_earned);
      addToast(t("Success! You earned {{points}} points!", { points: response.points_earned }), "success");
    } catch (error: any) {
      console.error('Error in redeemCode:', error);
      addToast(error.message || t("Failed to redeem code"), "error");
      // Reset data on error
      setData("");
      setPointsEarned(null);
    } finally {
      setIsRedeeming(false);
    }
  };

  useEffect(() => {
    // Success callback is called when QR code is successfully scanned
    const onScanSuccess = async (decodedText: string) => {
      setData(decodedText);
      await redeemCode(decodedText);
    };

    // Failure callback is called when QR code scanning fails
    const onScanFailure = (error: any) => {
      // Just log the error, don't show to user as it can be frequent
      console.warn('QR code scan error:', error);
    };

    // Initialize the scanner
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2
      },
      false // verbose flag
    );

    // Render the scanner
    scannerRef.current.render(onScanSuccess, onScanFailure);

    // Cleanup function
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const resetScanner = () => {
    setData("");
    setPointsEarned(null);
    if (scannerRef.current) {
      scannerRef.current.resume();
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b p-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="p-0 mr-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold">{t("Scan to Redeem")}</h1>
        </div>
      </div>

      {/* Scanner */}
      <div className="flex flex-col min-h-screen pt-16">
        {/* Instructions */}
        <div className="px-4 py-2">
          <div className="max-w-sm mx-auto mb-2 p-4 bg-blue-50 rounded-lg flex items-start">
            <QrCode className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              {t("Point your camera at a QR code to scan and earn points. Make sure the code is well-lit and centered in the frame.")}
            </p>
          </div>
        </div>

        {/* Camera Section */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm">
            <div 
              id="reader"
              className="overflow-hidden rounded-lg shadow-lg bg-white"
            />
          </div>
        </div>

        {/* Results Section */}
        {data && (
          <div className="px-4 py-4">
            <div className="max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{t("Scanned Code")}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetScanner}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm mt-1 text-gray-600">{data}</p>
                </div>
                
                <div className="p-4 bg-gray-50">
                  {isRedeeming ? (
                    <div className="flex items-center justify-center py-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                    </div>
                  ) : pointsEarned ? (
                    <div className="text-center">
                      <p className="text-lg font-semibold text-green-600">
                        +{pointsEarned} {t("Points")}
                      </p>
                      <Button
                        className="mt-2"
                        onClick={resetScanner}
                      >
                        {t("Scan Another Code")}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          #reader {
            width: 100% !important;
            background: white !important;
          }
          #reader * {
            border-radius: 8px;
          }
          #reader__scan_region {
            min-width: unset !important;
            width: 100% !important;
            border: 2px solid #e5e7eb !important;
            position: relative !important;
          }
          #reader__scan_region::before {
            content: '';
            display: block;
            padding-bottom: 100%;
          }
          #reader__scan_region video {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            max-width: 100% !important;
            max-height: 100% !important;
            width: auto !important;
            height: auto !important;
          }
          #reader__scan_region img {
            object-fit: cover;
          }
          #reader__camera_selection {
            width: 100%;
            max-width: 100%;
            padding: 8px;
            margin-bottom: 8px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            background: white;
          }
          #reader__dashboard {
            padding: 8px;
            background: white;
            border-top: 1px solid #e5e7eb;
          }
          #reader__dashboard_section {
            padding: 8px;
          }
          #reader__dashboard_section_csr {
            text-align: center;
          }
          #reader__dashboard_section_csr button {
            padding: 8px 16px;
            background: #2563eb;
            color: white;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
          }
          #reader__dashboard_section_csr button:hover {
            background: #1d4ed8;
          }
          #reader__status_span {
            padding: 8px;
            color: #4b5563;
          }
          #reader__header_message {
            display: none;
          }
        `}
      </style>
    </div>
  );
};

export default ScanToRedeemPage; 