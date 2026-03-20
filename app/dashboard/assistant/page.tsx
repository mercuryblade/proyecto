'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bot, Send, User, Loader2, TrendingUp, BookOpen, Shield, Target } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const suggestedQuestions = [
  'Como compro mi primera criptomoneda?',
  'Que es el promedio de costo en dolares (DCA)?',
  'Como leo un grafico de velas?',
  'Que es la capitalizacion de mercado?',
  'Como gestiono el riesgo en trading?',
  'Cual es la diferencia entre orden de mercado y orden limitada?',
  'Que es Take Profit y Stop Loss?',
  'Analiza mi historial de operaciones',
]

const quickTopics = [
  { icon: TrendingUp, label: 'Analisis Tecnico', prompt: 'Explicame los conceptos basicos del analisis tecnico' },
  { icon: BookOpen, label: 'Estrategias', prompt: 'Cuales son las estrategias de trading mas comunes para principiantes?' },
  { icon: Shield, label: 'Gestion de Riesgo', prompt: 'Como puedo gestionar mejor el riesgo en mis operaciones?' },
  { icon: Target, label: 'TP y SL', prompt: 'Como configuro correctamente el Take Profit y Stop Loss?' },
]

export default function AssistantPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || 'Lo siento, no pude generar una respuesta.',
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Ocurrio un error al enviar el mensaje. Por favor intenta de nuevo.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage(input)
    setInput('')
  }

  const handleSuggestedQuestion = (question: string) => {
    if (isLoading) return
    sendMessage(question)
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Asistente de Trading con IA</h1>
        <p className="text-muted-foreground">
          Aprende sobre trading de criptomonedas con nuestro asistente de IA
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden border-border/50 bg-card/80">
        <CardHeader className="border-b border-border/50 py-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            Asistente CryptoSim
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full space-y-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">Bienvenido al Asistente CryptoSim</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Estoy aqui para ayudarte a aprender sobre trading de criptomonedas.
                    Preguntame lo que quieras sobre estrategias de trading, analisis de mercado,
                    o como usar la plataforma.
                  </p>
                </div>

                {/* Quick Topics */}
                <div className="w-full max-w-lg">
                  <p className="text-xs text-muted-foreground text-center mb-3">
                    Temas rapidos:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickTopics.map((topic, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="justify-start gap-2"
                        onClick={() => handleSuggestedQuestion(topic.prompt)}
                        disabled={isLoading}
                      >
                        <topic.icon className="h-4 w-4" />
                        {topic.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="w-full max-w-lg space-y-2">
                  <p className="text-xs text-muted-foreground text-center">
                    Preguntas sugeridas:
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleSuggestedQuestion(question)}
                        disabled={isLoading}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Pensando...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-border/50 p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregunta sobre estrategias de trading, analisis de mercado..."
                className="flex-1 bg-input/50"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground text-center">
              Solo para fines educativos. No es consejo financiero.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
