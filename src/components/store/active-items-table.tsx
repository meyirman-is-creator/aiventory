'use client';

import { StoreItem } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, getStatusDisplayName, getStatusBadgeColor } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useStoreItemsStore } from '@/store/store-items-store';
import { cn } from '@/lib/utils';

interface ExpiredItemsTableProps {
  items: StoreItem[];
  isLoading: boolean;
}

const ExpiredItemsTable = ({ items, isLoading }: ExpiredItemsTableProps) => {
  const { removeFromStore } = useStoreItemsStore();
  const { toast } = useToast();
  
  const handleRemoveItem = async (item: StoreItem) => {
    try {
      await removeFromStore(item.sid);
      toast({
        title: 'Item removed',
        description: `${item.product.name} has been removed from the store.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove item.',
        variant: 'destructive',
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading expired items...</p>
      </div>
    );
  }
  
  if (items.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-muted-foreground">No expired items</p>
      </div>
    );
  }
  
  return (
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
              <TableHead>Expired At</TableHead>
              <TableHead>Lost Value</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const statusClass = cn(getStatusBadgeColor(item.status));
              const lostValue = item.price * item.quantity;
              
              return (
                <TableRow key={item.sid}>
                  <TableCell className="font-medium">{item.product.name}</TableCell>
                  <TableCell>
                    {item.product.category_sid ? item.product.category_sid : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusClass}>
                      {getStatusDisplayName(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.price)}</TableCell>
                  <TableCell>
                    {item.expire_date ? formatDate(item.expire_date) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-destructive">
                    {formatCurrency(lostValue)}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveItem(item)}
                    >
                      <Trash2 size={16} className="mr-1" />
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ExpiredItemsTable;