// src/components/warehouse/barcode-scanner.tsx

"use client";

import { useState, useEffect } from "react";
import { useZxing } from "react-zxing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useWarehouseStore } from "@/store/warehouse-store";
import { Loader2, CameraOff, Camera, Barcode } from "lucide-react";

interface BarcodeScannerProps {
  onSuccess?: () => void;
}

const BarcodeScanner = ({ onSuccess }: BarcodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [suggestedPrice, setSuggestedPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { moveToStoreByBarcode } = useWarehouseStore();
  const { toast } = useToast();

  const { ref } = useZxing({
    onDecodeResult(result) {
      const barcodeValue = result.getText();
      setScannedBarcode(barcodeValue);
      setIsScanning(false);
      
      // Provide feedback that barcode was detected
      toast({
        title: "Штрих-код обнаружен",
        description: `Штрих-код: ${barcodeValue}`,
      });
      
      // Mock fetching product price based on barcode
      fetchProductDetails(barcodeValue);
    },
    paused: !isScanning,
  });

  const fetchProductDetails = (barcode: string) => {
    // In a real app, you would make an API call to get product details
    // This is a mock implementation
    setTimeout(() => {
      const randomSuggestedPrice = Math.round(Math.random() * 1000 + 300);
      setSuggestedPrice(randomSuggestedPrice);
      setPrice(randomSuggestedPrice);
    }, 500);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else {
      setQuantity(value);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value < 0) {
      setPrice(0);
    } else {
      setPrice(value);
    }
  };

  const handleScanBarcode = async () => {
    if (!scannedBarcode) {
      toast({
        title: "Штрих-код не отсканирован",
        description: "Пожалуйста, отсканируйте штрих-код товара",
        variant: "destructive",
      });
      return;
    }

    if (quantity < 1) {
      toast({
        title: "Неверное количество",
        description: "Пожалуйста, введите количество больше 0",
        variant: "destructive",
      });
      return;
    }

    if (price <= 0) {
      toast({
        title: "Неверная цена",
        description: "Пожалуйста, введите цену больше 0",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await moveToStoreByBarcode(scannedBarcode, quantity, price);
      toast({
        title: "Успех",
        description: "Товар успешно перемещен в магазин",
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description:
          error.response?.data?.detail ||
          "Не удалось переместить товар в магазин",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleScanner = () => {
    setIsScanning(!isScanning);
    if (!isScanning) {
      setScannedBarcode(null);
    }
  };

  return (
    <div className="space-y-4">
      {isScanning ? (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden border border-gray-300 aspect-video">
            <video ref={ref} className="w-full h-full object-cover" />
            <div className="absolute inset-0 pointer-events-none">
              <div className="relative w-full h-full">
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/4 border-2 border-brand-purple rounded-lg"></div>
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/4 border border-white/50 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <Button
              type="button"
              onClick={toggleScanner}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              <CameraOff className="mr-2 h-4 w-4" />
              Остановить сканирование
            </Button>
          </div>
        </div>
      ) : scannedBarcode ? (
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-green-50 border-green-200">
            <div className="flex items-center space-x-2">
              <Barcode className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-medium text-green-800">Штрих-код отсканирован</h3>
                <p className="text-sm text-green-600">{scannedBarcode}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="quantity">Количество</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min={1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Цена за единицу</Label>
              <div className="flex items-center">
                <span className="text-sm mr-2">₸</span>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={handlePriceChange}
                  min={0}
                  step={0.01}
                />
              </div>
              {suggestedPrice > 0 && (
                <p className="text-xs text-green-600 font-medium">
                  Рекомендуемая цена: ₸{suggestedPrice.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={toggleScanner}
              disabled={isLoading}
            >
              <Camera className="mr-2 h-4 w-4" />
              Сканировать новый код
            </Button>
            <Button
              type="button"
              className="bg-brand-purple hover:bg-brand-purple/90"
              onClick={handleScanBarcode}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Обработка...
                </>
              ) : (
                "Переместить в магазин"
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4 py-2">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center">
            <Barcode className="h-10 w-10 text-gray-400 mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Отсканируйте штрих-код товара с помощью камеры
            </p>
            <Button
              type="button"
              onClick={toggleScanner}
              className="bg-brand-purple hover:bg-brand-purple/90"
            >
              <Camera className="mr-2 h-4 w-4" />
              Начать сканирование
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;