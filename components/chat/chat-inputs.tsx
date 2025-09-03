import { useCommonTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { ChatInputsProps } from "@/types/chat.interfaces";
import React from "react";
import { IoSend } from "react-icons/io5";
import { MdKeyboardVoice, MdStop } from "react-icons/md";
import { RiGalleryLine } from "react-icons/ri";

const ChatInputs = ({
  textMessage,
  isUploading,
  isRecording,
  msgSendInputRef,
  fileRef,
  handleTyping,
  handleKeyPress,
  handleImageUpload,
  startRecording,
  stopRecording,
  sendMessage,
}: ChatInputsProps) => {
  const { t } = useCommonTranslations();
  return (
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
          onChange={handleImageUpload}
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
            onChange={handleTyping}
            onKeyDown={handleKeyPress}
            ref={msgSendInputRef}
            type="text"
            placeholder={t("chat.type_message")}
            disabled={isRecording}
            className="w-full px-4 py-3 bg-[#40444b] border-0 rounded-lg text-white placeholder-[#72767d] focus:outline-none focus:ring-1 focus:ring-[#5865f2] transition-all duration-200 disabled:opacity-50 text-sm"
          />
        </div>

        <button
          onClick={isRecording ? stopRecording : startRecording}
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
          onClick={sendMessage}
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
  );
};

export default ChatInputs;
