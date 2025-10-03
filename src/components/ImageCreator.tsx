import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Download, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ImageCreator = () => {
  const [prompt, setPrompt] = useState("");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setReferenceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma descrição para gerar a imagem.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-ai-image", {
        body: {
          prompt: prompt.trim(),
          referenceImage: referenceImage || undefined,
        },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast({
          title: "Sucesso",
          description: "Imagem gerada com sucesso!",
        });
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar a imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `imagem-gerada-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    setReferenceImage(null);
    setPrompt("");
    setGeneratedImage(null);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Input Section */}
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Criar Imagem com IA</h2>
          <p className="text-muted-foreground">
            Descreva a imagem que você deseja gerar ou editar
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="prompt">Descrição da Imagem</Label>
            <Textarea
              id="prompt"
              placeholder="Ex: Um pôr do sol sobre as montanhas, estilo aquarela..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="reference-image">
              Imagem de Referência <span className="text-muted-foreground font-normal">(Opcional)</span>
            </Label>
            <div className="mt-2 space-y-3">
              <div className="flex items-center gap-3">
                <Input
                  id="reference-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1"
                />
                {referenceImage && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setReferenceImage(null)}
                  >
                    Remover
                  </Button>
                )}
              </div>
              {referenceImage && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                  <img
                    src={referenceImage}
                    alt="Imagem de referência"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                "Gerar Imagem"
              )}
            </Button>
            {(prompt || referenceImage || generatedImage) && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={isLoading}
              >
                Limpar
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Result Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Resultado</h3>
            <p className="text-sm text-muted-foreground">
              Sua imagem gerada aparecerá aqui
            </p>
          </div>

          {generatedImage ? (
            <div className="space-y-4">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden border bg-muted">
                <img
                  src={generatedImage}
                  alt="Imagem gerada"
                  className="w-full h-full object-contain"
                />
              </div>
              <Button onClick={handleDownload} className="w-full" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          ) : (
            <div className="w-full aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma imagem gerada ainda</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
