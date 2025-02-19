import { useState, useRef, RefObject, useCallback } from "react";
import jsQR from "jsqr";

interface UseQRScannerOptions {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  onQRCodeScanned: (code: string) => void;
  onError: (error: Error) => void;
}

export const useQRScanner = ({
  videoRef,
  canvasRef,
  onQRCodeScanned,
  onError,
}: UseQRScannerOptions) => {
  const [isScanning, setIsScanning] = useState(false);
  const [initAttempts, setInitAttempts] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();
  const initTimeoutRef = useRef<NodeJS.Timeout>();

  const scanQRCode = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      console.log("Scan skipped: missing refs", {
        hasVideo: !!videoRef.current,
        hasCanvas: !!canvasRef.current,
      });
      return;
    }

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

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log("Invalid video dimensions, retrying...");
      animationFrameRef.current = requestAnimationFrame(scanQRCode);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        console.log("QR code found:", code.data);
        stopScanner();
        onQRCodeScanned(code.data);
      } else {
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
  }, [isScanning, onQRCodeScanned]);

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

        await new Promise((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error("Video element not found"));
            return;
          }

          const timeoutId = setTimeout(() => {
            reject(new Error("Video initialization timeout"));
          }, 10000);

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

        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log("Camera initialized successfully");
        setIsScanning(true);
        await new Promise((resolve) => setTimeout(resolve, 0));

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
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      onError(err);

      if (initAttempts < 3) {
        console.log("Retrying camera initialization...", initAttempts + 1);
        setInitAttempts((prev) => prev + 1);
        initTimeoutRef.current = setTimeout(() => {
          startScanner();
        }, 1000);
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

  const resetScanner = async () => {
    stopScanner();
    setInitAttempts(0);
    await new Promise((resolve) => setTimeout(resolve, 500));
    startScanner();
  };

  return {
    isScanning,
    startScanner,
    stopScanner,
    resetScanner,
  };
}; 