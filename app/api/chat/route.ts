import { type NextRequest, NextResponse } from "next/server"
import { ToBeSentenceValidator } from "@/lib/regex-validator"
import { openai } from "@ai-sdk/openai"

interface ConversationState {
  stage: "greeting" | "asking_name" | "choosing_mode" | "practicing" | "asking_continue" | "chatting"
  mode?: "practice" | "chat"
  userName?: string
  lastSentence?: string
}

// Simple in-memory storage (in production, use a database)
const conversations = new Map<string, ConversationState>()

export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId = "default" } = await request.json()

    // Get or initialize conversation state
    const state = conversations.get(sessionId) || { stage: "greeting" }

    const lastUserMessage = messages[messages.length - 1]?.content?.trim()
    const lastUserMessageLower = lastUserMessage?.toLowerCase().trim()

    let response = ""

    // Handle conversation flow based on state
    switch (state.stage) {
      case "greeting":
        response = "Hello! My name is ToBeBot. What's your name?"
        state.stage = "asking_name"
        break

      case "asking_name":
        const name = messages[messages.length - 1]?.content?.trim()
        state.userName = name
        response = `Nice to meet you, ${name}! I can help you in two ways:\n\n1️⃣ **Practice Mode**: Validate sentences with the verb TO BE\n2️⃣ **Chat Mode**: Have a conversation in English\n\nWhich would you like to try? Type "practice" or "chat"`
        state.stage = "choosing_mode"
        break

      case "choosing_mode":
        const isPractice = /\b(practice|1|grammar|to be|verb)\b/i.test(lastUserMessageLower || "")
        const isChat = /\b(chat|2|conversation|talk|speak)\b/i.test(lastUserMessageLower || "")

        if (isPractice) {
          state.mode = "practice"
          response =
            "Great! Let's practice grammar. Please type a sentence in English using the verb TO BE (present or past)."
          state.stage = "practicing"
        } else if (isChat) {
          state.mode = "chat"
          response = "Awesome! Let's have a conversation in English. What would you like to talk about?"
          state.stage = "chatting"
        } else {
          response = "Please choose a mode by typing 'practice' for grammar validation or 'chat' for conversation."
        }
        break

      case "practicing":
        if (/\b(chat|conversation|talk|switch)\b/i.test(lastUserMessageLower || "")) {
          state.mode = "chat"
          state.stage = "chatting"
          response = "Switching to chat mode! What would you like to talk about?"
          break
        }

        const validation = ToBeSentenceValidator.validateSentence(lastUserMessage)

        if (validation.isValid) {
          response = `✅ Correct sentence in ${validation.type}!`
        } else {
          response = "❌ Invalid sentence."

          // Add detailed error explanations
          if (validation.errors && validation.errors.length > 0) {
            response += "\n\n📝 Issues found:"
            validation.errors.forEach((error, index) => {
              response += `\n${index + 1}. ${error}`
            })
          }

          // Add correction suggestion
          if (validation.corrections) {
            response += `\n\n💡 ${validation.corrections}`
          }

          // Show corrected sentence if available
          if (validation.correctedSentence && validation.correctedSentence !== lastUserMessage) {
            response += `\n\n✏️ Corrected version: "${validation.correctedSentence}"`
          }

          // Add grammar explanation for common TO BE errors
          if (validation.type === "invalid") {
            response +=
              "\n\n📚 Remember: Use 'am' with 'I', 'is' with he/she/it, 'are' with you/we/they (present). Use 'was' with I/he/she/it, 'were' with you/we/they (past)."
          }
        }

        response += "\n\nDo you want to try another sentence? (yes/no) or type 'chat' to switch to conversation mode."
        state.stage = "asking_continue"
        break

      case "chatting":
        // Check if user wants to switch to practice mode
        if (/\b(practice|grammar|to be|verb|switch)\b/i.test(lastUserMessageLower || "")) {
          state.mode = "practice"
          state.stage = "practicing"
          response = "Switching to practice mode! Please type a sentence using the verb TO BE."
          break
        }

        try {
          const { text } = await openai("gpt-4o-mini", {
            apiKey:
              "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",
            system: `You are ToBeBot, a friendly English conversation partner. Keep responses conversational, helpful, and encouraging. Focus on helping the user practice English naturally. Keep responses concise (2-3 sentences max). The user's name is ${state.userName || "there"}.`,
            prompt: lastUserMessage || "",
          })

          response = text + "\n\n💡 Type 'practice' if you want to switch to grammar validation mode."
        } catch (error) {
          console.error("OpenAI API error:", error)
          response =
            "I'm having trouble connecting to my conversation system right now. Let's switch to practice mode instead! Please type a sentence using the verb TO BE."
          state.mode = "practice"
          state.stage = "practicing"
        }
        break

      case "asking_continue":
        if (/\b(chat|conversation|talk|switch)\b/i.test(lastUserMessageLower || "")) {
          state.mode = "chat"
          state.stage = "chatting"
          response = "Switching to chat mode! What would you like to talk about?"
          break
        }

        const isYes = /\b(yes|y|yeah|yep|sure|ok|okay)\b/i.test(lastUserMessageLower || "")
        const isNo = /\b(no|n|nope|stop|quit|exit)\b/i.test(lastUserMessageLower || "")

        if (isYes) {
          response = "Great! Type your next sentence."
          state.stage = "practicing"
        } else if (isNo) {
          response =
            "Thanks for practicing! Would you like to chat instead? Type 'chat' for conversation or 'bye' to end."
          state.stage = "choosing_mode"
        } else {
          response =
            "Please answer with 'yes' or 'no'. Do you want to try another sentence? Or type 'chat' to switch modes."
        }
        break
    }

    // Update conversation state
    conversations.set(sessionId, state)

    return NextResponse.json({ message: response })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 })
  }
}
