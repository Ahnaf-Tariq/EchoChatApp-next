import { cn } from "@/lib/utils";
import { ChatInputsProps } from "@/types/interfaces";
import React from "react";
import { IoSend } from "react-icons/io5";
import { MdKeyboardVoice, MdStop } from "react-icons/md";
import { RiGalleryLine } from "react-icons/ri";

const ChatInputs = ({
  inputMessage,
  uploading,
  isRecording,
  msgSendInputRef,
  fileInputRef,
  handleTyping,
  handleKeyPress,
  handleImageUpload,
  startRecording,
  stopRecording,
  sendMessage,
}: ChatInputsProps) => {
  return (
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
          onChange={handleImageUpload}
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
            onChange={handleTyping}
            onKeyDown={handleKeyPress}
            ref={msgSendInputRef}
            type="text"
            placeholder="Type your message..."
            disabled={isRecording}
            className="w-full px-2 sm:px-4 py-1 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
          />
        </div>

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
  );
};

export default ChatInputs;
