import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isAfter, isBefore } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return format(d, "MMM dd, yyyy");
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return format(d, "MMM dd, yyyy HH:mm");
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatTimeAgo(date: string | Date): string {
  const d = new Date(date);
  return formatDistanceToNow(d, { addSuffix: true });
}

export function isExpired(date: string | Date): boolean {
  const d = new Date(date);
  const today = new Date();
  return isBefore(d, today);
}

export function isExpiringSoon(date: string | Date): boolean {
  const d = new Date(date);
  const today = new Date();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(today.getDate() + 7);
  
  return isAfter(d, today) && isBefore(d, sevenDaysLater);
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function calculateDiscountPrice(originalPrice: number, discountPercentage: number): number {
  return originalPrice * (1 - discountPercentage / 100);
}

export function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || '';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

export function getStatusBadgeColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'expired':
      return 'bg-red-100 text-red-800';
    case 'removed':
      return 'bg-gray-100 text-gray-800';
    case 'in_stock':
      return 'bg-blue-100 text-blue-800';
    case 'moved':
      return 'bg-violet-100 text-violet-800';
    case 'discarded':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusDisplayName(status: string): string {
  switch (status.toLowerCase()) {
    case 'in_stock':
      return 'In Stock';
    case 'moved':
      return 'Moved to Store';
    case 'discarded':
      return 'Discarded';
    case 'active':
      return 'Active';
    case 'expired':
      return 'Expired';
    case 'removed':
      return 'Removed';
    default:
      return status;
  }
}

export function getInitials(email: string): string {
  if (!email) return '';
  
  // Extract name part from email (before @)
  const namePart = email.split('@')[0];
  
  // If name has . or _ separating parts, use first letter of each part
  if (namePart.includes('.') || namePart.includes('_')) {
    const separator = namePart.includes('.') ? '.' : '_';
    const parts = namePart.split(separator);
    return parts.map(part => part[0]?.toUpperCase() || '').join('');
  }
  
  // Otherwise, use first two letters
  return namePart.slice(0, 2).toUpperCase();
}