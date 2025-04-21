"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";
import BarcodeScanner from "@/components/warehouse/barcode-scanner";

const MoveToStoreButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="default"
        onClick={() => setIsOpen(true)}
        className="bg-brand-green hover:bg-brand-green/90 text-white"
      >
        <ExternalLink className="mr-2 h-4 w-4" />
        Move by Barcode
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md !bg-white">
          <DialogHeader>
            <DialogTitle className="text-black">Scan Barcode</DialogTitle>
            <DialogDescription>
              Scan a product barcode to move it from warehouse to store
            </DialogDescription>
          </DialogHeader>

          <BarcodeScanner onSuccess={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MoveToStoreButton;
