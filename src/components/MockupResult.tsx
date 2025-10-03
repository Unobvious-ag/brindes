import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface MockupResultProps {
  productName: string;
  description: string;
  price: string;
  mockupImage: string;
  referenceUrls?: string[];
}

export const MockupResult = ({
  productName,
  description,
  price,
  mockupImage,
  referenceUrls,
}: MockupResultProps) => {
  return (
    <Card className="overflow-hidden shadow-xl border-0 bg-card">
      <div className="aspect-square w-full bg-gradient-to-br from-muted to-background p-8 flex items-center justify-center">
        <img
          src={mockupImage}
          alt={productName}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-2xl font-bold text-foreground">{productName}</h3>
          <Badge className="text-lg font-bold bg-accent text-accent-foreground px-4 py-1">
            {price}
          </Badge>
        </div>
        <p className="text-base text-muted-foreground leading-relaxed">{description}</p>
        
        {referenceUrls && referenceUrls.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground mb-2">Fornecedores e Referências:</h4>
            <div className="space-y-1">
              {referenceUrls.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  {new URL(url).hostname}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
