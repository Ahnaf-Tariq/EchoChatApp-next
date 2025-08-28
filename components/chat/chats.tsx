"use client";
import { useChat } from "@/context/ChatContext";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import ChatMessages from "./chat-messages";
import useChatMessage from "@/hooks/useChatMessage";
import ChatHeader from "./chat-header";
import ChatInputs from "./chat-inputs";

const Chats = () => {
  const { selectedUser } = useChat();
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
    deleteMessage,
    addEmoji,
    deleteEmoji,
  } = useChatMessage();

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
          <ChatHeader />

          <div className="flex-1 max-h-[450px] overflow-y-auto scrollbar-hide p-4 space-y-2">
            {messages.map((message, ind) => (
              <div key={ind}>
                <ChatMessages
                  message={message}
                  playingAudio={playingAudio}
                  isPaused={isPaused}
                  toggleAudio={toggleAudio}
                  deleteMessage={deleteMessage}
                  addEmoji={addEmoji}
                  deleteEmoji={deleteEmoji}
                />
              </div>
            ))}

            <div ref={chatScrollRef} />
          </div>

          <ChatInputs
            inputMessage={inputMessage}
            uploading={uploading}
            isRecording={isRecording}
            msgSendInputRef={msgSendInputRef}
            fileInputRef={fileInputRef}
            handleTyping={handleTyping}
            handleKeyPress={handleKeyPress}
            handleImageUpload={handleImageUpload}
            startRecording={startRecording}
            stopRecording={stopRecording}
            sendMessage={sendMessage}
          />
        </>
      ) : (
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
