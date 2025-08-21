"use client";
import { auth } from "@/app/firebase/config";
import { useEffect, useRef, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  MdDelete,
  MdDoneAll,
  MdOutlineEmojiEmotions,
  MdPause,
  MdPlayArrow,
} from "react-icons/md";

interface Message {
  senderId: string;
  receiverId: string;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  type: "text" | "image" | "audio";
  timestamp: number;
  reactions?: { [emoji: string]: string[] };
  hasUserSeen: boolean;
}

interface ChatsMsgsProps {
  msg: Message;
  playingAudio: string | null;
  isPaused: boolean;
  toggleAudio: (audioUrl: string) => void;
  deleteMsg: (timestamp: number) => void;
  addEmoji: (timestamp: number, emoji: string) => void;
  deleteEmoji: (timestamp: number, emoji: string) => void;
}

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const ChatsMsgs = ({
  msg,
  playingAudio,
  isPaused,
  toggleAudio,
  deleteMsg,
  addEmoji,
  deleteEmoji,
}: ChatsMsgsProps) => {
  const [menuOption, setmenuOption] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactEmoji, setReactEmoji] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isOwnMessage = msg.senderId === auth.currentUser?.uid;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setmenuOption(false);
        setShowEmojiPicker(false);
        setReactEmoji(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOption]);

  const handleEmojiClick = (emoji: string) => {
    if (msg.reactions && msg.reactions[emoji]) {
      deleteEmoji(msg.timestamp, emoji);
    } else {
      addEmoji(msg.timestamp, emoji);
    }

    setShowEmojiPicker(false);
    setmenuOption(false);
    setReactEmoji(false);
  };

  const handleDeleteClick = () => {
    deleteMsg(msg.timestamp);
    setmenuOption(false);
    setReactEmoji(false);
  };

  // Get reaction counts
  const getReactionCounts = () => {
    if (!msg.reactions) return [];

    return Object.entries(msg.reactions)
      .map(([emoji, userIds]) => ({
        emoji,
        count: userIds.length,
        hasReacted: userIds.includes(auth.currentUser?.uid || ""),
      }))
      .filter((reaction) => reaction.count > 0);
  };

  const reactionCounts = getReactionCounts();

  return (
    <div
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className="relative group max-w-xs lg:max-w-md"
        onMouseEnter={() => setmenuOption(true)}
        onMouseLeave={() => {
          if (!showEmojiPicker) {
            setmenuOption(false);
          }
        }}
      >
        {/* Three dots menu */}
        {menuOption && (
          <div
            ref={menuRef}
            className={`absolute top-[2px] ${
              isOwnMessage
                ? "left-0 -translate-x-full"
                : "right-0 translate-x-full"
            } z-50`}
          >
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer"
              >
                <BsThreeDotsVertical className="size-4 text-gray-600" />
              </button>

              {/* Options Menu */}
              {showEmojiPicker && (
                <div
                  className={`absolute top-8 ${
                    isOwnMessage ? "right-0" : "left-0"
                  } bg-white rounded-lg shadow-lg border p-1 z-20`}
                >
                  <div className="flex flex-col gap-1">
                    {/* Emoji Button */}
                    <div className="relative">
                      <button
                        onClick={() => setReactEmoji(!reactEmoji)}
                        className="flex items-center gap-2 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-md w-full text-left cursor-pointer"
                      >
                        <MdOutlineEmojiEmotions className="size-4" />
                        React
                      </button>

                      {/* Emoji Options */}
                      {reactEmoji && (
                        <div
                          className={`absolute bottom-[34px] ${
                            isOwnMessage
                              ? "right-[-120px] sm:right-0"
                              : "left-[-105px] sm:left-0"
                          } bg-white rounded-lg shadow-lg border p-1 flex gap-1`}
                        >
                          {EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleEmojiClick(emoji)}
                              className="text-lg hover:bg-gray-100 rounded p-1 cursor-pointer transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Delete Button - only for own messages */}
                    {isOwnMessage && (
                      <button
                        onClick={handleDeleteClick}
                        className="flex items-center gap-2 px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                      >
                        <MdDelete className="size-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message Content */}
        <div
          className={`rounded-2xl ${
            msg.type === "image"
              ? "bg-white p-2"
              : isOwnMessage
              ? "bg-blue-500 text-white rounded-br-sm p-3"
              : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm p-3"
          }`}
        >
          {/* Text Message */}
          {(msg.type === "text" || (!msg.type && msg.text)) && (
            <p className="text-sm break-words">{msg.text}</p>
          )}

          {/* Image msg */}
          {msg.type === "image" && msg.imageUrl && (
            <img
              src={msg.imageUrl}
              alt="chat image"
              className="rounded-lg object-cover w-full max-w-[160px] sm:max-w-[180px] md:max-w-[220px] h-auto min-h-[120px] max-h-[200px] sm:max-h-[250px]"
            />
          )}

          {/* voice msg */}
          {msg.type === "audio" && msg.audioUrl && (
            <div className="flex items-center gap-3 min-w-[150px]">
              <button
                onClick={() => toggleAudio(msg.audioUrl!)}
                className={`p-2 rounded-full cursor-pointer ${
                  isOwnMessage
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-200 hover:bg-gray-300"
                } transition-colors`}
              >
                {playingAudio === msg.audioUrl && !isPaused ? (
                  <MdPause
                    className={`size-4 ${
                      isOwnMessage ? "text-white" : "text-gray-600"
                    }`}
                  />
                ) : (
                  <MdPlayArrow
                    className={`size-4 ${
                      isOwnMessage ? "text-white" : "text-gray-600"
                    }`}
                  />
                )}
              </button>
              <div className="flex-1">
                <div
                  className={`h-1 rounded-full ${
                    isOwnMessage ? "bg-blue-300" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`h-full w-2/3 rounded-full ${
                      isOwnMessage ? "bg-white" : "bg-blue-500"
                    }`}
                  ></div>
                </div>
                <p
                  className={`text-xs mt-1 ${
                    isOwnMessage ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  Voice message
                </p>
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center justify-between gap-1 mt-1">
            <p
              className={`text-xs ${
                msg.type === "image"
                  ? "text-gray-400"
                  : isOwnMessage
                  ? "text-blue-100"
                  : "text-gray-500"
              }`}
            >
              {new Date(msg.timestamp).toLocaleTimeString()}
            </p>
            {isOwnMessage && (
              <MdDoneAll
                className={`size-4 ${
                  msg.hasUserSeen ? "text-green-500" : "text-gray-400"
                }`}
              />
            )}
          </div>
        </div>

        {/* Reactions Display */}
        {reactionCounts.length > 0 && (
          <div
            className={`flex flex-wrap gap-1 mt-1 ${
              isOwnMessage ? "justify-end" : "justify-start"
            }`}
          >
            {reactionCounts.map((reaction) => (
              <div
                key={reaction.emoji}
                onClick={() => deleteEmoji(msg.timestamp, reaction.emoji)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs cursor-pointer border ${
                  reaction.hasReacted
                    ? "bg-blue-100 border-blue-300"
                    : "bg-gray-100 border-gray-300"
                }`}
              >
                <span>{reaction.emoji}</span>
                <span className="text-gray-600">{reaction.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsMsgs;
