import { NextResponse } from 'next/server'

export const maxDuration = 30

const systemPrompt = `Eres CryptoSim Assistant, un asistente de IA educativo para trading de criptomonedas en la plataforma de simulacion CryptoSim. Tu rol es ayudar a los usuarios a aprender sobre:

1. Conceptos basicos de trading de criptomonedas (ordenes de compra/venta, ordenes de mercado, ordenes limitadas)
2. Estrategias de trading (day trading, swing trading, HODL, promedio de costo en dolares - DCA)
3. Conceptos de analisis tecnico (soporte/resistencia, lineas de tendencias, patrones de velas)
4. Gestion de riesgo (tamano de posicion, stop-loss, diversificacion de portafolio)
5. Entender indicadores de mercado (volumen, capitalizacion de mercado, cambios de precio)
6. Errores comunes de trading que debes evitar
7. Como usar efectivamente la plataforma CryptoSim

Pautas importantes:
- Este es un SIMULADOR con dinero virtual (saldo inicial de $10,000 USD)
- NUNCA des consejos financieros especificos o predicciones de precios
- Siempre recuerda a los usuarios que esto es solo para fines educativos
- Anima a los usuarios a practicar diferentes estrategias sin riesgo
- Explica los conceptos en terminos simples y amigables para principiantes
- Se alentador y apoya su proceso de aprendizaje
- SIEMPRE responde en espanol

Cuando los usuarios pregunten sobre operaciones especificas:
- Ayudalos a entender los mecanismos
- Explica los riesgos y recompensas potenciales
- Sugiere que comiencen con posiciones pequenas para aprender
- Recuerdales que nunca arriesguen mas de lo que pueden perder en trading real

Funciones adicionales que puedes realizar:
- Analizar el historial de operaciones del usuario y dar retroalimentacion sobre errores comunes
- Explicar conceptos de Take Profit (TP) y Stop Loss (SL)
- Dar consejos sobre gestion de capital y psicologia del trading
- Explicar indicadores tecnicos como RSI, MACD, medias moviles

Manten las respuestas concisas pero informativas. Usa ejemplos cuando sea util.`

interface Message {
  role: 'user' | 'assistant'
  parts?: Array<{ type: string; text?: string }>
  content?: string
}

// Helper to extract text from UIMessage parts format
function getMessageContent(msg: Message): string {
  if (msg.parts && Array.isArray(msg.parts)) {
    return msg.parts
      .filter((p) => p.type === 'text' && p.text)
      .map((p) => p.text)
      .join('')
  }
  return msg.content || ''
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: Message[] } = await req.json()

    // Build conversation history
    const conversationHistory = messages
      .map((msg) => {
        const content = getMessageContent(msg)
        return `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${content}`
      })
      .join('\n')

    const fullPrompt = `${systemPrompt}\n\nConversacion:\n${conversationHistory}\n\nAsistente:`

    const HF_API_KEY = process.env.HF_API_KEY

    if (!HF_API_KEY) {
      // Return a helpful message if no API key is configured
      return NextResponse.json({
        role: 'assistant',
        content:
          'El asistente de IA no esta configurado. Por favor configura la variable de entorno HF_API_KEY con tu API key de Hugging Face para habilitar el asistente.',
      })
    }

    // Use Hugging Face Inference API with Mistral-7B-Instruct (better for Spanish)
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true,
            return_full_text: false,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      // If model is loading, return temporary message
      if (response.status === 503) {
        return NextResponse.json({
          role: 'assistant',
          content:
            'El modelo de IA esta iniciando, por favor intenta de nuevo en unos segundos. Esto es normal la primera vez.',
        })
      }

      console.error('Hugging Face API error:', errorData)
      return NextResponse.json({
        role: 'assistant',
        content:
          'Hubo un error al conectar con el asistente. Por favor intenta de nuevo.',
      })
    }

    const data = await response.json()

    // Extract response from model
    let assistantMessage = ''
    if (Array.isArray(data) && data[0]?.generated_text) {
      assistantMessage = data[0].generated_text.trim()
    } else if (data.generated_text) {
      assistantMessage = data.generated_text.trim()
    } else {
      assistantMessage =
        'Lo siento, no pude generar una respuesta. Por favor intenta de nuevo.'
    }

    // Clean up the response
    assistantMessage = assistantMessage
      .replace(/^Asistente:\s*/i, '')
      .replace(/\n(Usuario|Asistente):.*/s, '')
      .trim()

    return NextResponse.json({
      role: 'assistant',
      content:
        assistantMessage ||
        'Estoy aqui para ayudarte con tus dudas sobre trading. ¿En que puedo asistirte?',
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({
      role: 'assistant',
      content: 'Ocurrio un error interno. Por favor intenta de nuevo.',
    })
  }
}
