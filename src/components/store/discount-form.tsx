'use client';

import { useState } from 'react';
import { StoreItem } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useStoreItemsStore } from '@/store/store-items-store';
import { formatCurrency, calculateDiscountPrice } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays } from 'date-fns';

interface DiscountModalProps {
  item: StoreItem;
  open: boolean;
  onClose: () => void;
}

const DiscountModal = ({ item, open, onClose }: DiscountModalProps) => {
  const [percentage, setPercentage] = useState(10);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 7));
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { createDiscount } = useStoreItemsStore();
  const { toast } = useToast();
  
  const originalPrice = item.price;
  const discountedPrice = calculateDiscountPrice(originalPrice, percentage);
  
  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 0) {
      setPercentage(0);
    } else if (value > 100) {
      setPercentage(100);
    } else {
      setPercentage(value);
    }
  };
  
  const handleSubmit = async () => {
    if (percentage <= 0 || percentage > 100) {
      toast({
        title: 'Invalid discount',
        description: 'Please enter a discount percentage between 1 and 100',
        variant: 'destructive',
      });
      return;
    }
    
    if (endDate < startDate) {
      toast({
        title: 'Invalid date range',
        description: 'End date must be after start date',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await createDiscount(item.sid, percentage, startDate, endDate);
      toast({
        title: 'Discount created',
        description: `${percentage}% discount added to ${item.product.name}`,
      });
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create discount',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Discount</DialogTitle>
          <DialogDescription>
            Create a discount for {item.product.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Product</Label>
            <div className="text-sm font-medium">{item.product.name}</div>
          </div>
          
          <div className="space-y-2">
            <Label>Original Price</Label>
            <div className="text-sm font-medium">{formatCurrency(originalPrice)}</div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="percentage">Discount Percentage</Label>
            <div className="flex items-center">
              <Input
                id="percentage"
                type="number"
                value={percentage}
                onChange={handlePercentageChange}
                min={0}
                max={100}
                className="w-20 mr-2"
              />
              <span>%</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Discounted Price</Label>
            <div className="text-lg font-bold text-primary">{formatCurrency(discountedPrice)}</div>
            <div className="text-xs text-muted-foreground">
              Customer saves {formatCurrency(originalPrice - discountedPrice)} per unit
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(startDate, "PP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(date);
                        setIsStartDateOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(endDate, "PP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      if (date) {
                        setEndDate(date);
                        setIsEndDateOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
            {isLoading ? 'Creating...' : 'Create Discount'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DiscountModal;