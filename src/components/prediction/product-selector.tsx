"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { ProductResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProductSelectorProps {
  products: ProductResponse[];
  selectedProductSid: string | null;
  setSelectedProduct: (sid: string | null) => void;
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ProductSelector = ({
  products,
  selectedProductSid,
  setSelectedProduct,
  isLoading,
  searchTerm,
  setSearchTerm,
}: ProductSelectorProps) => {
  const handleProductSelect = (productSid: string) => {
    setSelectedProduct(productSid);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px] border border-[#e5e7eb] rounded-md bg-[#f9fafb]">
        <div className="flex flex-col items-center text-[#6b7280]">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p className="text-sm">Загрузка продуктов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#6b7280]" />
        <Input
          placeholder="Поиск продуктов..."
          className="pl-8 border-[#e5e7eb] text-[#1f2937]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="h-[300px] overflow-y-auto border border-[#e5e7eb] rounded-md bg-[#ffffff]">
        {products.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#6b7280] text-sm">
              {searchTerm
                ? "Нет продуктов, соответствующих запросу"
                : "Нет доступных продуктов"}
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-1">
            {products.map((product) => (
              <Button
                key={product.sid}
                variant="ghost"
                className={cn(
                  "w-full justify-start font-normal h-auto py-3 px-4 hover:bg-[#f3f4f6]",
                  selectedProductSid === product.sid &&
                  "bg-[#EBE3FF] text-[#6322FE] font-medium hover:bg-[#EBE3FF]"
                )}
                onClick={() => handleProductSelect(product.sid)}
              >
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm">{product.name}</span>
                  <span className="text-xs text-[#6b7280]">
                    {product.category?.name || "Без категории"}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSelector;