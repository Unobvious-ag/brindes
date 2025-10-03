import { Upload, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface BrandUploaderProps {
  onLogoChange: (logoBase64: string | null) => void;
}

export const BrandUploader = ({ onLogoChange }: BrandUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem (JPG, PNG)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('O arquivo deve ter no máximo 5MB');
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onLogoChange(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName("");
    onLogoChange(null);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        Logomarca da Empresa <span className="text-muted-foreground font-normal">(Opcional)</span>
      </label>
      
      {!preview ? (
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer bg-card hover:bg-muted/50 transition-all duration-200">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Clique para enviar</span> ou arraste aqui
            </p>
            <p className="text-xs text-muted-foreground">PNG ou JPG (máx. 5MB)</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <div className="relative">
          <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
            <img
              src={preview}
              alt="Logo preview"
              className="w-20 h-20 object-contain rounded-lg bg-white"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
              <p className="text-xs text-muted-foreground">Logo carregada</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
