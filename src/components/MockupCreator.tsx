import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const MockupCreator = () => {
  const [mockupImage, setMockupImage] = useState<string>("");
  const [logoImage, setLogoImage] = useState<string>("");
  const [scenarioIdea, setScenarioIdea] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string>("");
  const { toast } = useToast();

  const handleImageUpload = (file: File, type: 'mockup' | 'logo') => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'mockup') {
        setMockupImage(base64);
      } else {
        setLogoImage(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!mockupImage || !logoImage) {
      toast({
        title: "Imagens necessárias",
        description: "Por favor, faça upload do mockup e do logo.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResultImage("");

    try {
      const { data, error } = await supabase.functions.invoke('create-mockup', {
        body: { mockupBase64: mockupImage, logoBase64: logoImage, scenarioIdea: scenarioIdea.trim() || undefined },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setResultImage(data.resultImage);
      toast({
        title: "Mockup criado com sucesso!",
        description: "Seu mockup personalizado está pronto.",
      });
    } catch (error) {
      console.error('Error creating mockup:', error);
      toast({
        title: "Erro ao criar mockup",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Upload Section */}
      <div className="space-y-6">
        <Card className="p-6 space-y-6">
          <div>
            <Label htmlFor="mockup-upload" className="text-lg font-semibold mb-3 block">
              1. Upload do Mockup
            </Label>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
              <input
                id="mockup-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'mockup')}
              />
              <label htmlFor="mockup-upload" className="cursor-pointer">
                {mockupImage ? (
                  <img src={mockupImage} alt="Mockup" className="max-h-48 mx-auto rounded-lg" />
                ) : (
                  <>
                    <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">Clique para fazer upload do mockup</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div>
            <Label htmlFor="logo-upload" className="text-lg font-semibold mb-3 block">
              2. Upload do Logo
            </Label>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')}
              />
              <label htmlFor="logo-upload" className="cursor-pointer">
                {logoImage ? (
                  <img src={logoImage} alt="Logo" className="max-h-48 mx-auto rounded-lg" />
                ) : (
                  <>
                    <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">Clique para fazer upload do logo</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div>
            <Label htmlFor="scenario-input" className="text-lg font-semibold mb-3 block">
              3. Ideia de Cenário (Opcional)
            </Label>
            <Textarea
              id="scenario-input"
              placeholder="Ex: ambiente moderno e minimalista, fundo com gradiente suave, iluminação natural..."
              value={scenarioIdea}
              onChange={(e) => setScenarioIdea(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Descreva o cenário ou ambiente que deseja para seu mockup
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !mockupImage || !logoImage}
            className="w-full h-12"
            size="lg"
          >
            {isLoading ? (
              <>
                <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                Criando mockup...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Criar Mockup Personalizado
              </>
            )}
          </Button>
        </Card>
      </div>

      {/* Result Section */}
      <div>
        {resultImage ? (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Resultado</h3>
            <img 
              src={resultImage} 
              alt="Mockup final" 
              className="w-full rounded-lg shadow-lg"
            />
            <Button
              onClick={() => {
                const link = document.createElement('a');
                link.href = resultImage;
                link.download = 'mockup-personalizado.png';
                link.click();
              }}
              className="w-full mt-4"
              variant="outline"
            >
              Baixar Mockup
            </Button>
          </Card>
        ) : (
          <Card className="p-12 text-center border-dashed">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Mockup Personalizado</h3>
            <p className="text-muted-foreground">
              Faça upload das imagens e clique em "Criar Mockup" para começar
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
