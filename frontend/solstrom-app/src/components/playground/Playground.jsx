import ChatPanel from './ChatPanel';
import DataPanel from './DataPanel';
import { useChat } from '../../hooks/useChat';

function Playground() {
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();
  console.log('---messages---',messages);
  return (
    <div className="playground">
      <ChatPanel
        messages={messages}
        isLoading={isLoading}
        error={error}
        onSend={sendMessage}
        onClear={clearChat}
      />
      <DataPanel />
    </div>
  );
}

export default Playground;
