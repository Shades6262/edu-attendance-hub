import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  askGemini,
  getConversations,
  getConversationById,
  renameConversation,
  deleteConversation,
  deleteAllConversations
} from '../../api/ai';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SharedLoader } from '../../components/loaders/SharedLoader';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { EmptyState } from '../../components/common/EmptyState';
import GeminiIcon from '../../components/common/GeminiIcon';
import {
  Send,
  RotateCcw,
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';

const SUGGESTIONS = {
  student: [
    'Explain the difference between let, const and var',
    'How do I debug a "undefined is not a function" error?',
    'Quiz me on HTML basics',
  ],
  instructor: [
    'Give me 3 beginner assignment ideas for React',
    'Help me word feedback for a student who missed the requirements',
    'Draft a weekly progress report outline',
  ],
  admin: [
    'Draft an announcement about a public holiday closure',
    'Write a short attendance policy for students',
    'Suggest ways to improve student punctuality',
  ],
};

const AskGemini = () => {
  const { user } = useAuth();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(conversationId || null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Modals state
  const [renameModal, setRenameModal] = useState({ isOpen: false, id: null, title: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, title: '' });
  const [clearAllModal, setClearAllModal] = useState(false);

  const bottomRef = useRef(null);

  // Fetch conversation list on mount
  useEffect(() => {
    fetchConversationsList();
  }, []);

  const fetchConversationsList = async () => {
    try {
      const res = await getConversations();
      setConversations(res.data);
    } catch (err) {
      showToast('Failed to load chat history', 'error');
    } finally {
      setLoadingList(false);
    }
  };

  // Sync route param with active chat state & load chat messages
  useEffect(() => {
    if (conversationId && conversationId !== currentConversationId) {
      setCurrentConversationId(conversationId);
      loadConversationMessages(conversationId);
    } else if (!conversationId && currentConversationId) {
      setCurrentConversationId(null);
      setMessages([]);
    }
  }, [conversationId]);

  const loadConversationMessages = async (id) => {
    setLoadingChat(true);
    try {
      const res = await getConversationById(id);
      setMessages(res.data.messages || []);
    } catch (err) {
      showToast('Failed to load conversation', 'error');
      navigate(`/${user.role}/ask`, { replace: true });
    } finally {
      setLoadingChat(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
    navigate(`/${user.role}/ask`, { replace: true });
    setMobileDrawerOpen(false);
  };

  const handleSelectChat = (id) => {
    if (id === currentConversationId) return;
    navigate(`/${user.role}/ask/${id}`);
    setMobileDrawerOpen(false);
  };

  const send = async (text) => {
    const content = text.trim();
    if (!content || sending) return;

    const optimisticMessages = [...messages, { role: 'user', content, createdAt: new Date() }];
    setMessages(optimisticMessages);
    setInput('');
    setSending(true);

    try {
      const res = await askGemini({
        conversationId: currentConversationId,
        message: content,
      });

      const newId = res.data.conversationId;
      if (!currentConversationId && newId) {
        setCurrentConversationId(newId);
        navigate(`/${user.role}/ask/${newId}`, { replace: true });
      }

      setMessages([...optimisticMessages, { role: 'model', content: res.data.reply, createdAt: new Date() }]);
      fetchConversationsList();
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Try again.';
      showToast(msg, 'error');
      if (currentConversationId) {
        loadConversationMessages(currentConversationId);
      } else {
        setMessages([]);
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!renameModal.title.trim()) return;
    try {
      await renameConversation(renameModal.id, renameModal.title);
      showToast('Chat renamed successfully', 'success');
      setRenameModal({ isOpen: false, id: null, title: '' });
      fetchConversationsList();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to rename chat', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.id) return;
    const idToDelete = deleteModal.id;
    setDeleteModal({ isOpen: false, id: null, title: '' });
    try {
      await deleteConversation(idToDelete);
      showToast('Chat deleted', 'success');
      fetchConversationsList();
      if (currentConversationId === idToDelete) {
        handleNewChat();
      }
    } catch (err) {
      showToast('Failed to delete chat', 'error');
    }
  };

  const handleClearAllConfirm = async () => {
    setClearAllModal(false);
    try {
      await deleteAllConversations();
      showToast('All chat history cleared', 'success');
      setConversations([]);
      handleNewChat();
    } catch (err) {
      showToast('Failed to clear chats', 'error');
    }
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-lg transition-colors">
      {/* Desktop History Sidebar */}
      <aside className="hidden md:flex flex-col w-72 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <button
            onClick={handleNewChat}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus size={16} />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loadingList ? (
            <p className="text-xs text-center text-gray-400 py-6">Loading history...</p>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-center text-gray-400 py-8">No saved chats yet.</p>
          ) : (
            conversations.map((c) => {
              const isActive = c._id === currentConversationId;
              return (
                <div
                  key={c._id}
                  onClick={() => handleSelectChat(c._id)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition ${
                    isActive
                      ? 'bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 font-semibold border border-green-200/60 dark:border-green-800/60'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate flex-1">
                    <MessageSquare size={14} className={isActive ? 'text-green-600 dark:text-green-400 shrink-0' : 'text-gray-400 shrink-0'} />
                    <span className="truncate">{c.title}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenameModal({ isOpen: true, id: c._id, title: c.title });
                      }}
                      className="p-1 hover:text-green-600 dark:hover:text-green-400 transition"
                      title="Rename chat"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteModal({ isOpen: true, id: c._id, title: c.title });
                      }}
                      className="p-1 hover:text-red-600 dark:hover:text-red-400 transition"
                      title="Delete chat"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {conversations.length > 0 && (
          <div className="p-3 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setClearAllModal(true)}
              className="w-full text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 py-2 rounded-lg transition font-medium text-center"
            >
              Clear all chats
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden flex">
          <div className="w-72 bg-white dark:bg-gray-900 h-full flex flex-col shadow-2xl animate-slideRight">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <span className="font-bold text-sm text-gray-900 dark:text-gray-100">Chat History</span>
              <button onClick={() => setMobileDrawerOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                <X size={20} />
              </button>
            </div>
            <div className="p-3">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl text-xs font-semibold"
              >
                <Plus size={16} />
                <span>New Chat</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {conversations.map((c) => (
                <div
                  key={c._id}
                  onClick={() => handleSelectChat(c._id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer ${
                    c._id === currentConversationId ? 'bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 font-semibold' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="truncate">{c.title}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Menu size={20} />
            </button>
            <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400 shadow-xs">
              <GeminiIcon size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-gray-100 text-base leading-tight">Ask Gemini</h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                <ShieldCheck size={12} className="text-green-600 dark:text-green-400" />
                Your chats are saved and stored securely for your review.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleNewChat}
                className="hidden sm:flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl transition font-medium"
              >
                <RotateCcw size={14} /> New chat
              </button>
            )}
          </div>
        </div>

        {/* Message List Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/20 dark:bg-gray-950/20">
          {loadingChat ? (
            <SharedLoader message="Loading conversation..." />
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-950/50 flex items-center justify-center mb-4 text-green-600 dark:text-green-400 shadow-sm border border-green-200 dark:border-green-800">
                <GeminiIcon size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">How can I help you today?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-6 max-w-sm">
                I can't see school records or attendance data. Don't paste personal or sensitive information.
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-xl">
                {(SUGGESTIONS[user.role] || SUGGESTIONS.student).map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-950/50 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-full transition shadow-xs font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] md:max-w-2xl px-5 py-3 rounded-2xl text-sm whitespace-pre-wrap break-words shadow-xs ${
                    m.role === 'user'
                      ? 'bg-green-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-xs border border-gray-200/80 dark:border-gray-700/80'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))
          )}

          {sending && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-bl-xs flex gap-1.5 shadow-xs">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900 flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={2000}
            placeholder="Ask anything... (Enter to send, Shift+Enter for a new line)"
            className="flex-1 resize-none max-h-32 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 shadow-inner"
          />
          <button
            onClick={() => send(input)}
            disabled={sending || !input.trim()}
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl disabled:opacity-50 transition shadow-md flex items-center justify-center shrink-0"
            aria-label="Send"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Rename Modal */}
      {renameModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleRenameSubmit} className="bg-white dark:bg-gray-900 rounded-xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 animate-scaleIn">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Rename Chat</h3>
            <input
              type="text"
              value={renameModal.title}
              onChange={(e) => setRenameModal({ ...renameModal, title: e.target.value })}
              maxLength={80}
              required
              className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 mb-5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRenameModal({ isOpen: false, id: null, title: '' })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Single Chat Confirm Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Chat"
        message={`Are you sure you want to delete "${deleteModal.title}"?`}
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, title: '' })}
      />

      {/* Clear All Chats Confirm Modal */}
      <ConfirmModal
        isOpen={clearAllModal}
        title="Clear All Chat History"
        message="Are you sure you want to delete all your saved conversations? This cannot be undone."
        confirmText="Clear All"
        confirmColor="bg-red-600 hover:bg-red-700"
        onConfirm={handleClearAllConfirm}
        onCancel={() => setClearAllModal(false)}
      />
    </div>
  );
};

export default AskGemini;
