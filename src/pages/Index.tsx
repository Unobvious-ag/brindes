import { useState } from "react";
import { GeneratorForm } from "@/components/GeneratorForm";
import { MockupResult } from "@/components/MockupResult";
import { MockupCreator } from "@/components/MockupCreator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import unbvsLogo from "@/assets/unbvs-logo.jpg";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Array<{
    productName: string;
    description: string;
    price: string;
    mockupImage: string;
    referenceUrls?: string[];
  }>>([]);
  const { toast } = useToast();

  const handleGenerate = async (targetAudience: string, logoBase64: string, priceRange: string) => {
    setIsLoading(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-promo-item', {
        body: { targetAudience, logoBase64, priceRange },
      });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.items.length === 0) {
        setResults([]);
        const message = data.message || 'Limite de requisições atingido. Tente novamente em alguns instantes.';
        toast({
          title: message,
          description: 'Nenhum brinde foi retornado desta vez.',
        });
        setIsLoading(false);
        return;
      }

      setResults(data.items);

      const message = data.message 
        ? data.message 
        : `${data.items.length} brindes gerados com sucesso!`;

      toast({
        title: message,
        description: "Seus brindes personalizados estão prontos.",
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
            <div className="p-3 bg-white rounded-2xl shadow-lg">
              <img src={unbvsLogo} alt="UNBVS Logo" className="w-32 h-auto" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Gerador de Brindes Criativos
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transforme sua marca em brindes únicos e memoráveis com tecnologia de IA
          </p>
        </header>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto mb-8 grid-cols-2">
            <TabsTrigger value="generate">Geração de Brindes</TabsTrigger>
            <TabsTrigger value="mockup">Criação de Mockups</TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Form Section */}
              <div className="lg:sticky lg:top-8">
                <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg">
                  <GeneratorForm onGenerate={handleGenerate} isLoading={isLoading} />
                </div>
              </div>

              {/* Result Section */}
              <div className="space-y-6">
                {results.length > 0 ? (
                  <>
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-foreground">
                        {results.length} Ideias de Brindes Personalizados
                      </h2>
                      <p className="text-muted-foreground mt-2">
                        Escolha a melhor opção para sua campanha
                      </p>
                    </div>
                    <div className="grid gap-6">
                      {results.map((result, index) => (
                        <div key={index} className="animate-in fade-in duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                          <MockupResult {...result} />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center">
                    <div className="max-w-sm mx-auto space-y-4">
                      <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center p-3 shadow-md">
                        <img src={unbvsLogo} alt="UNBVS Logo" className="w-full h-auto" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">
                        Aguardando geração
                      </h3>
                      <p className="text-muted-foreground">
                        Preencha o formulário ao lado para gerar 5 brindes personalizados
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mockup">
            <MockupCreator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
