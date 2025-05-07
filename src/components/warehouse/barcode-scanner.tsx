"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useWarehouseStore } from "@/store/warehouse-store";
import { Camera, Loader2, X } from "lucide-react";

interface BarcodeScannerProps {
  onSuccess?: () => void;
}

const BarcodeScanner = ({ onSuccess }: BarcodeScannerProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [suggestedPrice, setSuggestedPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { moveToStoreByBarcode } = useWarehouseStore();
  const { toast } = useToast();
  const webcamRef = useRef<Webcam>(null);

  // Устанавливаем рекомендованную цену из данных после сканирования (демо функционал)
  useEffect(() => {
    if (capturedImage) {
      // В реальном приложении здесь бы был запрос к API для получения данных товара по баркоду
      // Для демонстрации просто устанавливаем случайную рекомендуемую цену
      const randomSuggestedPrice = Math.round(Math.random() * 1000 + 300);
      setSuggestedPrice(randomSuggestedPrice);
      setPrice(randomSuggestedPrice);
    }
  }, [capturedImage]);

  const captureImage = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setIsCapturing(false);
    }
  }, [webcamRef]);

  const resetImage = () => {
    setCapturedImage(null);
    setSuggestedPrice(0);
  };

  const handleScanBarcode = async () => {
    if (!capturedImage) {
      toast({
        title: "Изображение не захвачено",
        description: "Пожалуйста, сделайте снимок штрих-кода",
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
      await moveToStoreByBarcode(capturedImage, quantity, price);
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

  return (
    <div className="space-y-4">
      {isCapturing ? (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden !bg-white">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: "environment",
              }}
              className="w-full h-auto"
            />
          </div>
          <div className="flex justify-center">
            <Button
              type="button"
              onClick={captureImage}
              className="bg-brand-purple hover:bg-brand-purple/90"
            >
              <Camera className="mr-2 h-4 w-4" />
              Сделать снимок штрих-кода
            </Button>
          </div>
        </div>
      ) : capturedImage ? (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={capturedImage}
              alt="Captured barcode"
              className="w-full h-auto"
            />
            <Button
              size="icon"
              variant="outline"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              onClick={resetImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="quantity">Количество</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 0))
                }
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
                  onChange={(e) =>
                    setPrice(Math.max(0, parseFloat(e.target.value) || 0))
                  }
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
              onClick={resetImage}
              disabled={isLoading}
            >
              Сделать новый снимок
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
            <Camera className="h-10 w-10 text-gray-400 mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Сделайте снимок штрих-кода товара с помощью камеры
            </p>
            <Button
              type="button"
              onClick={() => setIsCapturing(true)}
              className="bg-brand-purple hover:bg-brand-purple/90"
            >
              Включить камеру
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
