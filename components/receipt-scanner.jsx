"use client";
import React, { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { CameraIcon, Loader2 } from "lucide-react";
import useFetchHook from "@/hooks/use-fetch";
import { scanReceipt } from "@/actions/transaction";
import { toast } from "sonner";

const ReceiptScanner = ({ onScanComplete }) => {
  const inputFileRef = useRef(null);

  const {
    isLoading: isScanReceiptLoading,
    data: scannedData,
    fn: scanReceiptFn,
  } = useFetchHook(scanReceipt);

  const handleReceiptScan = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Fil size should be less than 5MB");
      return;
    }
    await scanReceiptFn(file);
  };

  useEffect(() => {
    if (scannedData && !isScanReceiptLoading) {
      onScanComplete(scannedData);
      toast.success("Receipt scanned successfully");
    }
  }, [scannedData, isScanReceiptLoading]);

  return (
    <div>
      <input
        type="file"
        ref={inputFileRef}
        accept="image/*"
        //  capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReceiptScan(file);
        }}
        className="hidden"
      />
      <Button
        disabled={isScanReceiptLoading}
        onClick={() => inputFileRef.current?.click()}
        className="w-full h-10 bg-gradient-to-br cursor-pointer from-blue-800 to-pink-800 text-white text-xl font-bold "
      >
        {isScanReceiptLoading ? (
          <>
            <Loader2 className="mr-2 animate-spin" />
            <span className="animate-pulse max-sm:text-sm">
              Scanning Receipt...
            </span>
          </>
        ) : (
          <>
            <CameraIcon
              style={{ width: "32px", height: "32px" }}
              className="mr-2"
            />{" "}
            {/* w-16 & h-16 = 64px */}
            <span className="max-sm:text-sm">Scan Receipt with AI</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default ReceiptScanner;
