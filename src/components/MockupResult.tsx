import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MockupResultProps {
  productName: string;
  description: string;
  price: string;
  mockupImage: string;
}

export const MockupResult = ({
  productName,
  description,
  price,
  mockupImage,
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
      </div>
    </Card>
  );
};
