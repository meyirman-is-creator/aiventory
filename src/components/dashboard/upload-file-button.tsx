"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Loader2 } from "lucide-react";
import { useWarehouseStore } from "@/store/warehouse-store";
import { useDashboardStore } from "@/store/dashboard-store";

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
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Неверный тип файла",
          description: "Пожалуйста, загрузите файл CSV или Excel",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Файл не выбран",
        description: "Пожалуйста, выберите файл для загрузки",
        variant: "destructive",
      });
      return;
    }

    try {
      await uploadFile(file);
      toast({
        title: "Загрузка успешна",
        description: `${file.name} успешно загружен`,
      });
      setIsOpen(false);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Refresh dashboard stats
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Ошибка загрузки",
        description: error.message || "Не удалось загрузить файл",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#6322FE] hover:bg-[#5719d8] text-[#ffffff]">
          <Upload className="mr-2 h-4 w-4" />
          Загрузить инвентарь
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#ffffff]">
        <DialogHeader>
          <DialogTitle className="text-[#1f2937]">Загрузка инвентаря</DialogTitle>
          <DialogDescription className="text-[#4b5563]">
            Загрузите файл CSV или Excel, содержащий данные вашего инвентаря.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file" className="text-[#1f2937]">
              Файл
            </Label>
            <Input
              id="file"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="text-[#4b5563] border-[#d1d5db]"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            />
            <p className="text-xs text-[#6b7280]">
              Принимаются файлы CSV и Excel
            </p>
          </div>

          {file && (
            <div className="text-sm text-[#4b5563]">
              Выбранный файл: <span className="font-medium">{file.name}</span>{" "}
              ({(file.size / 1024).toFixed(2)} КБ)
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isUploading}
            className="border-[#9ca3af] text-[#4b5563]"
          >
            Отмена
          </Button>
          <Button
            type="button"
            className="bg-[#6322FE] hover:bg-[#5719d8] text-[#ffffff]"
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Загрузка...
              </>
            ) : (
              "Загрузить"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadFileButton;