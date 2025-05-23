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
        className="bg-[#26E989] hover:bg-[#1dce7a] text-[#ffffff] w-full sm:w-auto"
      >
        <ExternalLink className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Переместить по штрих-коду</span>
        <span className="sm:hidden">По штрих-коду</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[95%] sm:w-[90%] md:w-[80%] lg:w-[65%] max-w-[800px] bg-[#ffffff] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1f2937] text-lg sm:text-xl">
              Сканировать штрих-код
            </DialogTitle>
            <DialogDescription className="text-[#6b7280] text-sm sm:text-base">
              Сканируйте штрих-код товара, чтобы переместить его со склада в
              магазин
            </DialogDescription>
          </DialogHeader>

          <BarcodeScanner onSuccess={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MoveToStoreButton;