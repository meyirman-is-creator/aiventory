"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { StoreItem } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  formatDate,
  getStatusDisplayName,
  getStatusBadgeColor,
} from "@/lib/utils";
import { ShoppingCart, PercentIcon, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { removeFromStore } from "@/redux/slices/storeSlice";
import { cn } from "@/lib/utils";
import SellItemModal from "@/components/store/sell-item-modal";
import DiscountModal from "@/components/store/discount-form";
import { AppDispatch } from "@/redux/store";

interface ActiveItemsTableProps {
  items: StoreItem[];
  isLoading: boolean;
}

const ActiveItemsTable = ({ items, isLoading }: ActiveItemsTableProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [isSellModalOpen, setSellModalOpen] = useState(false);
  const [isDiscountModalOpen, setDiscountModalOpen] = useState(false);
  const { toast } = useToast();

  const handleSellItem = (item: StoreItem) => {
    setSelectedItem(item);
    setSellModalOpen(true);
  };

  const handleAddDiscount = (item: StoreItem) => {
    setSelectedItem(item);
    setDiscountModalOpen(true);
  };

  const handleRemoveItem = async (item: StoreItem) => {
    try {
      await dispatch(removeFromStore(item.sid)).unwrap();
      toast({
        title: "Item removed",
        description: `${item.product.name} has been removed from the store.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove item.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading active items...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-muted-foreground">No active items</p>
        <p className="text-sm text-muted-foreground mt-1">
          Move items from warehouse to store
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const statusClass = cn(getStatusBadgeColor(item.status));
                const isExpiring =
                  item.expire_date && new Date(item.expire_date);
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                const hasDiscount =
                  item.current_discounts && item.current_discounts.length > 0;
                const discountPercentage = hasDiscount
                  ? item.current_discounts[0].percentage
                  : 0;

                return (
                  <TableRow key={item.sid}>
                    <TableCell className="font-medium text-[#000]">
                      {item.product.name}
                    </TableCell>
                    <TableCell className="text-[#000]">
                      {item.product.category_sid
                        ? item.product.category_sid
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-[#000]">
                      <Badge className={statusClass}>
                        {getStatusDisplayName(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#000]">{item.quantity}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-[#000]">
                        {hasDiscount && (
                          <span className="line-through  mr-2 ">
                            {formatCurrency(item.price)}
                          </span>
                        )}
                        <span>
                          {hasDiscount
                            ? formatCurrency(
                                item.price * (1 - discountPercentage / 100)
                              )
                            : formatCurrency(item.price)}
                        </span>
                        {hasDiscount && (
                          <span className="ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs bg-green-100 text-green-800">
                            {discountPercentage}% off
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-[#000]">
                        {item.expire_date
                          ? formatDate(item.expire_date)
                          : "N/A"}
                        {isExpiring && (
                          <AlertCircle className="ml-2 h-4 w-4 text-amber-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-brand-purple hover:bg-brand-purple/90"
                          onClick={() => handleSellItem(item)}
                        >
                          <ShoppingCart size={16} className="mr-1" />
                          Sell
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500 text-green-600 hover:bg-green-50"
                          onClick={() => handleAddDiscount(item)}
                        >
                          <PercentIcon size={16} className="mr-1" />
                          Discount
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleRemoveItem(item)}
                        >
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedItem && (
        <>
          <SellItemModal
            item={selectedItem}
            open={isSellModalOpen}
            onClose={() => setSellModalOpen(false)}
          />
          <DiscountModal
            item={selectedItem}
            open={isDiscountModalOpen}
            onClose={() => setDiscountModalOpen(false)}
          />
        </>
      )}
    </>
  );
};

export default ActiveItemsTable;
