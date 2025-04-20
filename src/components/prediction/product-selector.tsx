"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useStoreItemsStore } from "@/store/store-items-store";
import { usePredictionStore } from "@/store/prediction-store";
import { cn } from "@/lib/utils";

const ProductSelector = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { activeItems } = useStoreItemsStore();
  const { selectedProductSid, setSelectedProduct } = usePredictionStore();

  // Filter items based on search term
  const filteredItems = activeItems.filter((item) =>
    item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-select first product if none selected and items are available
  useEffect(() => {
    if (!selectedProductSid && activeItems.length > 0) {
      setSelectedProduct(activeItems[0].product.sid);
    }
  }, [activeItems, selectedProductSid, setSelectedProduct]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="h-[300px] overflow-y-auto border rounded-md">
        {filteredItems.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">No products found</p>
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
                onClick={() => setSelectedProduct(item.product.sid)}
              >
                <div className="flex flex-col items-start">
                  <span className="text-sm">{item.product.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Quantity: {item.quantity}
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
