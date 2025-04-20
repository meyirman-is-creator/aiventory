"use client";

import { useState } from "react";
import { WarehouseItem } from "@/lib/types";
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
  formatDate,
  getStatusDisplayName,
  getStatusBadgeColor,
} from "@/lib/utils";
import { ExternalLink, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import MoveToStoreModal from "@/components/warehouse/move-to-store-modal";

interface ExpiringItemsTableProps {
  items: WarehouseItem[];
  isLoading: boolean;
}

const ExpiringItemsTable = ({ items, isLoading }: ExpiringItemsTableProps) => {
  const [selectedItem, setSelectedItem] = useState<WarehouseItem | null>(null);
  const [isMoveModalOpen, setMoveModalOpen] = useState(false);

  const handleMoveToStore = (item: WarehouseItem) => {
    setSelectedItem(item);
    setMoveModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading expiring items...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-muted-foreground">No expiring items</p>
        <p className="text-sm text-muted-foreground mt-1">
          All your warehouse items have good expiration dates
        </p>
      </div>
    );
  }

  // Sort items by expiration date - soonest first
  const sortedItems = [...items].sort((a, b) => {
    if (!a.expire_date) return 1;
    if (!b.expire_date) return -1;
    return (
      new Date(a.expire_date).getTime() - new Date(b.expire_date).getTime()
    );
  });

  return (
    <>
      <div className="rounded-md border border-amber-200 overflow-hidden bg-amber-50/50">
        <div className="p-4 bg-amber-100 border-b border-amber-200">
          <div className="flex items-center text-amber-800">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p className="text-sm font-medium">
              These items will expire within the next 7 days. Consider moving
              them to the store and applying discounts.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Batch Code</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Expires In</TableHead>
                <TableHead>Received At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.map((item) => {
                const statusClass = cn(getStatusBadgeColor(item.status));
                const today = new Date();
                const expireDate = item.expire_date
                  ? new Date(item.expire_date)
                  : null;

                // Calculate days until expiration
                const daysUntilExpiration = expireDate
                  ? Math.ceil(
                      (expireDate.getTime() - today.getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : null;

                // Determine urgency class
                let urgencyClass = "";
                if (daysUntilExpiration !== null) {
                  if (daysUntilExpiration <= 0) {
                    urgencyClass = "text-red-500 font-bold";
                  } else if (daysUntilExpiration <= 3) {
                    urgencyClass = "text-red-600";
                  } else if (daysUntilExpiration <= 5) {
                    urgencyClass = "text-amber-600";
                  } else {
                    urgencyClass = "text-amber-500";
                  }
                }

                return (
                  <TableRow key={item.sid}>
                    <TableCell className="font-medium">
                      {item.product.name}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusClass}>
                        {getStatusDisplayName(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.batch_code || "N/A"}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      {daysUntilExpiration !== null ? (
                        <span className={urgencyClass}>
                          {daysUntilExpiration <= 0
                            ? "Expired"
                            : daysUntilExpiration === 1
                            ? "1 day"
                            : `${daysUntilExpiration} days`}
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>{formatDate(item.received_at)}</TableCell>
                    <TableCell>
                      {item.status === "in_stock" && item.quantity > 0 ? (
                        <Button
                          size="sm"
                          className="bg-brand-purple hover:bg-brand-purple/90"
                          onClick={() => handleMoveToStore(item)}
                        >
                          <ExternalLink size={16} className="mr-1" />
                          Move to Store
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          {item.status === "moved" ? "Moved" : "Unavailable"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedItem && (
        <MoveToStoreModal
          item={selectedItem}
          open={isMoveModalOpen}
          onClose={() => setMoveModalOpen(false)}
        />
      )}
    </>
  );
};

export default ExpiringItemsTable;
