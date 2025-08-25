"use client";
import { AppContext } from "@/context/Context";
import { formatDistanceToNow } from "date-fns";
import { useContext } from "react";
import { BsExclamationCircle } from "react-icons/bs";
import { IoArrowBack, IoChatboxEllipsesOutline, IoSend } from "react-icons/io5";
import { MdKeyboardVoice, MdStop } from "react-icons/md";
import { RiGalleryLine } from "react-icons/ri";
import ChatMessages from "./Chat-messages";
import Image from "next/image";
import useChatMessage from "@/hooks/useChatMessage";
import { cn } from "@/lib/utils";

const Chats = () => {
  const { selectedUser, setSelectedUser } = useContext(AppContext);
  const {
    inputMessage,
    messages,
    uploading,
    isRecording,
    playingAudio,
    isPaused,
    msgSendInputRef,
    fileInputRef,
    chatScrollRef,
    handleTyping,
    sendMessage,
    handleImageUpload,
    startRecording,
    stopRecording,
    toggleAudio,
    deleteMsg,
    addEmoji,
    deleteEmoji,
  } = useChatMessage();

  // Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-[550px] sm:h-[550px] bg-gray-50 flex flex-col">
      {selectedUser ? (
        <>
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="sm:hidden p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                >
                  <IoArrowBack className="size-5 text-gray-600" />
                </button>
                <div className="hidden sm:block relative">
                  <Image
                    className="rounded-full ring-2 ring-gray-100"
                    src="/assests/avatar.webp"
                    alt=""
                    width={40}
                    height={40}
                  />
                  {/* Active Status Dot */}
                  {selectedUser.active && (
                    <span className="absolute bottom-0 right-0 block size-3 rounded-full bg-green-500 ring-2 ring-white"></span>
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-800 capitalize">
                    {selectedUser?.username}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {selectedUser.active
                      ? "Active Now"
                      : `Last seen: ${formatDistanceToNow(
                          new Date(selectedUser.lastSeen),
                          {
                            addSuffix: true,
                          }
                        )}`}
                  </p>
                </div>
              </div>
              <button className="cursor-pointer">
                <BsExclamationCircle className="size-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 max-h-[450px] overflow-y-auto scrollbar-hide p-4 space-y-2">
            {messages.map((msg, ind) => (
              <div key={ind}>
                <ChatMessages
                  msg={msg}
                  playingAudio={playingAudio}
                  isPaused={isPaused}
                  toggleAudio={toggleAudio}
                  deleteMsg={deleteMsg}
                  addEmoji={addEmoji}
                  deleteEmoji={deleteEmoji}
                />
              </div>
            ))}

            <div ref={chatScrollRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            {/* Recording indicator */}
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
                onChange={handleImageUpload}
                hidden
                disabled={uploading || isRecording}
              />

              {/* Gallery Button */}
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

              {/* input message */}
              <div className="flex-1 relative">
                <input
                  value={inputMessage}
                  onChange={handleTyping}
                  onKeyDown={handleKeyPress}
                  ref={msgSendInputRef}
                  type="text"
                  placeholder="Type your message..."
                  disabled={isRecording}
                  className="w-full px-2 sm:px-4 py-1 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                />
              </div>

              {/* Voice Button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
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

              {/* Send Button */}
              <button
                onClick={sendMessage}
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
        </>
      ) : (
        // No User Selected State
        <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <IoChatboxEllipsesOutline className="size-8" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Welcome to Chat
          </h1>
          <p className="text-gray-500 max-w-md">
            Select a conversation from the sidebar to start messaging, or search
            for someone new to chat with.
          </p>
        </div>
      )}
    </div>
  );
};

export default Chats;
