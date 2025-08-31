"use client";
import { useEffect, useState, useRef } from "react";
import { useGroupChat } from "@/hooks/useGroupChat";
import { auth } from "@/lib/firebase.config";
import { db } from "@/lib/firebase.config";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { Group, GroupMessage } from "@/types/interfaces";
import {
  IoPeople,
  IoEllipsisVertical,
  IoSend,
  IoArrowBack,
} from "react-icons/io5";
import {
  MdDoneAll,
  MdKeyboardVoice,
  MdPause,
  MdPlayArrow,
  MdStop,
} from "react-icons/md";
import { useChat } from "@/context/ChatContext";
import EmojiModal from "../emoji-modal";
import { cn } from "@/lib/utils";
import { RiGalleryLine } from "react-icons/ri";
import Image from "next/image";

interface GroupChatProps {
  group: Group;
}

export default function GroupChat({ group }: GroupChatProps) {
  const {
    messages,
    inputMessage,
    handleInputChange,
    listenMessages,
    sendMessage,
    uploading,
    isRecording,
    playingAudio,
    isPaused,
    fileInputRef,
    handleImageUpload,
    startRecording,
    stopRecording,
    toggleAudio,
    showMentions,
    mentionQuery,
    taggedUsers,
    setTaggedUsers,
    groupMembers,
    setInputMessage,
    setShowMentions,
  } = useGroupChat();
  const { selectedGroup, setSelectedGroup } = useChat();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [menuOption, setMenuOption] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!group?.id) return;

    const unsubscribe = listenMessages(group.id);

    return () => unsubscribe();
  }, [group?.id, selectedGroup]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !group?.id) return;

    try {
      await sendMessage(group.id, inputMessage.trim(), "text", taggedUsers);
      setInputMessage("");
      setTaggedUsers([]);
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

  const addEmoji = async (messageTimestamp: number, emoji: string) => {
    if (!auth.currentUser || !group?.id)
      throw new Error("No authenticated user or group");

    try {
      const message = messages.find((m) => m.timestamp === messageTimestamp);
      if (!message || !message.id) return;

      const msgRef = doc(db, "groups", group.id, "messages", message.id);
      const msgSnap = await getDoc(msgRef);
      if (!msgSnap.exists()) return;

      const messageData = msgSnap.data() as GroupMessage;
      const reactions = { ...(messageData.reactions || {}) };

      Object.keys(reactions).forEach((e) => {
        reactions[e] = reactions[e].filter(
          (uid) => uid !== auth.currentUser!.uid
        );
        if (reactions[e].length === 0) delete reactions[e];
      });

      const alreadyReacted = messageData.reactions?.[emoji]?.includes(
        auth.currentUser!.uid
      );
      if (!alreadyReacted) {
        reactions[emoji] = reactions[emoji] || [];
        reactions[emoji].push(auth.currentUser!.uid);
      }

      await updateDoc(msgRef, { reactions });
    } catch (error) {
      console.error("Error adding emoji:", error);
    }
  };

  const deleteEmoji = async (messageTimestamp: number, emoji: string) => {
    if (!auth.currentUser || !group?.id)
      throw new Error("No authenticated user or group");

    try {
      const message = messages.find((m) => m.timestamp === messageTimestamp);
      if (!message || !message.id) return;

      const msgRef = doc(db, "groups", group.id, "messages", message.id);
      const msgSnap = await getDoc(msgRef);
      if (!msgSnap.exists()) return;

      const messageData = msgSnap.data() as GroupMessage;
      const reactions = { ...(messageData.reactions || {}) };

      if (reactions[emoji]) {
        reactions[emoji] = reactions[emoji].filter(
          (uid) => uid !== auth.currentUser!.uid
        );
        if (reactions[emoji].length === 0) delete reactions[emoji];
      }

      await updateDoc(msgRef, { reactions });
    } catch (error) {
      console.error("Error deleting emoji:", error);
    }
  };

  const deleteMessage = async (messageTimestamp: number) => {
    if (!auth.currentUser || !group?.id)
      throw new Error("No authenticated user or group");

    try {
      const message = messages.find((m) => m.timestamp === messageTimestamp);
      if (!message || !message.id) return;

      if (message.senderId !== auth.currentUser.uid) return;

      await deleteDoc(doc(db, "groups", group.id, "messages", message.id));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const getReactionCounts = (message: GroupMessage) => {
    if (!message.reactions) return [];

    return Object.entries(message.reactions)
      .map(([emoji, userIds]) => ({
        emoji,
        count: userIds.length,
        hasReacted: userIds.includes(auth.currentUser?.uid || ""),
      }))
      .filter((reaction) => reaction.count > 0);
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
    <div className="flex-1 h-[550px] flex flex-col bg-white">
      {/* Group Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedGroup(null)}
            className="sm:hidden p-1 hover:bg-gray-100 rounded-full cursor-pointer"
          >
            <IoArrowBack className="size-5 text-gray-600" />
          </button>
          <div className="w-10 h-10 hidden bg-gradient-to-br from-blue-500 to-purple-600 rounded-full sm:flex items-center justify-center text-white font-semibold">
            {group.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{group.name}</h2>
            <p className="text-sm text-gray-500">
              {group.members.length} members
            </p>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
          <IoEllipsisVertical size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <IoPeople size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message: GroupMessage) => {
            const isOwnMessage = message.senderId === auth.currentUser?.uid;
            const reactionCounts = getReactionCounts(message);
            const messageId = message.id || message.timestamp.toString();

            return (
              <div
                key={messageId}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className="relative group max-w-xs lg:max-w-md"
                  onMouseEnter={() => setMenuOption(messageId)}
                  onMouseLeave={() => {
                    if (!showEmojiPicker) {
                      setMenuOption(null);
                    }
                  }}
                >
                  {/* Emoji Modal */}
                  {menuOption === messageId && (
                    <EmojiModal
                      isOwnMessage={isOwnMessage}
                      messageTimestamp={message.timestamp}
                      reactions={message.reactions}
                      addEmoji={addEmoji}
                      deleteEmoji={deleteEmoji}
                      deleteMessage={deleteMessage}
                      menuOption={menuOption === messageId}
                      setmenuOption={(show) =>
                        setMenuOption(show ? messageId : null)
                      }
                      showEmojiPicker={showEmojiPicker}
                      setShowEmojiPicker={setShowEmojiPicker}
                    />
                  )}

                  {/* Message Content */}
                  <div
                    className={cn(
                      "rounded-2xl",
                      message.type === "image" && "bg-white p-2",
                      message.type !== "image" &&
                        (isOwnMessage
                          ? "bg-blue-500 text-white rounded-br-sm p-3"
                          : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm p-3")
                    )}
                  >
                    {/* Sender name for group messages (non-own messages) */}
                    {!isOwnMessage && (
                      <div className="text-xs font-medium text-green-600 mb-1">
                        {message.senderName || "Unknown User"}
                      </div>
                    )}

                    {message.type === "text" && message.text && (
                      <p className="text-sm break-words">
                        {message.text.split(/(@\w+)/g).map((text, i) =>
                          text.startsWith("@") ? (
                            <span
                              key={i}
                              className={cn(
                                "font-medium cursor-pointer hover:underline",
                                isOwnMessage
                                  ? "text-green-300"
                                  : "text-green-400"
                              )}
                            >
                              {text}
                            </span>
                          ) : (
                            text
                          )
                        )}
                      </p>
                    )}

                    {message.type === "image" && message.imageUrl && (
                      <Image
                        src={message.imageUrl}
                        alt="group image"
                        className="rounded-lg object-cover w-full max-w-[160px] sm:max-w-[180px] md:max-w-[220px] h-auto min-h-[120px] max-h-[200px] sm:max-h-[250px]"
                        width={400}
                        height={400}
                      />
                    )}

                    {message.type === "audio" && message.audioUrl && (
                      <div className="flex items-center gap-3 min-w-[150px]">
                        <button
                          onClick={() => toggleAudio(message.audioUrl!)}
                          className={cn(
                            "p-2 rounded-full cursor-pointer transition-colors",
                            isOwnMessage
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-gray-200 hover:bg-gray-300"
                          )}
                        >
                          {playingAudio === message.audioUrl && !isPaused ? (
                            <MdPause
                              className={cn(
                                "size-4",
                                isOwnMessage ? "text-white" : "text-gray-600"
                              )}
                            />
                          ) : (
                            <MdPlayArrow
                              className={cn(
                                "size-4",
                                isOwnMessage ? "text-white" : "text-gray-600"
                              )}
                            />
                          )}
                        </button>
                        <div className="flex-1">
                          <div
                            className={cn(
                              "h-1 rounded-full",
                              isOwnMessage ? "bg-blue-300" : "bg-gray-300"
                            )}
                          >
                            <div
                              className={cn(
                                "h-full w-2/3 rounded-full",
                                isOwnMessage ? "bg-white" : "bg-blue-500"
                              )}
                            ></div>
                          </div>
                          <p
                            className={cn(
                              "text-xs mt-1",
                              isOwnMessage ? "text-blue-100" : "text-gray-500"
                            )}
                          >
                            Voice message
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-1 mt-1">
                      <div
                        className={cn(
                          "text-xs",
                          message.type === "image"
                            ? "text-gray-400"
                            : isOwnMessage
                            ? "text-blue-100"
                            : "text-gray-500"
                        )}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                      {isOwnMessage && (
                        <MdDoneAll
                          className={cn(
                            "size-4",
                            isOwnMessage ? "text-green-300" : "text-gray-400"
                          )}
                        />
                      )}
                    </div>
                  </div>

                  {/* Reactions */}
                  {reactionCounts.length > 0 && (
                    <div
                      className={cn(
                        "flex flex-wrap gap-1 mt-1",
                        isOwnMessage ? "justify-end" : "justify-start"
                      )}
                    >
                      {reactionCounts.map((reaction) => (
                        <div
                          key={reaction.emoji}
                          onClick={() =>
                            deleteEmoji(message.timestamp, reaction.emoji)
                          }
                          className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-full text-xs cursor-pointer border",
                            reaction.hasReacted
                              ? "bg-blue-100 border-blue-300"
                              : "bg-gray-100 border-gray-300"
                          )}
                        >
                          <span>{reaction.emoji}</span>
                          <span className="text-gray-600">
                            {reaction.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        {isRecording && (
          <div className="flex items-center justify-center gap-2 mb-3 p-2 bg-red-50 rounded-lg">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-600 font-medium">Recording...</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={(e) => handleImageUpload(group, e)}
            hidden
            disabled={uploading || isRecording}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isRecording}
            className={cn(
              "p-2 sm:p-3 rounded-lg",
              uploading || isRecording
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:text-blue-500 hover:bg-gray-100 cursor-pointer"
            )}
            title="Upload Image"
          >
            <RiGalleryLine className="size-5" />
          </button>

          <div className="flex-1 relative">
            <input
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              type="text"
              placeholder="Type your message..."
              disabled={isRecording}
              className="w-full px-2 sm:px-4 py-1 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
            />
            {showMentions && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto scrollbar-hide z-50">
                {group.members
                  .map((uid) => groupMembers.find((m) => m.id === uid))
                  .filter(
                    (m) => m && m.username.toLowerCase().includes(mentionQuery)
                  )
                  .map((m) => (
                    <div
                      key={m!.id}
                      onClick={() => {
                        const newText = inputMessage.replace(
                          /@\w*$/,
                          `@${m!.username} `
                        );
                        setInputMessage(newText);

                        setTaggedUsers((prev) =>
                          prev.includes(m!.id) ? prev : [...prev, m!.id]
                        );

                        setShowMentions(false);
                      }}
                      className="p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 flex items-center gap-3"
                    >
                      @{m!.username}
                    </div>
                  ))}
              </div>
            )}
          </div>

          <button
            onClick={() =>
              isRecording ? stopRecording() : startRecording(group)
            }
            disabled={uploading}
            className={cn(
              "p-2 sm:p-3 rounded-lg transition-all duration-200",
              isRecording
                ? "bg-red-500 hover:bg-red-600 text-white"
                : uploading
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:text-blue-500 hover:bg-gray-100 cursor-pointer"
            )}
            title={isRecording ? "Stop Recording" : "Start Voice Recording"}
          >
            {isRecording ? (
              <MdStop className="size-5" />
            ) : (
              <MdKeyboardVoice className="size-5" />
            )}
          </button>

          <button
            onClick={handleSendMessage}
            disabled={isRecording}
            className={cn(
              "p-2 sm:p-3 rounded-lg sm:rounded-xl transition-colors text-white",
              isRecording
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
            )}
          >
            <IoSend className="size-3 sm:size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
