import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, referenceImage } = await req.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return new Response(
        JSON.stringify({ error: "Prompt é obrigatório" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    console.log(`Gerando imagem com Gemini Image Preview...`);
    console.log(`Prompt: ${prompt}`);
    console.log(`Com imagem de referência: ${referenceImage ? 'Sim' : 'Não'}`);

    // Build message content
    const messageContent: any[] = [
      {
        type: 'text',
        text: referenceImage 
          ? `Edit this image based on the following instructions: ${prompt}`
          : prompt
      }
    ];

    // Add reference image if provided
    if (referenceImage) {
      messageContent.push({
        type: 'image_url',
        image_url: {
          url: referenceImage
        }
      });
    }

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
            content: messageContent
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('Erro na API de imagem:', imageResponse.status, errorText);
      
      if (imageResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente mais tarde." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
        );
      }
      if (imageResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao seu workspace." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 }
        );
      }
      
      throw new Error(`Erro ao gerar imagem: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    console.log('Resposta da API recebida');

    const generatedImageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      console.error('Formato de resposta inesperado:', JSON.stringify(imageData));
      throw new Error("Não foi possível extrair a URL da imagem gerada");
    }

    console.log('Imagem gerada com sucesso');

    return new Response(
      JSON.stringify({ 
        imageUrl: generatedImageUrl,
        success: true
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro na função create-ai-image:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro desconhecido ao gerar imagem"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
