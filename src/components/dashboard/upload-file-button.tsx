'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Loader2 } from 'lucide-react';
import { useWarehouseStore } from '@/store/warehouse-store';
import { useDashboardStore } from '@/store/dashboard-store';
const UploadFileButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useWarehouseStore();
  const { fetchStats } = useDashboardStore();
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a CSV or Excel file',
          variant: 'destructive',
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await uploadFile(file);
      toast({
        title: 'Upload successful',
        description: `${file.name} has been uploaded successfully`,
      });
      setIsOpen(false);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh dashboard stats
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload file',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-brand-purple hover:bg-brand-purple/90 ">
          <Upload className="mr-2 h-4 w-4 " />
          Upload Inventory
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className='text-black'>Upload Inventory</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file containing your inventory data.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file" className='text-black'>File</Label>
            <Input
              id="file"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className='text-gray-500'
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            />
            <p className="text-xs text-muted-foreground">
              Accepts CSV and Excel files
            </p>
          </div>
          
          {file && (
            <div className="text-sm text-gray-500">
              Selected file: <span className="font-medium ">{file.name}</span> ({(file.size / 1024).toFixed(2)} KB)
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isUploading}
            className='border-gray-400 text-gray-400'
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-brand-purple hover:bg-brand-purple/90"
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadFileButton;