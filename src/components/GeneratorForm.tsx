import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BrandUploader } from "./BrandUploader";
import { Sparkles } from "lucide-react";

interface GeneratorFormProps {
  onGenerate: (targetAudience: string, logo: string, priceRange: string) => void;
  isLoading: boolean;
}

export const GeneratorForm = ({ onGenerate, isLoading }: GeneratorFormProps) => {
  const [targetAudience, setTargetAudience] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<string>("20-50");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAudience.trim()) {
      return;
    }
    onGenerate(targetAudience, logo || '', priceRange);
  };

  const isFormValid = targetAudience.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <label htmlFor="audience" className="block text-sm font-medium text-foreground">
          Público-Alvo
        </label>
        <Textarea
          id="audience"
          placeholder="Ex: Executivos de tecnologia, Estudantes universitários, Profissionais de marketing..."
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          className="min-h-[100px] resize-none"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Descreva o público-alvo para receber sugestões personalizadas
        </p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="price-range" className="block text-sm font-medium text-foreground">
          Faixa de Preço Estimada
        </Label>
        <Select value={priceRange} onValueChange={setPriceRange} disabled={isLoading}>
          <SelectTrigger id="price-range">
            <SelectValue placeholder="Selecione a faixa de preço" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-5">R$ 0 - 5</SelectItem>
            <SelectItem value="5-10">R$ 5 - 10</SelectItem>
            <SelectItem value="10-20">R$ 10 - 20</SelectItem>
            <SelectItem value="20-50">R$ 20 - 50</SelectItem>
            <SelectItem value="50-100">R$ 50 - 100</SelectItem>
            <SelectItem value="100+">R$ 100+</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Escolha a faixa de preço para receber sugestões adequadas ao seu orçamento
        </p>
      </div>

      <BrandUploader onLogoChange={setLogo} />

      <Button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-accent to-accent hover:opacity-90 transition-all duration-200 shadow-lg"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            Gerando brinde criativo...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Gerar Brinde Personalizado
          </>
        )}
      </Button>
    </form>
  );
};
