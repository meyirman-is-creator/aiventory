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
  const { uploadFile, isUploading, fetchItems, fetchExpiringItems } = useWarehouseStore();
  const { fetchStats } = useDashboardStore();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];

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

      await Promise.all([
        fetchStats(),
        fetchItems(),
        fetchExpiringItems()
      ]);

      window.location.reload();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Не удалось загрузить файл";
      toast({
        title: "Ошибка загрузки",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#6322FE] hover:bg-[#5719d8] text-[#ffffff] w-full sm:w-auto">
          <Upload className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Загрузить инвентарь</span>
          <span className="sm:hidden">Загрузить</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90%] sm:w-[425px] bg-[#ffffff]">
        <DialogHeader>
          <DialogTitle className="text-[#1f2937]">Загрузка инвентаря</DialogTitle>
          <DialogDescription className="text-[#6b7280]">
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
              className="text-[#4b5563] border-[#e5e7eb]"
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
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isUploading}
            className="w-full sm:w-auto border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb]"
          >
            Отмена
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto bg-[#6322FE] hover:bg-[#5719d8] text-[#ffffff]"
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