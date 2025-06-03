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
import { Upload, Loader2, FileSpreadsheet, Info } from "lucide-react";
import { useWarehouseStore } from "@/store/warehouse-store";
import { useDashboardStore } from "@/store/dashboard-store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

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

  const requiredColumns = [
    { name: "barcode", description: "Штрих-код товара", example: "4870001157913" },
    { name: "product_name", description: "Название товара", example: "ASU негазированная 0.5л" },
    { name: "category", description: "Категория товара", example: "Напитки" },
    { name: "batch_code", description: "Код партии", example: "ASU-001" },
    { name: "quantity", description: "Количество товаров", example: "50" },
    { name: "price", description: "Цена за единицу", example: "150" },
    { name: "currency", description: "Валюта", example: "kzt" },
    { name: "expire_date", description: "Срок годности", example: "2025-06-15" },
    { name: "received_at", description: "Дата получения", example: "2025-04-10" },
    { name: "storage_duration", description: "Срок хранения (число)", example: "180" },
    { name: "storage_duration_type", description: "Тип срока хранения", example: "day" },
    { name: "unit", description: "Единица измерения", example: "шт" }
  ];

  const optionalColumns = [
    { name: "status", description: "Статус товара", example: "in_stock" },
    { name: "suggested_price", description: "Рекомендуемая цена", example: "135" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#6322FE] hover:bg-[#5719d8] text-[#ffffff] text-xs sm:text-sm px-3 sm:px-4 py-2 h-8 sm:h-10">
          <Upload className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Загрузить инвентарь</span>
          <span className="sm:hidden">Загрузить</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] md:max-w-3xl lg:max-w-4xl max-h-[calc(100vh-2rem)] sm:max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-[#1f2937] text-base sm:text-lg">Загрузка инвентаря</DialogTitle>
          <DialogDescription className="text-[#6b7280] text-xs sm:text-sm">
            Загрузите файл CSV или Excel, содержащий данные вашего инвентаря.
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1 px-1">
          <div className="space-y-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="file" className="text-[#1f2937] text-xs sm:text-sm font-medium">
                Файл инвентаря
              </Label>
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="text-[#4b5563] border-[#e5e7eb] text-xs sm:text-sm h-9 sm:h-10 file:text-xs file:sm:text-sm"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              />
              <p className="text-[10px] sm:text-xs text-[#6b7280]">
                Принимаются файлы CSV и Excel
              </p>
            </div>

            {file && (
              <div className="flex items-center space-x-2 p-2.5 sm:p-3 bg-[#f3f4f6] rounded-lg">
                <FileSpreadsheet className="h-4 w-4 sm:h-5 sm:w-5 text-[#6322FE] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-[#1f2937] truncate">{file.name}</p>
                  <p className="text-[10px] sm:text-xs text-[#6b7280]">{(file.size / 1024).toFixed(2)} КБ</p>
                </div>
              </div>
            )}

            <Card className="border-[#e5e7eb]">
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-start space-x-2">
                  <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#6322FE] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-xs sm:text-sm font-medium text-[#1f2937]">Формат данных</h4>
                    <p className="text-[10px] sm:text-xs text-[#6b7280] mt-1">
                      Файл должен содержать следующие колонки для корректной загрузки:
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] sm:text-xs font-medium text-[#374151] mb-2">Обязательные колонки:</p>
                    <div className="overflow-x-auto -mx-2 px-2">
                      <Table className="text-[10px] sm:text-xs min-w-[450px]">
                        <TableHeader>
                          <TableRow className="border-b border-[#e5e7eb]">
                            <TableHead className="text-[#374151] font-medium px-2 py-1.5 w-[30%]">Колонка</TableHead>
                            <TableHead className="text-[#374151] font-medium px-2 py-1.5 w-[40%]">Описание</TableHead>
                            <TableHead className="text-[#374151] font-medium px-2 py-1.5 w-[30%]">Пример</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {requiredColumns.slice(0, 5).map((col) => (
                            <TableRow key={col.name} className="border-b border-[#f3f4f6]">
                              <TableCell className="font-mono text-[#1f2937] px-2 py-1.5 text-[9px] sm:text-[10px]">{col.name}</TableCell>
                              <TableCell className="text-[#4b5563] px-2 py-1.5 text-[9px] sm:text-[10px]">{col.description}</TableCell>
                              <TableCell className="font-mono text-[#6b7280] px-2 py-1.5 text-[9px] sm:text-[10px]">{col.example}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <details className="mt-2">
                      <summary className="text-[10px] sm:text-xs text-[#6322FE] cursor-pointer hover:text-[#5719d8] select-none">
                        Показать все обязательные колонки ({requiredColumns.length})
                      </summary>
                      <div className="mt-2 overflow-x-auto -mx-2 px-2">
                        <Table className="text-[10px] sm:text-xs min-w-[450px]">
                          <TableBody>
                            {requiredColumns.slice(5).map((col) => (
                              <TableRow key={col.name} className="border-b border-[#f3f4f6]">
                                <TableCell className="font-mono text-[#1f2937] px-2 py-1.5 text-[9px] sm:text-[10px] w-[30%]">{col.name}</TableCell>
                                <TableCell className="text-[#4b5563] px-2 py-1.5 text-[9px] sm:text-[10px] w-[40%]">{col.description}</TableCell>
                                <TableCell className="font-mono text-[#6b7280] px-2 py-1.5 text-[9px] sm:text-[10px] w-[30%]">{col.example}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </details>
                  </div>

                  <div>
                    <p className="text-[11px] sm:text-xs font-medium text-[#374151] mb-2">Опциональные колонки:</p>
                    <div className="overflow-x-auto -mx-2 px-2">
                      <Table className="text-[10px] sm:text-xs min-w-[450px]">
                        <TableBody>
                          {optionalColumns.map((col) => (
                            <TableRow key={col.name} className="border-b border-[#f3f4f6]">
                              <TableCell className="font-mono text-[#1f2937] px-2 py-1.5 text-[9px] sm:text-[10px] w-[30%]">{col.name}</TableCell>
                              <TableCell className="text-[#4b5563] px-2 py-1.5 text-[9px] sm:text-[10px] w-[40%]">{col.description}</TableCell>
                              <TableCell className="font-mono text-[#6b7280] px-2 py-1.5 text-[9px] sm:text-[10px] w-[30%]">{col.example}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                <div className="bg-[#fef3c7] border border-[#fcd34d] rounded-lg p-2.5 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-[#92400e] font-medium mb-1">Важно:</p>
                  <ul className="text-[9px] sm:text-[10px] text-[#92400e] space-y-0.5 list-disc list-inside">
                    <li>При загрузке товаров с одинаковым штрих-кодом создаются отдельные партии</li>
                    <li>Старые партии автоматически помечаются для срочной продажи</li>
                    <li>Система отслеживает каждую партию независимо для соблюдения принципа FIFO</li>
                    <li>Формат даты должен быть YYYY-MM-DD (например: 2025-06-15)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isUploading}
            className="w-full sm:w-auto border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb] text-xs sm:text-sm h-9 sm:h-10"
          >
            Отмена
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto bg-[#6322FE] hover:bg-[#5719d8] text-[#ffffff] text-xs sm:text-sm h-9 sm:h-10"
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
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