"use client";
import { auth, db } from "@/app/firebase/config";
import { AppContext } from "@/context/Context";
import { formatDistanceToNow } from "date-fns";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react";
import { BsExclamationCircle } from "react-icons/bs";
import { IoSend } from "react-icons/io5";

interface Message {
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
}

const RightSideChat = () => {
  const { selectedUser } = useContext(AppContext);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const msgSendInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!selectedUser || !auth.currentUser) return;

    const currentUserId = auth.currentUser.uid;
    const receiverId = selectedUser.id;
    const chatId =
      currentUserId < receiverId
        ? `${currentUserId}_${receiverId}`
        : `${receiverId}_${currentUserId}`;

    const chatRef = doc(db, "chats", chatId);

    const unsub = onSnapshot(chatRef, (docSnap) => {
      if (docSnap.exists()) {
        setMessages(docSnap.data().chatData || []);
      } else {
        setMessages([]);
      }
    });

    return () => unsub();
  }, [selectedUser]);

  const sendMessage = async () => {
    if (!selectedUser || !auth.currentUser) return;

    if(!inputMessage.trim()){
      msgSendInputRef.current?.focus()
      return;
    }

    const currentUserId = auth.currentUser.uid;
    const receiverId = selectedUser.id;
    const chatId =
      currentUserId < receiverId
        ? `${currentUserId}_${receiverId}`
        : `${receiverId}_${currentUserId}`;

    const chatRef = doc(db, "chats", chatId);
    const chatSnap = await getDoc(chatRef);

    const newMsg: Message = {
      senderId: currentUserId,
      receiverId,
      text: inputMessage,
      timestamp: Date.now(),
    };

    if (chatSnap.exists()) {
      await updateDoc(chatRef, {
        chatData: arrayUnion(newMsg),
      });
    } else {
      await setDoc(chatRef, {
        chatData: [newMsg],
      });
    }

    setInputMessage("");
  };

   const handleKeyPress = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  // RightSideChat.tsx
  return (
    <div className="bg-gray-50 flex flex-col">
      {selectedUser ? (
        <>
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    className="w-10 h-10 rounded-full ring-2 ring-gray-100"
                    src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-unknown-social-media-user-photo-default-avatar-profile-icon-vector-unknown-social-media-user-184816085.jpg"
                    alt=""
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-800 capitalize">
                    {selectedUser?.username}
                  </h1>
                  <p className="text-sm text-gray-500">
                    Last seen:{" "}
                    {selectedUser.lastSeen
                      ? formatDistanceToNow(new Date(selectedUser.lastSeen), {
                          addSuffix: true,
                        })
                      : "recently"}
                  </p>
                </div>
              </div>
              <button className="cursor-pointer">
                <BsExclamationCircle className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 max-h-[450px] overflow-y-auto scrollbar-hide p-4 space-y-2">
            {messages.map((msg, ind) => (
              <div
                key={ind}
                className={`flex ${
                  msg.senderId === auth.currentUser?.uid
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                    msg.senderId === auth.currentUser?.uid
                      ? "bg-blue-500 text-white rounded-br-sm"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.senderId === auth.currentUser?.uid
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  ref={msgSendInputRef}
                  type="text"
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <button
                onClick={sendMessage}
                className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl cursor-pointer"
              >
                <IoSend className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      ) : (
        /* No User Selected State */
        <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Welcome to Chat
          </h1>
          <p className="text-gray-500 max-w-md">
            Select a conversation from the sidebar to start messaging, or search for someone new to chat with.
          </p>
        </div>
      )}
    </div>
  );
};

export default RightSideChat;
