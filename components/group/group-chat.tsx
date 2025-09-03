"use client";
import { useEffect, useState, useRef, KeyboardEvent } from "react";
import { useGroupChat } from "@/hooks/useGroupChat";
import { auth } from "@/lib/firebase.config";
import { db } from "@/lib/firebase.config";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
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
import { Group, GroupMessage } from "@/types/group.interfaces";
import { useCommonTranslations } from "@/hooks/useTranslations";
import { User } from "@/types/chat.interfaces";
import { MessageType, TabType } from "@/types/enums";

interface GroupChatProps {
  group: Group;
}

export default function GroupChat({ group }: GroupChatProps) {
  const {
    messages,
    textMessage,
    setTextMessage,
    handleInputChange,
    listenMessages,
    sendMessage,
    isUploading,
    isRecording,
    playingAudio,
    isPaused,
    fileRef,
    handleImageUpload,
    startRecording,
    stopRecording,
    toggleAudio,
    showMentions,
    mentionQuery,
    taggedUsers,
    setTaggedUsers,
    groupMembers,
    setShowMentions,
  } = useGroupChat();
  const {
    setSelectedUser,
    selectedGroup,
    setSelectedGroup,
    getFirstLetterCapitalized,
    setActiveTab,
  } = useChat();
  const { t } = useCommonTranslations();
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
    if (!textMessage.trim() || !group?.id) return;

    setTextMessage("");

    try {
      await sendMessage(group.id, textMessage.trim(), taggedUsers);
      setTaggedUsers([]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
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
    <div className="flex-1 h-[550px] flex flex-col border-r border-gray-800">
      {/* Group Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#4f545c] bg-[#2f3136]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedGroup(null)}
            className="sm:hidden p-1 hover:bg-[#3c3f44] rounded-full cursor-pointer transition-colors"
          >
            <IoArrowBack className="size-5 text-[#b9bbbe]" />
          </button>
          <div className="w-10 h-10 hidden bg-gradient-to-br from-blue-500 to-purple-600 rounded-full sm:flex items-center justify-center text-white font-semibold">
            {getFirstLetterCapitalized(group.name)}
          </div>
          <div>
            <h2 className="font-semibold text-white">{group.name}</h2>
            <p className="text-sm text-[#b9bbbe]">
              {group.members.length} {t("chat.members")}
            </p>
          </div>
        </div>
        <button className="p-1 hover:bg-[#3c3f44] rounded-full cursor-pointer transition-colors">
          <IoEllipsisVertical
            size={20}
            className="text-[#b9bbbe] hover:text-white"
          />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-1 bg-[#36393f]">
        {messages.length === 0 ? (
          <div className="text-center text-[#72767d] py-8">
            <IoPeople size={48} className="mx-auto mb-4 text-[#4f545c]" />
            <p>{t("chat.no_messages")}</p>
          </div>
        ) : (
          messages.map((message: GroupMessage) => {
            const isOwnMessage = message.senderId === auth.currentUser?.uid;
            const reactionCounts = getReactionCounts(message);
            const messageId = message.id || message.timestamp.toString();

            return (
              <div
                key={messageId}
                className="flex mb-1 px-2 py-1 hover:bg-[#32353b] group"
                onMouseEnter={() => setMenuOption(messageId)}
                onMouseLeave={() => {
                  if (!showEmojiPicker) {
                    setMenuOption(null);
                  }
                }}
              >
                <div className="relative max-w-[70%] -space-y-1">
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

                  <div
                    className={cn(
                      "flex gap-3",
                      message.type !== MessageType.IMAGE &&
                        "border border-gray-600 p-2 rounded-xl"
                    )}
                  >
                    {!isOwnMessage && message.type !== MessageType.AUDIO && (
                      <div className="w-6 h-6 bg-[#5865f2] rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        {getFirstLetterCapitalized(message.senderName)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-[#5865f2] capitalize text-sm">
                          {message.senderId !== auth.currentUser?.uid
                            ? message.senderName
                            : "You"}
                        </span>
                        {!isOwnMessage && (
                          <span className="text-[#72767d] text-xs">
                            {new Date(message.timestamp).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Message Content */}
                      <div className="relative">
                        {message.type === "text" && message.text && (
                          <p className="text-[#dcddde] text-sm break-words leading-relaxed">
                            {message.text.split(/(@\w+)/g).map((text, i) =>
                              text.startsWith("@") ? (
                                <span
                                  key={i}
                                  onClick={() => {
                                    setSelectedUser(
                                      groupMembers.find(
                                        (member) =>
                                          member.id ===
                                          message.taggedUsers?.[
                                            message
                                              .text!.split(/(@\w+)/g)
                                              .filter((t) => t.startsWith("@"))
                                              .indexOf(text)
                                          ]
                                      ) as User
                                    );
                                    setSelectedGroup(null);
                                    setActiveTab(TabType.USERS);
                                  }}
                                  className="font-medium cursor-pointer hover:underline text-[#5865f2]"
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
                          <div className="mt-1">
                            <Image
                              src={message.imageUrl}
                              alt="group image"
                              className="rounded-lg object-cover max-w-[160px] sm:max-w-[180px] md:max-w-[220px] h-auto min-h-[120px] max-h-[200px] sm:max-h-[250px]"
                              width={400}
                              height={300}
                            />
                          </div>
                        )}

                        {message.type === "audio" && message.audioUrl && (
                          <div className="flex items-center gap-3 min-w-[200px] mt-1">
                            <button
                              onClick={() => toggleAudio(message.audioUrl!)}
                              className="p-2 bg-[#5865f2] hover:bg-[#4752c4] rounded-full cursor-pointer transition-colors"
                            >
                              {playingAudio === message.audioUrl &&
                              !isPaused ? (
                                <MdPause className="size-4 text-white" />
                              ) : (
                                <MdPlayArrow className="size-4 text-white" />
                              )}
                            </button>
                            <div className="flex-1">
                              <div className="h-1 bg-[#4f545c] rounded-full">
                                <div className="h-full w-2/3 bg-[#5865f2] rounded-full"></div>
                              </div>
                              <p className="text-[#72767d] text-xs mt-1">
                                Voice message
                              </p>
                            </div>
                          </div>
                        )}

                        {isOwnMessage && (
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-[#72767d] text-xs">
                              {new Date(message.timestamp).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </span>
                            <MdDoneAll className="size-3 text-[#3ba55c]" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {reactionCounts.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {reactionCounts.map((reaction) => (
                        <div
                          key={reaction.emoji}
                          onClick={() =>
                            deleteEmoji(message.timestamp, reaction.emoji)
                          }
                          className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-full text-xs cursor-pointer border transition-colors",
                            reaction.hasReacted
                              ? "bg-[#5865f2] border-[#5865f2] text-white"
                              : "bg-[#2f3136] border-[#4f545c] text-[#b9bbbe] hover:border-[#5865f2]"
                          )}
                        >
                          <span>{reaction.emoji}</span>
                          <span>{reaction.count}</span>
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

      {/* Message Inputs */}
      <div className="bg-[#2f3136] border-t border-[#4f545c] p-4">
        {isRecording && (
          <div className="flex items-center justify-center gap-2 mb-3 p-3 bg-[#ed4245] bg-opacity-10 rounded-lg border border-[#ed4245] border-opacity-30">
            <div className="w-3 h-3 bg-[#ed4245] rounded-full animate-pulse"></div>
            <span className="text-[#ed4245] font-medium text-sm">
              Recording...
            </span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileRef}
            accept="image/*"
            onChange={(e) => handleImageUpload(group, e)}
            hidden
            disabled={isUploading || isRecording}
          />

          <button
            onClick={() => fileRef.current?.click()}
            disabled={isUploading || isRecording}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isUploading || isRecording
                ? "text-[#72767d] cursor-not-allowed"
                : "text-[#b9bbbe] hover:text-white hover:bg-[#3c3f44] cursor-pointer"
            )}
            title="Upload Image"
          >
            <RiGalleryLine className="size-5" />
          </button>

          <div className="flex-1 relative">
            <input
              value={textMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              type="text"
              placeholder={t("chat.type_message")}
              disabled={isRecording}
              className="w-full px-4 py-3 bg-[#40444b] border-0 rounded-lg text-white placeholder-[#72767d] focus:outline-none focus:ring-1 focus:ring-[#5865f2] transition-all duration-200 disabled:opacity-50 text-sm"
            />
            {showMentions && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#2f3136] border border-[#4f545c] rounded-lg shadow-lg max-h-40 overflow-y-auto discord-scrollbar z-50">
                {group.members
                  .map((memberId) =>
                    groupMembers.find((member) => member.id === memberId)
                  )
                  .filter(
                    (member) =>
                      member &&
                      member.username.toLowerCase().includes(mentionQuery)
                  )
                  .map((member) => (
                    <div
                      key={member!.id}
                      onClick={() => {
                        const newText = textMessage.replace(
                          /@\w*$/,
                          `@${member!.username} `
                        );
                        setTextMessage(newText);

                        setTaggedUsers((prev) =>
                          prev.includes(member!.id)
                            ? prev
                            : [...prev, member!.id]
                        );

                        setShowMentions(false);
                      }}
                      className="p-3 cursor-pointer border-b border-[#4f545c] last:border-b-0 hover:bg-[#3c3f44] flex items-center gap-3 text-white"
                    >
                      @{member!.username}
                    </div>
                  ))}
              </div>
            )}
          </div>

          <button
            onClick={() =>
              isRecording ? stopRecording() : startRecording(group)
            }
            disabled={isUploading}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              isRecording
                ? "bg-[#ed4245] hover:bg-[#c03e3f] text-white"
                : isUploading
                ? "text-[#72767d] cursor-not-allowed"
                : "text-[#b9bbbe] hover:text-white hover:bg-[#3c3f44] cursor-pointer"
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
              "p-2 rounded-lg transition-colors",
              isRecording
                ? "bg-[#72767d] cursor-not-allowed"
                : "bg-[#5865f2] hover:bg-[#4752c4] cursor-pointer"
            )}
          >
            <IoSend className="size-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
