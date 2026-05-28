import ChatWindow from '../components/ChatWindow'
import Layout from '../components/Layout'

export default function Home() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: 'transparent' }}>
      <ChatWindow />
    </div>
  )
}
