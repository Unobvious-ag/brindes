import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { targetAudience, logoBase64 } = await req.json();
    console.log('Generating 5 promo items for target audience:', targetAudience);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Generate 5 different promo items with delays between requests
    const promoItems = [];
    let successCount = 0;
    let rateLimited = false;

    for (let i = 0; i < 5; i++) {
      console.log(`Generating promo item ${i + 1}/5...`);

      // Add delay between requests to avoid rate limiting (except for first request)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      }

      try {
        // Step 1: Use Gemini Flash to analyze audience and suggest creative promo item
        const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: `Você é um especialista em brindes corporativos criativos do mercado brasileiro. 
                Sugira um brinde ÚNICO e FORA DO CONVENCIONAL (nada de canetas, cadernos ou chaveiros comuns).
                Pense em: gadgets tecnológicos inusitados, itens sustentáveis inovadores, acessórios lifestyle diferenciados.
                IMPORTANTE: Cada sugestão deve ser DIFERENTE das anteriores. Seja criativo e diverso.
                Responda SEMPRE em português do Brasil.`
              },
              {
                role: 'user',
                content: `Público-alvo: ${targetAudience}

Esta é a sugestão número ${i + 1} de 5. Sugira um brinde DIFERENTE dos anteriores, criativo e fora do convencional com:
1. Nome do produto em português
2. Descrição breve (2-3 linhas) explicando por que é perfeito para esse público
3. Estimativa de preço unitário em Reais (entre R$20 e R$100)
4. Descrição visual detalhada do produto para gerar um mockup fotorrealista

Formato da resposta:
PRODUTO: [nome]
DESCRIÇÃO: [descrição]
PREÇO: R$ [valor]
VISUAL: [descrição visual detalhada para mockup, incluindo formato, material, cor, textura]`
              }
            ],
          }),
        });

        if (!analysisResponse.ok) {
          const errorText = await analysisResponse.text();
          console.error(`Analysis API error for item ${i + 1}:`, analysisResponse.status, errorText);
          
          if (analysisResponse.status === 429) {
            rateLimited = true;
            console.log('Rate limited - stopping generation');
            break; // Stop trying if we hit rate limit
          }
          continue;
        }

        const analysisData = await analysisResponse.json();
        const suggestion = analysisData.choices[0].message.content;
        console.log(`AI Suggestion ${i + 1}:`, suggestion);

        // Parse the suggestion
        const productMatch = suggestion.match(/PRODUTO:\s*(.+)/);
        const descriptionMatch = suggestion.match(/DESCRIÇÃO:\s*(.+?)(?=PREÇO:)/s);
        const priceMatch = suggestion.match(/PREÇO:\s*R?\$?\s*(\d+(?:,\d{2})?)/);
        const visualMatch = suggestion.match(/VISUAL:\s*(.+)/s);

        const productName = productMatch ? productMatch[1].trim() : `Brinde Personalizado ${i + 1}`;
        const description = descriptionMatch ? descriptionMatch[1].trim() : suggestion.substring(0, 200);
        const price = priceMatch ? `R$ ${priceMatch[1]}` : 'R$ 50,00';
        const visualDescription = visualMatch ? visualMatch[1].trim() : suggestion;

        // Add another small delay before image generation
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 2: Generate realistic mockup with logo using Gemini Image Preview
        console.log(`Generating mockup ${i + 1}/5 with Gemini Image Preview...`);
        
        const mockupPrompt = `Ultra high resolution professional product photography. ${visualDescription}

CRITICAL: The logo must be perfectly applied on the product surface, following these requirements:
- Logo clearly visible and centered on the main surface
- Logo proportionally sized (neither too small nor too large)
- Logo follows the product's perspective and curvature
- Realistic lighting and shadows on the logo matching the product
- Professional product placement with the logo as the focal point

Product specifications:
- Professional studio lighting (soft box lighting, white/neutral background)
- High detail and sharp focus on the logo area
- Realistic materials and textures
- Brazilian market aesthetic
- Modern and premium appearance

The logo to be applied is: 
[LOGO WILL BE PROVIDED AS REFERENCE IMAGE]

Create a photorealistic mockup showing the product with this exact logo professionally applied.`;

        const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image-preview',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: mockupPrompt
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: logoBase64
                    }
                  }
                ]
              }
            ],
            modalities: ['image', 'text']
          }),
        });

        if (!imageResponse.ok) {
          const errorText = await imageResponse.text();
          console.error(`Image generation API error for item ${i + 1}:`, imageResponse.status, errorText);
          
          if (imageResponse.status === 429) {
            rateLimited = true;
            console.log('Rate limited on image generation - stopping');
            break;
          }
          continue;
        }

        const imageData = await imageResponse.json();
        const mockupImage = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!mockupImage) {
          console.error(`No image generated for item ${i + 1}`);
          continue;
        }

        console.log(`Successfully generated mockup ${i + 1}/5`);

        promoItems.push({
          productName,
          description,
          price,
          mockupImage,
          fullSuggestion: suggestion
        });

        successCount++;
      } catch (itemError) {
        console.error(`Error generating item ${i + 1}:`, itemError);
        continue;
      }
    }

    console.log(`Successfully generated ${successCount} promo items`);

    if (promoItems.length === 0) {
      const errorMessage = rateLimited 
        ? 'Limite de requisições atingido. Por favor, aguarde alguns instantes e tente novamente.'
        : 'Falha ao gerar brindes. Por favor, tente novamente.';
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        items: promoItems,
        message: promoItems.length < 5 ? `Gerados ${promoItems.length} de 5 brindes devido a limites de requisição` : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-promo-item function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao gerar brindes' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
