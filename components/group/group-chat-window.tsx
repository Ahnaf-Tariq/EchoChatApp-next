"use client";
import { useEffect, useState, useRef } from "react";
import { useGroupChat } from "@/hooks/useGroupChat";
import { useChat } from "@/context/ChatContext";
import { auth } from "@/lib/firebase.config";
import { GroupMessage } from "@/types/interfaces";
import {
  IoPeople,
  IoEllipsisVertical,
  IoImage,
  IoMic,
  IoSend,
} from "react-icons/io5";
import { formatDistanceToNow } from "date-fns";

interface GroupChatWindowProps {
  group: any; // Using any for now to avoid type conflicts
}

export default function GroupChatWindow({ group }: GroupChatWindowProps) {
  const { messages, listenMessages, sendMessage } = useGroupChat();
  const { selectedGroup } = useChat();
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!group?.id) return;

    const unsubscribe = listenMessages(group.id);
    return () => unsubscribe();
  }, [group?.id, listenMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !group?.id) return;

    try {
      await sendMessage(group.id, inputMessage.trim());
      setInputMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && group?.id) {
      // TODO: Implement image upload to Cloudinary
      console.log("Image upload:", file);
    }
  };

  const handleVoiceRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording
    if (!isRecording) {
      console.log("Started recording");
    } else {
      console.log("Stopped recording");
    }
  };

  const formatTime = (timestamp: number) => {
    try {
      return formatDistanceToNow(timestamp, { addSuffix: true });
    } catch {
      return "";
    }
  };

  if (!group) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <IoPeople size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Select a group to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Group Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {group.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{group.name}</h2>
            <p className="text-sm text-gray-500">
              {group.memberDetails?.length || group.members.length} members
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <IoEllipsisVertical size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <IoPeople size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message: GroupMessage) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === auth.currentUser?.uid
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === auth.currentUser?.uid
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-900 border border-gray-200"
                }`}
              >
                {message.senderId !== auth.currentUser?.uid && (
                  <div className="text-xs font-medium text-green-600 mb-1">
                    {message.senderName || "Unknown User"}
                  </div>
                )}

                {message.type === "text" && (
                  <p className="text-sm">{message.text}</p>
                )}

                {message.type === "image" && message.imageUrl && (
                  <img
                    src={message.imageUrl}
                    alt="Shared image"
                    className="max-w-full rounded"
                  />
                )}

                {message.type === "audio" && message.audioUrl && (
                  <div className="flex items-center gap-2">
                    <audio controls className="max-w-full">
                      <source src={message.audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}

                <div
                  className={`text-xs mt-1 ${
                    message.senderId === auth.currentUser?.uid
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
          >
            <IoImage size={20} />
          </button>

          <button
            onClick={handleVoiceRecording}
            className={`p-2 rounded-full transition-colors ${
              isRecording
                ? "text-red-500 bg-red-50"
                : "text-gray-500 hover:text-blue-500 hover:bg-blue-50"
            }`}
          >
            <IoMic size={20} />
          </button>

          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <IoSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
