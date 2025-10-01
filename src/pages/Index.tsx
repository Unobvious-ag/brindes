import { useState } from "react";
import { GeneratorForm } from "@/components/GeneratorForm";
import { MockupResult } from "@/components/MockupResult";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Gift } from "lucide-react";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    productName: string;
    description: string;
    price: string;
    mockupImage: string;
  } | null>(null);
  const { toast } = useToast();

  const handleGenerate = async (targetAudience: string, logoBase64: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-promo-item', {
        body: { targetAudience, logoBase64 },
      });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult({
        productName: data.productName,
        description: data.description,
        price: data.price,
        mockupImage: data.mockupImage,
      });

      toast({
        title: "Brinde gerado com sucesso!",
        description: "Seu brinde personalizado está pronto.",
      });
    } catch (error) {
      console.error('Error generating promo item:', error);
      toast({
        title: "Erro ao gerar brinde",
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-accent rounded-2xl">
              <Gift className="w-8 h-8 text-accent-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Gerador de Brindes Criativos
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transforme sua marca em brindes únicos e memoráveis com tecnologia de IA
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Form Section */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg">
              <GeneratorForm onGenerate={handleGenerate} isLoading={isLoading} />
            </div>
          </div>

          {/* Result Section */}
          <div>
            {result ? (
              <div className="animate-in fade-in duration-500">
                <MockupResult {...result} />
              </div>
            ) : (
              <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center">
                <div className="max-w-sm mx-auto space-y-4">
                  <div className="w-20 h-20 bg-muted rounded-full mx-auto flex items-center justify-center">
                    <Gift className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Aguardando geração
                  </h3>
                  <p className="text-muted-foreground">
                    Preencha o formulário ao lado para gerar seu brinde personalizado
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
