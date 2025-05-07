// src/components/prediction/product-selector.tsx

"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { useStoreItemsStore } from "@/store/store-items-store";
import { usePredictionStore } from "@/store/prediction-store";
import { cn } from "@/lib/utils";

interface ProductSelectorProps {
  selectedCategory: string | null;
  isLoading?: boolean;
}

const ProductSelector = ({ selectedCategory, isLoading = false }: ProductSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { activeItems } = useStoreItemsStore();
  const { selectedProductSid, setSelectedProduct } = usePredictionStore();

  // Filter items based on search term and selected category
  const filteredItems = activeItems.filter((item) => {
    const matchesSearch = item.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory 
      ? item.product.category?.sid === selectedCategory 
      : true;
    
    return matchesSearch && matchesCategory;
  });

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
        {filteredItems.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">
              {searchTerm
                ? "Нет продуктов, соответствующих запросу"
                : "Нет доступных продуктов"}
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-1">
            {filteredItems.map((item) => (
              <Button
                key={item.product.sid}
                variant="ghost"
                className={cn(
                  "w-full justify-start font-normal h-auto py-3 px-4",
                  selectedProductSid === item.product.sid &&
                    "bg-primary/10 text-primary font-medium"
                )}
                onClick={() => handleProductSelect(item.product.sid)}
              >
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm">{item.product.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.product.category?.name || "Без категории"} | Кол-во: {item.quantity}
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