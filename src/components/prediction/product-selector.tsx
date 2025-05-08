// src/components/prediction/product-selector.tsx
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
      <div className="flex items-center justify-center h-[300px] border rounded-md bg-gray-50">
        <div className="flex flex-col items-center text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p className="text-sm">Загрузка продуктов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск продуктов..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="h-[300px] overflow-y-auto border rounded-md">
        {products.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">
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
                  "w-full justify-start font-normal h-auto py-3 px-4",
                  selectedProductSid === product.sid &&
                    "bg-primary/10 text-primary font-medium"
                )}
                onClick={() => handleProductSelect(product.sid)}
              >
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm">{product.name}</span>
                  <span className="text-xs text-muted-foreground">
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
