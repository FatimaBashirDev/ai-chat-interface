import { createGroq } from '@ai-sdk/groq'
import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import { CHAT_MODEL, CHAT_SYSTEM_PROMPT } from '@/lib/chat-config'

export const maxDuration = 30

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json()

  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })
  const result = streamText({
    model: groq(CHAT_MODEL),
    system: CHAT_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    abortSignal: request.signal,
  })

  return result.toUIMessageStreamResponse()
}
