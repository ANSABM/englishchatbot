"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User } from "lucide-react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export default function ToBeBotPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => Math.random().toString(36).substring(7))
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [],
            sessionId,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const initialMessage: Message = {
            id: "1",
            content: data.message,
            role: "assistant",
            timestamp: new Date(),
          }
          setMessages([initialMessage])
        }
      } catch (error) {
        console.error("Error initializing chat:", error)
      }
    }

    initializeChat()
  }, [sessionId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-900/20 via-purple-800/10 to-background">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          <div
            className="absolute top-32 right-20 w-24 h-24 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-full blur-lg animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 right-1/4 w-28 h-28 bg-gradient-to-r from-indigo-500/15 to-purple-500/15 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>

          {/* Flowing lines effect */}
          <div className="absolute top-20 left-1/4 w-64 h-1 bg-gradient-to-r from-transparent via-violet-400/30 to-transparent transform rotate-12 blur-sm"></div>
          <div className="absolute top-40 right-1/3 w-48 h-1 bg-gradient-to-r from-transparent via-purple-400/25 to-transparent transform -rotate-12 blur-sm"></div>
          <div className="absolute bottom-32 left-1/2 w-56 h-1 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent transform rotate-6 blur-sm"></div>
        </div>

        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 backdrop-blur-sm border border-violet-500/20">
              <Bot className="w-8 h-8 text-violet-400" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white bg-gradient-to-r from-violet-300 via-purple-300 to-blue-300 bg-clip-text text-transparent">
              ToBeBot
            </h1>
          </div>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
            Practice English sentences using the verb TO BE or have natural conversations. I'll validate your grammar
            using regular expressions and help you learn through interactive chat powered by AI.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-violet-500/20">
              <span className="text-sm text-muted-foreground">✨ TO BE Validation</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-purple-500/20">
              <span className="text-sm text-muted-foreground">🎯 Regex Patterns</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-blue-500/20">
              <span className="text-sm text-muted-foreground">🚀 Instant Grammar Check</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-green-500/20">
              <span className="text-sm text-muted-foreground">💬 AI Conversations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto h-[70vh] min-h-[500px] max-h-[800px] flex flex-col bg-card/50 backdrop-blur-sm border-violet-500/20">
          {/* Chat Messages */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <ScrollArea className="flex-1 h-full overflow-y-auto">
              <div className="p-6 h-full">
                <div className="space-y-4 min-h-full">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                      )}

                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        <span className="text-xs opacity-70 mt-1 block">{message.timestamp.toLocaleTimeString()}</span>
                      </div>

                      {message.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-secondary" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <div className="bg-muted rounded-lg px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 p-6 border-t border-violet-500/20 bg-card/80 backdrop-blur-sm">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message in English..."
                className="flex-1 bg-input border-violet-500/20 focus:ring-2 focus:ring-violet-500/50"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send &bull; ToBeBot helps you practice English conversation and grammar
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
