import ReactMarkdown from 'react-markdown'
import useAuth from '../store/useAuth'

export default function MessageBubble({ message, isTyping = false, onRetry }) {
  const { user } = useAuth()
  const isUser = message.role === 'user'

  const formattedTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  // Initials for avatar
  const userInitial = user?.full_name?.charAt(0)?.toUpperCase() || 'U'

  // Error detection
  const isErrorMsg =
    !isUser &&
    message.content &&
    (message.content.includes('Error communicating') ||
      (message.content.includes("'error'") && message.content.includes("'code'")) ||
      message.content.includes('__GEMINI_UNAVAILABLE__') ||
      message.content.includes('__GROQ_UNAVAILABLE__') ||
      message.content.includes('503 UNAVAILABLE'))

  if (isErrorMsg) {
    return (
      <div style={{
        alignSelf: 'flex-start',
        maxWidth: '75%',
        display: 'flex',
        gap: '10px',
        marginBottom: '16px',
        fontFamily: "'Inter', -apple-system, sans-serif"
      }}>
        {/* Avatar */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: '#7c6af7',
          color: 'white',
          fontSize: '13px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '2px'
        }}>
          A
        </div>
        {/* Bubble */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#fca5a5',
          fontSize: '13px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px'
        }}>
          <span style={{ fontWeight: '500' }}>⚠️ AroMi is temporarily unavailable. Please try again.</span>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                background: 'transparent',
                border: '1px solid #ef4444',
                color: '#ef4444',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      maxWidth: isUser ? '72%' : '75%',
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      gap: '10px',
      marginBottom: '16px',
      fontFamily: "'Inter', -apple-system, sans-serif"
    }}>
      {/* Avatar Circle */}
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        {isUser ? (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#2a2d3e',
            color: '#e8e9f0',
            fontSize: '13px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {userInitial}
          </div>
        ) : (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#7c6af7',
            color: 'white',
            fontSize: '13px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            A
          </div>
        )}
      </div>

      {/* Bubble + Timestamp Wrapper */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start'
      }}>
        {/* Bubble */}
        <div style={{
          padding: '12px 16px',
          fontSize: '14px',
          lineHeight: '1.65',
          background: isUser ? '#7c6af7' : '#1a1d27',
          border: isUser ? 'none' : '1px solid #2a2d3e',
          color: isUser ? 'white' : '#e8e9f0',
          borderRadius: isUser ? '12px 4px 12px 12px' : '4px 12px 12px 12px'
        }}>
          {isTyping ? (
            <div style={{ display: 'flex', alignItems: 'center', height: '16px', padding: '2px 0' }}>
              <span className="dot-bounce" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#7c6af7', display: 'inline-block', margin: '0 2px', animation: 'bounce 1.2s infinite', animationDelay: '0s' }} />
              <span className="dot-bounce" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#7c6af7', display: 'inline-block', margin: '0 2px', animation: 'bounce 1.2s infinite', animationDelay: '0.2s' }} />
              <span className="dot-bounce" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#7c6af7', display: 'inline-block', margin: '0 2px', animation: 'bounce 1.2s infinite', animationDelay: '0.4s' }} />
            </div>
          ) : isUser ? (
            <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>{message.content}</p>
          ) : (
            <div style={{ wordBreak: 'break-word' }}>
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => <h1 style={{ fontSize: '15px', fontWeight: 'bold', color: '#e8e9f0', margin: '8px 0' }} {...props} />,
                  h2: ({ node, ...props }) => <h2 style={{ fontSize: '13px', fontWeight: 'bold', color: '#e8e9f0', margin: '6px 0' }} {...props} />,
                  h3: ({ node, ...props }) => (
                    <h3 style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', tracking: '1px', color: '#a89cf7', borderLeft: '2px solid #7c6af7', paddingLeft: '8px', margin: '10px 0' }} {...props} />
                  ),
                  p: ({ node, ...props }) => <p style={{ fontSize: '13.5px', color: 'rgba(232, 233, 240, 0.9)', leading: '1.6', margin: '4px 0' }} {...props} />,
                  ul: ({ node, ...props }) => (
                    <div style={{ marginTop: '10px', background: '#0f1117', border: '1px solid #2a2d3e', borderRadius: '8px', overflow: 'hidden' }}>
                      <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }} {...props} />
                    </div>
                  ),
                  li: ({ node, ...props }) => (
                    <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: '1px solid #1f2235', fontSize: '13px', color: '#e8e9f0' }} {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <div style={{ marginTop: '10px', background: '#0f1117', border: '1px solid #2a2d3e', borderRadius: '8px', overflow: 'hidden' }}>
                      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '12px' }} {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => <th style={{ padding: '8px 12px', background: 'rgba(124, 106, 247, 0.1)', borderBottom: '1px solid #2a2d3e', color: '#a89cf7', fontWeight: '600' }} {...props} />,
                  td: ({ node, ...props }) => <td style={{ padding: '8px 12px', borderBottom: '1px solid #1f2235', color: '#e8e9f0' }} {...props} />,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span style={{
          fontSize: '11px',
          color: '#4a4d62',
          marginTop: '4px',
          padding: '0 4px',
          textAlign: isUser ? 'right' : 'left'
        }}>{formattedTime}</span>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        .dot-bounce {
          animation: bounce 1.2s infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}
