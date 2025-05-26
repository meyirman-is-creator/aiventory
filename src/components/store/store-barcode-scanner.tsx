"use client";

import { useState, useEffect } from "react";
import { useZxing } from "react-zxing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { storeApi } from "@/lib/api";
import { StoreItem } from "@/lib/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Loader2, CameraOff, Camera, Barcode, Package, AlertTriangle, SwitchCamera, ShoppingCart, Minus, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { fetchActiveItems, fetchReports, fetchSalesHistory } from "@/redux/slices/storeSlice";

interface BarcodeScannerProps {
  onSuccess?: () => void;
}

const StoreBarcodeScanner = ({ onSuccess }: BarcodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [productInfo, setProductInfo] = useState<StoreItem | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();

  const { ref } = useZxing({
    onDecodeResult(result) {
      const barcodeValue = result.getText();

      if (barcodeValue && barcodeValue !== lastScannedCode) {
        setLastScannedCode(barcodeValue);
        setScannedBarcode(barcodeValue);
        setIsScanning(false);

        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
        audio.play().catch(() => { });

        toast({
          title: "Штрих-код обнаружен",
          description: `Штрих-код: ${barcodeValue}`,
        });

        fetchProductByBarcode(barcodeValue);
      }
    },
    paused: !isScanning,
    constraints: {
      video: {
        facingMode: facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30, max: 30 }
      },
      audio: false
    },
    timeBetweenDecodingAttempts: 100
  });

  useEffect(() => {
    if (!isScanning) {
      setLastScannedCode(null);
    }
  }, [isScanning]);

  useEffect(() => {
    if (productInfo) {
      setQuantity("1");
    }
  }, [productInfo]);

  const fetchProductByBarcode = async (barcode: string) => {
    setIsLoadingProduct(true);
    try {
      const items = await storeApi.getItems("active");
      const matchingItem = items.find(item => item.product.barcode === barcode);

      if (matchingItem) {
        setProductInfo(matchingItem);
      } else {
        toast({
          title: "Товар не найден",
          description: "Активный товар с таким штрих-кодом не найден в магазине",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : "Не удалось загрузить информацию о товаре";
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setQuantity("");
      return;
    }
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0 && productInfo && numValue <= productInfo.quantity) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    const currentQty = quantity === "" ? 0 : parseInt(quantity);
    if (productInfo && currentQty < productInfo.quantity) {
      setQuantity((currentQty + 1).toString());
    }
  };

  const decrementQuantity = () => {
    const currentQty = quantity === "" ? 0 : parseInt(quantity);
    if (currentQty > 0) {
      setQuantity((currentQty - 1).toString());
    }
  };

  const calculatePrice = () => {
    if (!productInfo) return 0;
    
    const hasDiscount = productInfo.current_discounts && productInfo.current_discounts.length > 0;
    const discountPercentage = hasDiscount ? productInfo.current_discounts[0].percentage : 0;
    return hasDiscount ? productInfo.price * (1 - discountPercentage / 100) : productInfo.price;
  };

  const handleSellProduct = async () => {
    if (!scannedBarcode || !productInfo) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, отсканируйте штрих-код товара",
        variant: "destructive",
      });
      return;
    }

    const numQuantity = parseInt(quantity) || 0;

    if (numQuantity < 1 || numQuantity > productInfo.quantity) {
      toast({
        title: "Неверное количество",
        description: `Пожалуйста, введите количество от 1 до ${productInfo.quantity}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const finalPrice = calculatePrice();
      await storeApi.recordSale(productInfo.sid, numQuantity, finalPrice);
      
      dispatch(fetchActiveItems());
      dispatch(fetchReports());
      dispatch(fetchSalesHistory({}));
      
      toast({
        title: "Успех",
        description: `Продано ${numQuantity} ${productInfo.product.name}`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : "Не удалось зарегистрировать продажу";
      toast({
        title: "Ошибка",
        description: errorMessage,
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
      setProductInfo(null);
      setQuantity("");
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
    setIsScanning(false);
    setTimeout(() => {
      setIsScanning(true);
    }, 100);
  };

  const getDaysUntilExpiry = () => {
    if (!productInfo?.expire_date) return null;
    const today = new Date();
    const expireDate = new Date(productInfo.expire_date);
    return Math.ceil((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const videoStyle = facingMode === "user" ? { transform: 'scaleX(-1)' } : {};

  return (
    <div className="space-y-4">
      {isScanning ? (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden border-2 border-[#6322FE] aspect-video bg-black">
            <video ref={ref} className="w-full h-full object-cover" style={videoStyle} />
            <div className="absolute inset-0 pointer-events-none">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <mask id="scanMask">
                    <rect x="0" y="0" width="100" height="100" fill="white" />
                    <rect x="20" y="40" width="60" height="20" fill="black" rx="2" />
                  </mask>
                </defs>
                <rect x="0" y="0" width="100" height="100" fill="black" fillOpacity="0.6" mask="url(#scanMask)" />
              </svg>

              <div className="absolute left-[20%] top-[40%] w-[60%] h-[20%]">
                <div className="absolute inset-0 border-2 border-[#6322FE] rounded-lg"></div>
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#6322FE] rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#6322FE] rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#6322FE] rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#6322FE] rounded-br-lg"></div>

                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-b from-[#6322FE] to-transparent animate-pulse"></div>
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-[#6322FE] animate-scan"></div>
                </div>
              </div>

              <div className="absolute top-4 right-4">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={switchCamera}
                  className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70"
                >
                  <SwitchCamera className="h-5 w-5" />
                </Button>
              </div>

              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="bg-black/80 backdrop-blur-sm text-white text-xs sm:text-sm px-4 py-2 rounded-full border border-white/20">
                  Поместите штрих-код в рамку
                </div>
              </div>

              <div className="absolute top-4 left-4">
                <div className="bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/20">
                  {facingMode === "environment" ? "Задняя камера" : "Передняя камера"}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              type="button"
              onClick={toggleScanner}
              variant="outline"
              className="border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb]"
            >
              <CameraOff className="mr-2 h-4 w-4" />
              Остановить сканирование
            </Button>
          </div>
        </div>
      ) : productInfo ? (
        <div className="space-y-4">
          <Card className="border-[#10b981] bg-[#d1fae5]/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center text-[#065f46]">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Информация о товаре
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-[#6b7280]">Название</p>
                  <p className="font-medium text-[#1f2937] text-sm sm:text-base">{productInfo.product.name}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-[#6b7280]">Категория</p>
                  <p className="font-medium text-[#1f2937] text-sm sm:text-base">{productInfo.product.category?.name || "Н/Д"}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-[#6b7280]">Штрих-код</p>
                  <p className="font-medium text-[#1f2937] font-mono text-sm sm:text-base">{productInfo.product.barcode || scannedBarcode}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-[#6b7280]">В наличии</p>
                  <p className="font-medium text-[#1f2937] text-sm sm:text-base">{productInfo.quantity} {productInfo.product.default_unit || "шт"}</p>
                </div>
                {productInfo.batch_code && (
                  <div>
                    <p className="text-xs sm:text-sm text-[#6b7280]">Код партии</p>
                    <p className="font-medium text-[#1f2937] text-sm sm:text-base">{productInfo.batch_code}</p>
                  </div>
                )}
                {productInfo.expire_date && (
                  <div>
                    <p className="text-xs sm:text-sm text-[#6b7280]">Срок годности</p>
                    <p className="font-medium text-[#1f2937] text-sm sm:text-base">{formatDate(productInfo.expire_date)}</p>
                    {getDaysUntilExpiry() !== null && getDaysUntilExpiry()! <= 7 && (
                      <p className="text-xs text-[#ef4444] font-medium">
                        Осталось {getDaysUntilExpiry()} дней
                      </p>
                    )}
                  </div>
                )}
              </div>

              {productInfo.current_discounts && productInfo.current_discounts.length > 0 && (
                <>
                  <Separator />
                  <div className="bg-[#d1fae5] border border-[#10b981] rounded-md p-2 sm:p-3">
                    <div className="flex items-start">
                      <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-[#059669] mr-2 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-medium text-[#065f46]">
                          Активная скидка: {productInfo.current_discounts[0].percentage}%
                        </p>
                        <p className="text-xs text-[#047857] mt-1">
                          Цена со скидкой: {formatCurrency(calculatePrice())}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-[#374151] text-sm sm:text-base">Количество для продажи</Label>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-r-none border-[#e5e7eb]"
                  onClick={decrementQuantity}
                  disabled={quantity === "" || parseInt(quantity) <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  placeholder="0"
                  min={0}
                  max={productInfo.quantity}
                  className="h-8 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-[#e5e7eb] text-[#1f2937] focus:ring-2 focus:ring-[#6322FE] focus:border-[#6322FE] placeholder:text-[#9ca3af]"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-l-none border-[#e5e7eb]"
                  onClick={incrementQuantity}
                  disabled={quantity !== "" && parseInt(quantity) >= productInfo.quantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-[#6b7280]">Максимум: {productInfo.quantity} {productInfo.product.default_unit || "шт"}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-[#374151] text-sm sm:text-base">Итоговая цена</Label>
              <div className="bg-[#f3f4f6] p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#6b7280]">Цена за единицу:</span>
                  <span className="text-sm font-medium text-[#1f2937]">{formatCurrency(calculatePrice())}</span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#e5e7eb]">
                  <span className="text-base font-medium text-[#1f2937]">Итого:</span>
                  <span className="text-lg font-bold text-[#1f2937]">
                    {formatCurrency(calculatePrice() * (parseInt(quantity) || 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={toggleScanner}
              disabled={isLoading}
              className="w-full sm:w-auto border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb]"
            >
              <Camera className="mr-2 h-4 w-4" />
              Сканировать новый код
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto bg-[#6322FE] hover:bg-[#5719d8] text-[#ffffff]"
              onClick={handleSellProduct}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Оформить продажу
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4 py-2">
          <div className="border-2 border-dashed border-[#e5e7eb] rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center">
            <Barcode className="h-8 w-8 sm:h-10 sm:w-10 text-[#6b7280] mb-4" />
            <p className="text-xs sm:text-sm text-[#6b7280] mb-2">
              Отсканируйте штрих-код товара для продажи
            </p>
            <Button
              type="button"
              onClick={toggleScanner}
              className="bg-[#6322FE] hover:bg-[#5719d8] text-[#ffffff]"
            >
              <Camera className="mr-2 h-4 w-4" />
              Начать сканирование
            </Button>
          </div>
        </div>
      )}

      {isLoadingProduct && (
        <div className="text-center py-4">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#6322FE]" />
          <p className="text-xs sm:text-sm text-[#6b7280] mt-2">Загрузка информации о товаре...</p>
        </div>
      )}
    </div>
  );
};

export default StoreBarcodeScanner;