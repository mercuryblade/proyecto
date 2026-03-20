import { NextResponse } from 'next/server'

export const maxDuration = 30

// Demo responses for when no API key is configured
const demoResponses: Record<string, string> = {
  hola: '¡Hola! Soy tu asistente de CryptoSim. Estoy aqui para ayudarte a aprender sobre trading de criptomonedas. Puedes preguntarme sobre:\n\n• Ordenes de compra y venta\n• Stop Loss y Take Profit\n• Estrategias de trading\n• Analisis tecnico\n• Gestion de riesgo\n\n¿En que te puedo ayudar hoy?',
  
  'stop loss': 'El **Stop Loss (SL)** es una orden automatica que cierra tu posicion cuando el precio alcanza un nivel predeterminado para limitar perdidas.\n\n**Ejemplo practico:**\n- Compras BTC a $50,000\n- Colocas SL en $47,500 (5% abajo)\n- Si el precio baja a $47,500, se vende automaticamente\n- Tu perdida maxima seria del 5%\n\n**Consejos:**\n• Nunca operes sin Stop Loss\n• No lo coloques demasiado cerca (evita que te saquen por volatilidad normal)\n• Una regla comun es arriesgar maximo 1-2% de tu capital por operacion',
  
  'take profit': 'El **Take Profit (TP)** es una orden automatica que cierra tu posicion cuando el precio alcanza tu objetivo de ganancia.\n\n**Ejemplo practico:**\n- Compras ETH a $3,000\n- Colocas TP en $3,300 (10% arriba)\n- Si el precio sube a $3,300, se vende automaticamente\n- Aseguras una ganancia del 10%\n\n**Consejos:**\n• Define tu TP antes de entrar a la operacion\n• Busca una relacion riesgo/beneficio de al menos 1:2\n• Puedes usar TPs parciales (vender 50% en el primer objetivo)',
  
  comprar: 'Para **comprar criptomonedas** en CryptoSim:\n\n1. Ve a la seccion de Trading\n2. Selecciona la criptomoneda (BTC, ETH, SOL, BNB)\n3. Elige el tipo de orden:\n   - **Mercado**: Se ejecuta al precio actual\n   - **Limite**: Se ejecuta cuando el precio llegue a tu objetivo\n4. Ingresa la cantidad o el monto en USD\n5. Opcionalmente configura TP y SL\n6. Confirma la orden\n\n**Recuerda**: Este es un simulador con dinero virtual. ¡Practica sin riesgo!',
  
  vender: 'Para **vender criptomonedas** en CryptoSim:\n\n1. Ve a tu Portafolio o a Trading\n2. Selecciona la criptomoneda que deseas vender\n3. Elige "Vender"\n4. Selecciona el tipo de orden (Mercado o Limite)\n5. Ingresa la cantidad a vender\n6. Confirma la operacion\n\n**Tips para vender:**\n• Ten un plan antes de entrar (saber cuando saldras)\n• No vendas por panico en caidas temporales\n• Considera ventas parciales para asegurar ganancias',
  
  estrategia: 'Las **estrategias de trading** mas comunes son:\n\n**1. HODL (Hold On for Dear Life)**\n- Comprar y mantener a largo plazo\n- Ideal para principiantes\n- Menor estres y menos comisiones\n\n**2. DCA (Dollar Cost Averaging)**\n- Invertir cantidades fijas periodicamente\n- Reduce el impacto de la volatilidad\n- Ejemplo: $100 cada semana en BTC\n\n**3. Swing Trading**\n- Operaciones de dias a semanas\n- Busca capturar movimientos de precio medianos\n\n**4. Day Trading**\n- Operaciones en el mismo dia\n- Requiere mas tiempo y experiencia\n- Mayor riesgo\n\n**Recomendacion para principiantes**: Empieza con HODL o DCA',
  
  riesgo: 'La **gestion de riesgo** es fundamental en trading:\n\n**Reglas de oro:**\n\n1. **Regla del 1-2%**: Nunca arriesgues mas del 1-2% de tu capital en una sola operacion\n\n2. **Siempre usa Stop Loss**: Protege tu capital de grandes perdidas\n\n3. **Diversifica**: No pongas todo en una sola criptomoneda\n\n4. **Relacion Riesgo/Beneficio**: Busca operaciones donde puedas ganar al menos 2x lo que arriesgas (1:2)\n\n**Ejemplo con $10,000:**\n- Riesgo maximo por operacion: $100-$200 (1-2%)\n- Si tu SL es del 5%, tu posicion maxima seria $2,000-$4,000\n\n**Recuerda**: Preservar el capital es mas importante que ganar',
  
  analisis: 'El **analisis tecnico** estudia graficos de precios para predecir movimientos futuros:\n\n**Conceptos basicos:**\n\n**Soporte**: Nivel donde el precio tiende a detenerse al bajar\n**Resistencia**: Nivel donde el precio tiende a detenerse al subir\n\n**Indicadores comunes:**\n- **RSI**: Mide si esta sobrecomprado (>70) o sobrevendido (<30)\n- **Medias moviles**: Muestran la tendencia general\n- **MACD**: Indica cambios de tendencia\n- **Volumen**: Confirma la fuerza de los movimientos\n\n**Patrones de velas:**\n- Vela verde: El precio subio\n- Vela roja: El precio bajo\n- Velas con mechas largas: Indecision del mercado\n\n**Consejo**: En CryptoSim puedes practicar identificando estos patrones sin riesgo',
  
  bitcoin: '**Bitcoin (BTC)** es la primera y mas conocida criptomoneda:\n\n**Caracteristicas:**\n- Creado en 2009 por Satoshi Nakamoto\n- Suministro limitado: Solo existiran 21 millones de BTC\n- Es considerado "oro digital"\n- Mayor capitalizacion de mercado\n\n**Para trading:**\n- Es el mas liquido (facil de comprar/vender)\n- Menor volatilidad que altcoins\n- Buen activo para principiantes\n\n**En CryptoSim** tienes $10,000 virtuales para practicar. Te sugiero empezar con posiciones pequenas en BTC para familiarizarte con la plataforma.',
  
  default: '¡Gracias por tu pregunta! Como asistente de CryptoSim, puedo ayudarte con:\n\n• **Conceptos de trading**: Ordenes, Stop Loss, Take Profit\n• **Estrategias**: HODL, DCA, Swing Trading\n• **Analisis tecnico**: Soportes, resistencias, indicadores\n• **Gestion de riesgo**: Tamano de posicion, diversificacion\n• **Uso de la plataforma**: Como comprar, vender, ver portafolio\n\nEscribe tu pregunta especifica y te ayudare. Por ejemplo:\n- "¿Que es un Stop Loss?"\n- "¿Como compro Bitcoin?"\n- "Explicame las estrategias de trading"\n\n**Recuerda**: Esto es un simulador educativo con dinero virtual. ¡Practica sin riesgo!'
}

function getDemoResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase()
  
  // Check for keywords and return appropriate response
  if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('hey')) {
    return demoResponses['hola']
  }
  if (lowerMessage.includes('stop loss') || lowerMessage.includes('stoploss') || lowerMessage.includes('sl')) {
    return demoResponses['stop loss']
  }
  if (lowerMessage.includes('take profit') || lowerMessage.includes('takeprofit') || lowerMessage.includes('tp')) {
    return demoResponses['take profit']
  }
  if (lowerMessage.includes('comprar') || lowerMessage.includes('compra') || lowerMessage.includes('buy')) {
    return demoResponses['comprar']
  }
  if (lowerMessage.includes('vender') || lowerMessage.includes('venta') || lowerMessage.includes('sell')) {
    return demoResponses['vender']
  }
  if (lowerMessage.includes('estrategia') || lowerMessage.includes('hodl') || lowerMessage.includes('dca') || lowerMessage.includes('swing')) {
    return demoResponses['estrategia']
  }
  if (lowerMessage.includes('riesgo') || lowerMessage.includes('gestion') || lowerMessage.includes('capital')) {
    return demoResponses['riesgo']
  }
  if (lowerMessage.includes('analisis') || lowerMessage.includes('tecnico') || lowerMessage.includes('grafico') || lowerMessage.includes('indicador')) {
    return demoResponses['analisis']
  }
  if (lowerMessage.includes('bitcoin') || lowerMessage.includes('btc')) {
    return demoResponses['bitcoin']
  }
  
  return demoResponses['default']
}

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

    // If no API key, use demo mode with predefined educational responses
    if (!HF_API_KEY) {
      const lastUserMessage = messages[messages.length - 1]
      const userContent = getMessageContent(lastUserMessage)
      const demoResponse = getDemoResponse(userContent)
      
      // Add a small delay to simulate thinking
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return NextResponse.json({
        role: 'assistant',
        content: demoResponse,
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
