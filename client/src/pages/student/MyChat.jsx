import ChatPanel from '../../components/chat/ChatPanel';
import { useAuth } from '../../context/AuthContext';

const MyChat = () => {
  const { user } = useAuth();

  if (!user.instructorGroup) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center text-gray-500 dark:text-gray-400">
        You're not assigned to a group yet, so there's no chat to show.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Group Chat</h2>
      <ChatPanel groupId={user.instructorGroup} />
    </div>
  );
};

export default MyChat;
