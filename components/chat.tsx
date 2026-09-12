'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { ArrowDown, ArrowUp, Bot, CircleStop, Send, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

function messageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('')
}

export function Chat() {
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })
  const [input, setInput] = useState('')
  const [isPinned, setIsPinned] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const isStreaming = status === 'submitted' || status === 'streaming'
  const lastMessage = messages[messages.length - 1]
  const showThinking = status === 'submitted' && lastMessage?.role === 'user'

  useEffect(() => {
    if (isPinned) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isPinned])

  const handleScroll = useCallback(() => {
    const element = scrollRef.current
    if (!element) return
    const atBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 48
    setIsPinned(atBottom)
  }, [])

  const jumpToLatest = () => {
    setIsPinned(true)
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')
    setIsPinned(true)
    void sendMessage({ text })
  }

  return (
    <div className="chat-shell">
      <header className="chat-header">
        <div className="brand-mark" aria-hidden="true"><Sparkles size={17} /></div>
        <div>
          <p className="eyebrow">PRIVATE CONVERSATION</p>
          <h1>Signal</h1>
        </div>
        <span className="status-dot" aria-label="Online" />
      </header>

      <main className="transcript" ref={scrollRef} onScroll={handleScroll} aria-live="polite">
        {messages.length === 0 ? (
          <section className="welcome">
            <div className="welcome-icon"><Bot size={24} /></div>
            <p className="eyebrow">READY WHEN YOU ARE</p>
            <h2>What&apos;s on your mind?</h2>
            <p className="welcome-copy">Ask anything. Signal will help you think it through.</p>
            <div className="suggestions" aria-label="Suggested prompts">
              {['Explain a complex idea simply', 'Help me make a decision', 'Give me a fresh perspective'].map((suggestion) => (
                <button key={suggestion} type="button" onClick={() => setInput(suggestion)}>{suggestion}<ArrowUp size={14} /></button>
              ))}
            </div>
          </section>
        ) : (
          <div className="message-list">
            {messages.map((message) => {
              const text = messageText(message)
              if (!text && message.role !== 'assistant') return null
              return (
                <article className={`message-row ${message.role}`} key={message.id}>
                  <div className="message-label">{message.role === 'user' ? 'YOU' : 'SIGNAL'}</div>
                  <div className="message-content">{text}</div>
                </article>
              )
            })}
            {showThinking && <div className="thinking" aria-label="Signal is thinking"><span /><span /><span /><em>Thinking</em></div>}
            <div ref={endRef} />
          </div>
        )}
      </main>

      {!isPinned && <button type="button" className="jump-button" onClick={jumpToLatest}><ArrowDown size={14} /> Jump to latest</button>}

      <footer className="composer-wrap">
        <form className="composer" onSubmit={submit}>
          <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} placeholder="Message Signal..." aria-label="Message Signal" rows={1} disabled={isStreaming} />
          {isStreaming ? <button type="button" className="stop-button" onClick={() => stop()} aria-label="Stop generating"><CircleStop size={18} /></button> : <button type="submit" className="send-button" disabled={!input.trim()} aria-label="Send message"><Send size={17} /></button>}
        </form>
        <p className="composer-note">Signal can make mistakes. Check important information.</p>
      </footer>
    </div>
  )
}
