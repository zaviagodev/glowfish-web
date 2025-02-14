import { useTranslate } from "@refinedev/core";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Camera,
  QrCode,
  X,
  RefreshCw,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { useCustomer } from "@/hooks/useCustomer";
import jsQR from "jsqr";

interface RedeemResponse {
  points_earned: number;
}

const ScanToRedeemPage = () => {
  const t = useTranslate();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { refreshCustomer } = useCustomer();
  const [data, setData] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [initAttempts, setInitAttempts] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();
  const initTimeoutRef = useRef<NodeJS.Timeout>();

  const redeemCode = async (code: string) => {
    try {
      setIsRedeeming(true);
      setError("");
      console.log("Attempting to redeem code:", code);

      const { data, error } = await supabase
        .rpc("redeem_campaign_code", {
          p_code: code,
        })
        .single();

      if (error) {
        console.error("Redemption error:", error);
        throw error;
      }

      console.log("Redemption response:", data);
      const response = data as RedeemResponse;
      setPointsEarned(response.points_earned);
      addToast(
        t("Success! You earned {{points}} points!", {
          points: response.points_earned,
        }),
        "success"
      );

      // Refresh customer data after successful redemption
      await refreshCustomer();
    } catch (error: any) {
      console.error("Error in redeemCode:", error);
      setError(error.message || t("Failed to redeem code"));
      addToast(error.message || t("Failed to redeem code"), "error");
    } finally {
      setIsRedeeming(false);
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.log("Scan skipped: missing refs", {
        hasVideo: !!videoRef.current,
        hasCanvas: !!canvasRef.current,
      });
      return;
    }

    // Force scanning state if not set
    if (!isScanning) {
      console.log("Setting scanning state to true");
      setIsScanning(true);
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      console.log("No canvas context");
      return;
    }

    // Make sure video has valid dimensions before proceeding
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log("Invalid video dimensions, retrying...");
      animationFrameRef.current = requestAnimationFrame(scanQRCode);
      return;
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      // Draw current video frame
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data for QR code scanning
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        console.log("QR code found:", code.data);
        // QR Code found
        stopScanner();
        setData(code.data);
        redeemCode(code.data);
      } else {
        // Continue scanning if we're still in scanning state
        if (isScanning) {
          animationFrameRef.current = requestAnimationFrame(scanQRCode);
        } else {
          console.log("Scanning stopped");
        }
      }
    } catch (err) {
      console.error("Error scanning QR code:", err);
      if (isScanning) {
        animationFrameRef.current = requestAnimationFrame(scanQRCode);
      }
    }
  };

  const startScanner = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera not supported on this device");
      }

      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Camera access granted");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        // Wait for video to be ready and playing
        await new Promise((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error("Video element not found"));
            return;
          }

          const timeoutId = setTimeout(() => {
            reject(new Error("Video initialization timeout"));
          }, 10000); // 10 second timeout

          videoRef.current.onloadedmetadata = () => {
            console.log("Video metadata loaded");
            videoRef.current?.play().catch(reject);
          };

          videoRef.current.onplaying = () => {
            console.log("Video started playing");
            clearTimeout(timeoutId);
            resolve(true);
          };

          videoRef.current.onerror = (e) => {
            console.error("Video error:", e);
            clearTimeout(timeoutId);
            reject(new Error("Video error: " + e));
          };
        });

        // Add a small delay to ensure camera is fully initialized
        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log("Camera initialized successfully");

        // Set scanning state and wait for it to be updated
        setIsScanning(true);
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Start scanning loop
        console.log("Starting QR code scanning...");
        requestAnimationFrame(() => {
          if (!isScanning) {
            console.log("Starting scan directly");
            setIsScanning(true);
            scanQRCode();
          } else {
            console.log("First scan frame requested");
            scanQRCode();
          }
        });
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(t("Unable to access camera. Please check your permissions."));

      // Retry initialization if we haven't exceeded max attempts
      if (initAttempts < 3) {
        console.log("Retrying camera initialization...", initAttempts + 1);
        setInitAttempts((prev) => prev + 1);
        initTimeoutRef.current = setTimeout(() => {
          startScanner();
        }, 1000); // Wait 1 second before retrying
      }
    }
  };

  const stopScanner = () => {
    console.log("Stopping scanner...");
    if (animationFrameRef.current) {
      console.log("Canceling animation frame");
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      console.log("Stopping camera stream");
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (initTimeoutRef.current) {
      console.log("Clearing init timeout");
      clearTimeout(initTimeoutRef.current);
    }
    setIsScanning(false);
  };

  useEffect(() => {
    let mounted = true;

    const initScanner = async () => {
      try {
        if (mounted) {
          console.log("Initializing scanner...");
          await startScanner();
        }
      } catch (err) {
        console.error("Failed to initialize scanner:", err);
      }
    };

    // Add a small delay before initial start
    const timeoutId = setTimeout(() => {
      initScanner();
    }, 500);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      stopScanner();
    };
  }, []);

  const resetScanner = async () => {
    setData("");
    setPointsEarned(null);
    setError("");
    setInitAttempts(0);
    stopScanner();
    // Add a small delay before restarting
    await new Promise((resolve) => setTimeout(resolve, 500));
    startScanner();
  };

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b p-4 h-14 flex items-center gap-5 max-width-mobile">
        <Button
          variant="ghost"
          className="p-0 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => {
            stopScanner();
            navigate(-1);
          }}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold">{t("Scan to Redeem")}</h1>
      </div>

      {/* Scanner */}
      <div className="flex flex-col pt-16">
        {/* Instructions */}
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

        {/* Camera Section */}
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
                {/* Scanning overlay */}
                <div className="absolute inset-0 border-2 border-white/30">
                  <div className="absolute inset-[25%] border-2 border-white rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {(data || error) && (
          <div className="px-4 py-4 flex-1 flex ">
            <div className="max-w-sm mx-auto w-full animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-red-600 rounded-lg shadow-lg overflow-hidden">
                {data && (
                  <div className="p-4 border-b">
                    <div className="flex justify-between ">
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
                )}

                <div className="p-4">
                  {isRedeeming ? (
                    <div className="flex flex-col  justify-center py-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-2" />
                      <p className="text-sm text-gray-600">
                        {t("Redeeming code...")}
                      </p>
                    </div>
                  ) : error ? (
                    <div className="text-center">
                      <p className="text-sm mb-2">{error}</p>
                      <Button
                        onClick={resetScanner}
                        variant="ghost"
                        className="gap-2 main-btn"
                      >
                        <RefreshCw className="h-4 w-4" />
                        {t("Try Again")}
                      </Button>
                    </div>
                  ) : pointsEarned ? (
                    <div className="text-center">
                      <p className="text-lg font-semibold text-green-600">
                        +{pointsEarned} {t("Points")}
                      </p>
                      <Button className="mt-2" onClick={resetScanner}>
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
    </div>
  );
};

export default ScanToRedeemPage;
