import { useState, useEffect, useRef, useCallback } from 'react';
import { getMessages, sendMessage, getPresetMessages } from '../../api/chat';
import { useAuth } from '../../context/AuthContext';
import { SharedLoader } from '../../components/loaders/SharedLoader';
import { Send, MessageSquare, CheckCheck } from 'lucide-react';

const POLL_INTERVAL_MS = 4000;

const ChatPanel = ({ groupId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [presets, setPresets] = useState([]);
  const [freeText, setFreeText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const isStudent = user.role === 'student';
  const [hasScrolledInitial, setHasScrolledInitial] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await getMessages(groupId);
      setMessages(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load chat');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchMessages();
    if (isStudent) {
      getPresetMessages()
        .then((res) => setPresets(res.data))
        .catch(() => {});
    }

    const interval = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchMessages, isStudent]);

  useEffect(() => {
    if (!hasScrolledInitial && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
      setHasScrolledInitial(true);
    }
  }, [messages, hasScrolledInitial]);

  const handleSend = async (content) => {
    if (!content.trim() || sending) return;
    setSending(true);
    setError('');
    try {
      await sendMessage(groupId, content);
      setFreeText('');
      await fetchMessages();
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleFreeTextSubmit = (e) => {
    e.preventDefault();
    handleSend(freeText);
  };

  if (loading) return <SharedLoader message="Connecting to chat..." />;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col h-[calc(100vh-11rem)] shadow-lg overflow-hidden transition-colors">
      {/* WhatsApp style chat header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/65 flex items-center justify-center text-green-700 dark:text-green-300 font-bold shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Group Discussion</h3>
            <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Group Chat
            </p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 dark:bg-gray-950/40">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-2" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No messages yet in this group.</p>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Send a message below to start chatting!</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender._id === user.id;
            return (
              <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                <div
                  className={`max-w-lg px-4 py-3 rounded-2xl text-sm shadow-sm relative group ${
                    isMe
                      ? 'bg-green-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-xs border border-gray-200/80 dark:border-gray-700/80'
                  }`}
                >
                  {!isMe && (
                    <p className="text-xs font-bold mb-1 text-green-700 dark:text-green-400">
                      {m.sender.name} <span className="opacity-75 font-normal">({m.sender.role})</span>
                    </p>
                  )}
                  <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-green-100' : 'text-gray-400 dark:text-gray-500'}`}>
                    <span>{new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="px-6 py-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/50 border-t border-gray-200 dark:border-gray-800">{error}</div>
      )}

      {/* Input area */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
        {isStudent ? (
          <div className="flex flex-wrap gap-2 mb-3">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                disabled={sending}
                className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-950/60 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-full disabled:opacity-50 transition shadow-xs font-medium"
              >
                {p}
              </button>
            ))}
          </div>
        ) : null}

        <form onSubmit={handleFreeTextSubmit} className="flex gap-3 items-center">
          <input
            type="text"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 dark:border-gray-700 rounded-xl px-5 py-3 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={sending || !freeText.trim()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition shadow-md flex items-center gap-2 shrink-0"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
