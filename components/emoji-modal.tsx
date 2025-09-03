"use client";
import { useState, useEffect, useRef } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdDelete, MdOutlineEmojiEmotions } from "react-icons/md";
import { EmojiModalProps } from "@/types/chat.interfaces";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const EmojiModal = ({
  isOwnMessage,
  messageTimestamp,
  reactions = {},
  addEmoji,
  deleteEmoji,
  deleteMessage,
  menuOption,
  setmenuOption,
  showEmojiPicker,
  setShowEmojiPicker,
}: EmojiModalProps) => {
  const [reactEmoji, setReactEmoji] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
  }, [menuOption, showEmojiPicker]);

  const handleEmojiClick = (emoji: string) => {
    if (reactions && reactions[emoji]) {
      deleteEmoji(messageTimestamp, emoji);
    } else {
      addEmoji(messageTimestamp, emoji);
    }

    setShowEmojiPicker(false);
    setmenuOption(false);
    setReactEmoji(false);
  };

  const handleDeleteClick = () => {
    deleteMessage(messageTimestamp);
    setmenuOption(false);
    setReactEmoji(false);
  };
  return (
    <div
      ref={menuRef}
      className="absolute top-1/2 -translate-y-1/2 z-50 right-0 translate-x-full"
    >
      <div className="relative">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 rounded-full cursor-pointer"
        >
          <BsThreeDotsVertical className="size-4 text-gray-500" />
        </button>

        {showEmojiPicker && (
          <div className="absolute top-8 bg-[#36393f] rounded-lg shadow-md border border-gray-400 p-1 z-20 left-0">
            <div className="flex flex-col gap-1">
              <div className="relative">
                <button
                  onClick={() => setReactEmoji(!reactEmoji)}
                  className="flex items-center gap-2 px-2 py-1 text-sm text-white hover:bg-[#2f3136] rounded-md w-full text-left cursor-pointer"
                >
                  <MdOutlineEmojiEmotions className="size-4" />
                  React
                </button>

                {reactEmoji && (
                  <div className="absolute bottom-[34px] bg-[#36393f] rounded-lg shadow-lg border border-gray-400 p-1 flex gap-1 left-[-105px] sm:left-0">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiClick(emoji)}
                        className="text-lg hover:bg-[#2f3136] rounded p-1 cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isOwnMessage && (
                <button
                  onClick={handleDeleteClick}
                  className="flex items-center gap-2 px-2 py-1 text-sm text-red-600 hover:bg-[#2f3136] rounded-md cursor-pointer"
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
  );
};

export default EmojiModal;
