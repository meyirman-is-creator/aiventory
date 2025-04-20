"use client";

import { useState } from "react";
import { WarehouseItem } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useWarehouseStore } from "@/store/warehouse-store";
import { Minus, Plus } from "lucide-react";

interface MoveToStoreModalProps {
  item: WarehouseItem;
  open: boolean;
  onClose: () => void;
}

const MoveToStoreModal = ({ item, open, onClose }: MoveToStoreModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(item.product.default_price || 0);
  const [isLoading, setIsLoading] = useState(false);
  const { moveToStore } = useWarehouseStore();
  const { toast } = useToast();

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else if (value > item.quantity) {
      setQuantity(item.quantity);
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

  const incrementQuantity = () => {
    if (quantity < item.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleSubmit = async () => {
    if (quantity < 1 || quantity > item.quantity) {
      toast({
        title: "Invalid quantity",
        description: `Please enter a quantity between 1 and ${item.quantity}`,
        variant: "destructive",
      });
      return;
    }

    if (price <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a price greater than 0",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await moveToStore(item.sid, quantity, price);
      toast({
        title: "Item moved to store",
        description: `Successfully moved ${quantity} ${item.product.name} to store`,
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to move item to store",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move to Store</DialogTitle>
          <DialogDescription>
            Move {item.product.name} from warehouse to store
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Product</Label>
            <div className="text-sm font-medium">{item.product.name}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantity (Available: {item.quantity})
            </Label>
            <div className="flex items-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-r-none"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min={1}
                max={item.quantity}
                className="h-8 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-l-none"
                onClick={incrementQuantity}
                disabled={quantity >= item.quantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price per unit</Label>
            <div className="flex items-center">
              <span className="text-sm mr-2">$</span>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={handlePriceChange}
                min={0}
                step={0.01}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            {item.product.default_price && (
              <p className="text-xs text-muted-foreground">
                Default price: ${item.product.default_price.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-brand-purple hover:bg-brand-purple/90"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Moving..." : "Move to Store"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveToStoreModal;
