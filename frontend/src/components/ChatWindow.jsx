import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/client'
import useAuth from '../store/useAuth'
import MessageBubble from './MessageBubble'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: `Hey there! 👋 I'm **AroMi**, your personal AI health and wellness coach.

I'm here to help you with:
- 🏋️ **Personalized workout plans** tailored to your goals and equipment
- 🥗 **Nutrition & meal planning** that fits your dietary needs
- 📈 **Progress tracking** and streak awareness
- 💪 **Adaptive coaching** — I remember everything and adjust to your feedback

To get started, tell me about yourself or just ask me anything. What's your fitness goal?`,
}

// ─── Date separator helper ────────────────────────────────────────────────────

function getDateLabel(dateStr) {
  if (!dateStr) return null
  const msgDate = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const fmt = (d) => d.toLocaleDateString('en-CA') // YYYY-MM-DD
  if (fmt(msgDate) === fmt(today)) return 'Today'
  if (fmt(msgDate) === fmt(yesterday)) return 'Yesterday'
  return msgDate.toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export default function ChatWindow() {
  const { getToken } = useAuth()
  const [messages, setMessages] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)
  const [isFocused, setIsFocused] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const eventSourceRef = useRef(null)

  const location = useLocation()

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.get('/profile').then((r) => r.data),
  })

  // ── Load history from DB on mount ──────────────────────────────────────────
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setHistoryLoading(true)
        const res = await apiClient.get('/history')
        if (res.data.messages.length > 0) {
          setMessages(res.data.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            created_at: m.created_at,
          })))
        } else {
          setMessages([WELCOME_MESSAGE])
        }
      } catch (err) {
        console.error('Failed to load history:', err)
        setMessages([WELCOME_MESSAGE])
      } finally {
        setHistoryLoading(false)
      }
    }
    loadHistory()
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cleanup SSE connection on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.abort?.()
      }
    }
  }, [])

  // Auto-send message from state if navigating from another page
  useEffect(() => {
    if (location.state?.autoSendMessage) {
      const msg = location.state.autoSendMessage
      window.history.replaceState({}, document.title)
      sendMessage(msg)
    }
  }, [location.state])

  // Pre-fill input from localStorage (e.g. from Adjust / Log Weight buttons)
  useEffect(() => {
    const prefill = localStorage.getItem('prefillMessage')
    if (prefill) {
      localStorage.removeItem('prefillMessage')
      setInput(prefill)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [])

  // ── Clear history ──────────────────────────────────────────────────────────
  const clearHistory = async () => {
    try {
      await apiClient.delete('/history')
      setMessages([{
        role: 'assistant',
        content: "Chat history cleared! 🗑️ Starting fresh. How can I help you today?",
      }])
      setShowClearConfirm(false)
    } catch (err) {
      console.error('Failed to clear history:', err)
    }
  }

  const sendMessage = async (textOverride = null, baseMessages = null) => {
    const text = (textOverride !== null ? textOverride : input).trim()
    if (!text || isStreaming) return

    setError(null)
    if (textOverride === null) {
      setInput('')
    }
    setIsStreaming(true)

    // Add user message immediately
    const activeMessages = baseMessages !== null ? baseMessages : messages
    const userMsg = { role: 'user', content: text }
    const updatedMessages = [...activeMessages, userMsg]
    setMessages(updatedMessages)

    // Add empty assistant message as placeholder for streaming
    const assistantMsg = { role: 'assistant', content: '' }
    setMessages([...updatedMessages, assistantMsg])

    try {
      const token = getToken()

      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        // history no longer sent — backend loads it from DB
        body: JSON.stringify({ message: text, history: [] }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const jsonStr = line.slice(6).trim()
          if (!jsonStr) continue

          try {
            const event = JSON.parse(jsonStr)
            if (event.type === 'token') {
              accumulatedText += event.data
              setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: accumulatedText,
                }
                return updated
              })
            } else if (event.type === 'done') {
              break
            } else if (event.type === 'error') {
              throw new Error(event.data)
            }
          } catch (parseErr) {
            // Skip malformed SSE lines
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Connection error. Please try again.')
      setMessages((prev) => prev.filter((m, i) => !(i === prev.length - 1 && !m.content)))
    } finally {
      setIsStreaming(false)
      inputRef.current?.focus()
    }
  }

  const retryLastMessage = () => {
    const userMessages = messages.filter((m) => m.role === 'user')
    if (userMessages.length === 0) return
    const lastUserMessage = userMessages[userMessages.length - 1].content

    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === 'user')
    if (lastUserIdx === -1) return
    const actualIdx = messages.length - 1 - lastUserIdx

    const baseMessages = messages.slice(0, actualIdx)
    sendMessage(lastUserMessage, baseMessages)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleChipClick = (text) => {
    setInput(text)
    inputRef.current?.focus()
  }

  const goalLabels = {
    lose_weight: '🔥 Lose Weight',
    build_muscle: '💪 Build Muscle',
    endurance: '🏃 Endurance',
    general_fitness: '⭐ Stay Fit',
  }

  const chips = [
    "Give me a workout",
    "Plan my meals",
    "Check my progress",
    "Calculate my macros"
  ]

  // ── Render messages with date separators ───────────────────────────────────
  const renderMessages = () => {
    let lastDateLabel = null
    return messages.map((msg, idx) => {
      const dateLabel = getDateLabel(msg.created_at)
      const showSeparator = dateLabel && dateLabel !== lastDateLabel
      if (showSeparator) lastDateLabel = dateLabel

      const isTypingMsg = isStreaming && idx === messages.length - 1 && !msg.content

      return (
        <div key={msg.id || idx} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {showSeparator && (
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: '12px', margin: '16px 0',
            }}>
              <div style={{ flex: 1, height: '1px', background: '#2a2d3e' }} />
              <span style={{
                fontSize: '11px', color: '#4a4d62',
                whiteSpace: 'nowrap', padding: '2px 10px',
                background: '#1a1d27', border: '1px solid #2a2d3e',
                borderRadius: '20px',
              }}>
                {dateLabel}
              </span>
              <div style={{ flex: 1, height: '1px', background: '#2a2d3e' }} />
            </div>
          )}
          <MessageBubble
            message={msg}
            isTyping={isTypingMsg}
            onRetry={retryLastMessage}
          />
        </div>
      )
    })
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (historyLoading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        height: '100vh', background: '#0f1117',
        alignItems: 'center', justifyContent: 'center',
        gap: '12px', color: '#4a4d62', fontSize: '13px',
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}>
        <div style={{
          width: '20px', height: '20px',
          border: '2px solid #2a2d3e',
          borderTopColor: '#7c6af7',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        Loading your conversation...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f1117', overflow: 'hidden', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* Chat header */}
      <header style={{ height: 56, flexShrink: 0, padding: '0 24px', borderBottom: '1px solid #2a2d3e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f1117' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#e8e9f0' }}>Chat with AroMi</span>
          <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', marginLeft: 8, display: 'inline-block' }} />
          <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>Online</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {profile?.primary_goal && (
            <span style={{ background: 'rgba(124,106,247,0.15)', border: '1px solid rgba(124,106,247,0.3)', color: '#a89cf7', borderRadius: 20, padding: '4px 12px', fontSize: 12 }}>
              {goalLabels[profile.primary_goal] || profile.primary_goal}
            </span>
          )}
          {/* Clear history button */}
          <button
            onClick={() => setShowClearConfirm(true)}
            title="Clear chat history"
            style={{
              background: 'none', border: '1px solid #2a2d3e',
              borderRadius: '6px', color: '#8b8fa8',
              padding: '5px 10px', cursor: 'pointer',
              fontSize: '12px', display: 'flex',
              alignItems: 'center', gap: '5px',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#ef4444'
              e.currentTarget.style.color = '#ef4444'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#2a2d3e'
              e.currentTarget.style.color = '#8b8fa8'
            }}
          >
            🗑️ Clear history
          </button>
        </div>
      </header>

      {/* Messages area */}
      <div className="messages-area" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, background: '#0f1117' }}>
        {renderMessages()}

        {/* Global error block */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#fca5a5',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            alignSelf: 'flex-start',
            maxWidth: '75%'
          }}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div style={{ flexShrink: 0, padding: '12px 24px 16px', borderTop: '1px solid #2a2d3e', background: '#0f1117' }}>
        
        {/* Quick action chips */}
        {!isStreaming && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            {chips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: '1px solid #2a2d3e',
                  background: '#1a1d27',
                  color: '#8b8fa8',
                  fontSize: '12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c6af7'; e.currentTarget.style.color = '#a89cf7' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2d3e'; e.currentTarget.style.color = '#8b8fa8' }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input Wrapper */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#1a1d27',
          border: `1px solid ${isFocused ? '#7c6af7' : '#2a2d3e'}`,
          boxShadow: isFocused ? '0 0 0 3px rgba(124,106,247,0.08)' : 'none',
          borderRadius: '10px',
          padding: '8px 8px 8px 16px',
          transition: 'all 0.15s'
        }}>
          <textarea
            ref={inputRef}
            rows={1}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#e8e9f0',
              fontSize: '14px',
              resize: 'none',
              maxHeight: 120,
              fontFamily: 'inherit'
            }}
            placeholder="Message AroMi..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isStreaming}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isStreaming}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#7c6af7',
              border: 'none',
              color: 'white',
              cursor: (!input.trim() || isStreaming) ? 'default' : 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              opacity: (!input.trim() || isStreaming) ? 0.4 : 1,
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => { if (input.trim() && !isStreaming) e.currentTarget.style.background = '#6b5ce7' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#7c6af7' }}
          >
            {isStreaming ? (
              <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
            ) : '➔'}
          </button>
        </div>
        <p style={{ fontSize: '11px', color: '#4a4d62', textAlign: 'center', marginTop: '8px', margin: '8px 0 0' }}>
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>

      {/* Clear history confirmation modal */}
      {showClearConfirm && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: '#13151e',
            border: '1px solid #2a2d3e',
            borderRadius: '12px', padding: '24px',
            width: '320px', textAlign: 'center',
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>🗑️</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#e8e9f0', marginBottom: '8px' }}>
              Clear chat history?
            </div>
            <div style={{ fontSize: '13px', color: '#8b8fa8', marginBottom: '20px' }}>
              This will permanently delete all your conversation history with AroMi.
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  flex: 1, background: 'transparent',
                  border: '1px solid #2a2d3e',
                  borderRadius: '8px', padding: '10px',
                  color: '#8b8fa8', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: '13px',
                }}
              >Cancel</button>
              <button
                onClick={clearHistory}
                style={{
                  flex: 1,
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '8px', padding: '10px',
                  color: '#ef4444', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: '13px',
                  fontWeight: '600',
                }}
              >Clear All</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        textarea::placeholder {
          color: #4a4d62 !important;
        }
        @keyframes greenPulse {
          0%, 100% { opacity: 0.6; box-shadow: 0 0 4px #22c55e; }
          50% { opacity: 1; box-shadow: 0 0 8px #22c55e; }
        }
        .pulse-dot {
          animation: greenPulse 2s infinite ease-in-out;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
