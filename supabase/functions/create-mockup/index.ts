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
    const { mockupBase64, logoBase64, scenarioIdea } = await req.json();
    console.log('Creating custom mockup with logo overlay...');
    if (scenarioIdea) {
      console.log('Scenario idea provided:', scenarioIdea);
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let prompt = `Você é um especialista em design de mockups profissionais.

TAREFA: Aplicar o logo fornecido de forma PERFEITA e REALISTA no mockup base.

ANÁLISE DE CORES E CONTRASTE (CRÍTICO):
1. SEMPRE analise as cores dominantes do mockup (fundo/superfície onde o logo será aplicado)
2. SEMPRE analise as cores do logo fornecido
3. SE houver baixo contraste (ex: logo preto em fundo preto, logo branco em fundo branco):
   - Ajuste APENAS as cores do logo para garantir visibilidade perfeita
   - Use cores contrastantes apropriadas (branco, cinza claro, ou outras cores que mantenham a elegância)
   - Mantenha a ESTRUTURA e FORMA do logo intactas
4. SE houver bom contraste natural:
   - Preserve PERFEITAMENTE todas as cores originais do logo
   - NÃO altere nenhuma cor da identidade visual
5. Priorize SEMPRE a legibilidade e profissionalismo do resultado final

REQUISITOS DE APLICAÇÃO:
1. O logo deve ser aplicado na superfície principal do produto de forma natural
2. O logo deve seguir a perspectiva e curvatura do mockup
3. Aplicar iluminação e sombras realistas no logo que correspondam ao mockup
4. O logo deve estar centralizado e com tamanho proporcional (nem muito grande, nem muito pequeno)
5. Manter a qualidade fotorrealista ultra alta
6. O resultado deve parecer uma foto profissional de produto real`;

    if (scenarioIdea) {
      prompt += `\n\nCENÁRIO PERSONALIZADO (APLICAR COM PRIORIDADE):
O usuário solicitou o seguinte cenário/ambiente para o mockup:
"${scenarioIdea}"

INSTRUÇÕES PARA O CENÁRIO:
- Aplique EXATAMENTE o cenário descrito pelo usuário
- Mantenha o logo perfeitamente integrado ao novo cenário
- O cenário deve complementar e valorizar o produto e o logo
- Mantenha o realismo fotográfico e a qualidade profissional
- Ajuste iluminação, cores de fundo e atmosfera conforme solicitado`;
    }

    prompt += `\n\nESPECIFICAÇÕES TÉCNICAS:
- Análise inteligente de contraste e ajuste automático quando necessário
- Iluminação profissional de estúdio
- Alta resolução e nitidez
- Textura e materiais realistas
- Perspectiva correta e natural
- Integração perfeita entre logo e mockup

Crie um mockup profissional e fotorrealista com o logo perfeitamente aplicado, garantindo contraste ideal e preservando a identidade da marca.`;

    console.log('Calling Gemini Image Preview API...');
    
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
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: mockupBase64
                }
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
      console.error('Image generation API error:', imageResponse.status, errorText);
      
      if (imageResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Limite de requisições atingido. Por favor, aguarde alguns instantes e tente novamente.' 
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (imageResponse.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'Pagamento necessário. Por favor, adicione créditos ao seu workspace Lovable AI.' 
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      throw new Error(`Image generation failed: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    const resultImage = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!resultImage) {
      throw new Error('No image generated');
    }

    console.log('Mockup created successfully');

    return new Response(
      JSON.stringify({ resultImage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-mockup function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao criar mockup' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
