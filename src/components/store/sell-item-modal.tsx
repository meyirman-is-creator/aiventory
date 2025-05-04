"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { StoreItem } from "@/lib/types";
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
import { recordSale } from "@/redux/slices/storeSlice";
import { formatCurrency } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import { AppDispatch } from "@/redux/store";

interface SellItemModalProps {
  item: StoreItem;
  open: boolean;
  onClose: () => void;
}

const SellItemModal = ({ item, open, onClose }: SellItemModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const hasDiscount =
    item.current_discounts && item.current_discounts.length > 0;
  const discountPercentage = hasDiscount
    ? item.current_discounts[0].percentage
    : 0;
  const pricePerUnit = hasDiscount
    ? item.price * (1 - discountPercentage / 100)
    : item.price;

  const totalPrice = pricePerUnit * quantity;

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

    setIsLoading(true);

    try {
      await dispatch(
        recordSale({
          storeItemSid: item.sid,
          soldQty: quantity,
          soldPrice: pricePerUnit,
        })
      ).unwrap();

      toast({
        title: "Sale recorded",
        description: `Successfully sold ${quantity} ${item.product.name}`,
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record sale",
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
          <DialogTitle>Sell Item</DialogTitle>
          <DialogDescription>
            Record a sale for {item.product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Product</Label>
            <div className="text-sm font-medium">{item.product.name}</div>
          </div>

          <div className="space-y-2">
            <Label>Price per unit</Label>
            <div className="flex items-center">
              <div className="text-sm font-medium">
                {hasDiscount && (
                  <span className="line-through text-muted-foreground mr-2">
                    {formatCurrency(item.price)}
                  </span>
                )}
                {formatCurrency(pricePerUnit)}
              </div>
              {hasDiscount && (
                <div className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                  {discountPercentage}% off
                </div>
              )}
            </div>
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
            <Label>Total Price</Label>
            <div className="text-lg font-bold">
              {formatCurrency(totalPrice)}
            </div>
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
            {isLoading ? "Processing..." : "Complete Sale"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SellItemModal;
