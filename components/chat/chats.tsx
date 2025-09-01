"use client";
import { useChat } from "@/context/ChatContext";
import ChatMessages from "./chat-messages";
import useChatMessage from "@/hooks/useChatMessage";
import ChatHeader from "./chat-header";
import ChatInputs from "./chat-inputs";
import { KeyboardEvent } from "react";

const Chats = () => {
  const { selectedUser } = useChat();
  const {
    textMessage,
    messages,
    isUploading,
    isRecording,
    playingAudio,
    isPaused,
    msgSendInputRef,
    fileRef,
    chatScrollRef,
    handleTyping,
    sendMessage,
    handleImageUpload,
    startRecording,
    stopRecording,
    toggleAudio,
    deleteMessage,
    addEmoji,
    deleteEmoji,
  } = useChatMessage();

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-[550px] bg-gray-50 flex flex-col">
      {selectedUser && (
        <>
          <ChatHeader />

          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-2">
            {messages.map((message, ind) => (
              <ChatMessages
                key={ind}
                message={message}
                playingAudio={playingAudio}
                isPaused={isPaused}
                toggleAudio={toggleAudio}
                deleteMessage={deleteMessage}
                addEmoji={addEmoji}
                deleteEmoji={deleteEmoji}
              />
            ))}

            <div ref={chatScrollRef} />
          </div>

          <ChatInputs
            textMessage={textMessage}
            isUploading={isUploading}
            isRecording={isRecording}
            msgSendInputRef={msgSendInputRef}
            fileRef={fileRef}
            handleTyping={handleTyping}
            handleKeyPress={handleKeyPress}
            handleImageUpload={handleImageUpload}
            startRecording={startRecording}
            stopRecording={stopRecording}
            sendMessage={sendMessage}
          />
        </>
      )}
    </div>
  );
};

export default Chats;
