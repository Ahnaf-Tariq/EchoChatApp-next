"use client";
import { auth, db } from "@/app/firebase/config";
import { AppContext } from "@/context/Context";
import { uploadCloudinary } from "@/lib/cloudinary";
import { formatDistanceToNow } from "date-fns";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react";
import { BsExclamationCircle } from "react-icons/bs";
import { IoArrowBack, IoChatboxEllipsesOutline, IoSend } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { RiGalleryLine } from "react-icons/ri";

interface Message {
  senderId: string;
  receiverId: string;
  text?: string;
  imageUrl?: string;
  type: "text" | "image";
  timestamp: number;
}

const RightSideChat = () => {
  const { selectedUser, setSelectedUser } = useContext(AppContext);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [uploading, setUploading] = useState(false);
  const msgSendInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLInputElement>(null);

  // scroll to bottom function
  const scrollToBottom = () => {
    chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedUser]);

  // get all chats
  useEffect(() => {
    if (!selectedUser || !auth.currentUser) return;

    const currentUserId = auth.currentUser.uid;
    const receiverId = selectedUser.id;
    const chatId =
      currentUserId < receiverId
        ? `${currentUserId}_${receiverId}`
        : `${receiverId}_${currentUserId}`;

    const chatRef = doc(db, "chats", chatId);

    const unsub = onSnapshot(chatRef, (docSnap) => {
      if (docSnap.exists()) {
        setMessages(docSnap.data().chatData || []);
      } else {
        setMessages([]);
      }
    });

    return () => unsub();
  }, [selectedUser]);

  // send message function
  const sendMessage = async () => {
    if (!selectedUser || !auth.currentUser) return;

    if (!inputMessage.trim()) {
      msgSendInputRef.current?.focus();
      return;
    }

    const currentUserId = auth.currentUser.uid;
    const receiverId = selectedUser.id;
    const chatId =
      currentUserId < receiverId
        ? `${currentUserId}_${receiverId}`
        : `${receiverId}_${currentUserId}`;

    const chatRef = doc(db, "chats", chatId);
    const chatSnap = await getDoc(chatRef);

    const newMsg: Message = {
      senderId: currentUserId,
      receiverId,
      text: inputMessage,
      type: "text",
      timestamp: Date.now(),
    };

    if (chatSnap.exists()) {
      await updateDoc(chatRef, {
        chatData: arrayUnion(newMsg),
      });
    } else {
      await setDoc(chatRef, {
        chatData: [newMsg],
      });
    }

    setInputMessage("");
  };

  // image upload to cloudinary function
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser || !selectedUser) return;

    setUploading(true);

    try {
      // Upload to Cloudinary
      const imageUrl = await uploadCloudinary(file);

      if (imageUrl) {
        const currentUserId = auth.currentUser.uid;
        const receiverId = selectedUser.id;
        const chatId =
          currentUserId < receiverId
            ? `${currentUserId}_${receiverId}`
            : `${receiverId}_${currentUserId}`;

        const chatRef = doc(db, "chats", chatId);
        const chatSnap = await getDoc(chatRef);

        // Send image message to Firebase
        const imageMessage: Message = {
          senderId: currentUserId,
          receiverId,
          imageUrl,
          type: "image",
          timestamp: Date.now(),
        };

        if (chatSnap.exists()) {
          await updateDoc(chatRef, {
            chatData: arrayUnion(imageMessage),
          });
        } else {
          await setDoc(chatRef, {
            chatData: [imageMessage],
          });
        }

        // clear after upload
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        alert("Failed to upload image. Please try again.");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload image. Please try again.");
    }
  };

  // msg delivered on Enter key press
  const handleKeyPress = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // deleting message function
  const deleteMsg = async (timestamp: number) => {
    try {
      if (!selectedUser || !auth.currentUser) return;

      const currentUserId = auth.currentUser.uid;
      const receiverId = selectedUser.id;
      const chatId =
        currentUserId < receiverId
          ? `${currentUserId}_${receiverId}`
          : `${receiverId}_${currentUserId}`;

      const chatRef = doc(db, "chats", chatId);

      const msgToDelete = messages.find((msg) => msg.timestamp === timestamp);
      if (!msgToDelete) return;

      await updateDoc(chatRef, {
        chatData: arrayRemove(msgToDelete),
      });
    } catch (error) {
      console.error(`Error deleting message ${error}`);
    }
  };
  return (
    <div className="h-[600px] bg-gray-50 flex flex-col">
      {selectedUser ? (
        <>
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {/* back button */}
                <button
                  onClick={() => setSelectedUser(null)}
                  className="sm:hidden p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                >
                  <IoArrowBack className="size-5 text-gray-600" />
                </button>
                <div className="hidden sm:block">
                  <img
                    className="size-10 rounded-full ring-2 ring-gray-100"
                    src="/assests/avatar.webp"
                    alt=""
                  />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-800 capitalize">
                    {selectedUser?.username}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Last seen:{" "}
                    {selectedUser.lastSeen
                      ? formatDistanceToNow(new Date(selectedUser.lastSeen), {
                          addSuffix: true,
                        })
                      : "recently"}
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
              <div
                key={ind}
                className={`flex ${
                  msg.senderId === auth.currentUser?.uid
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`relative max-w-xs lg:max-w-md px-2 sm:px-3 py-2 rounded-lg sm:rounded-2xl shadow-sm ${
                    msg.type === "image"
                      ? "bg-white p-0"
                      : msg.senderId === auth.currentUser?.uid
                      ? "bg-blue-500 text-white rounded-br-sm"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                  }`}
                >
                  {(msg.type === "text" || (!msg.type && msg.text)) && (
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  )}
                  {msg.type === "image" && msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="chat image"
                      className="rounded-lg object-cover w-full max-w-[200px] sm:max-w-[250px] md:max-w-[300px] h-auto min-h-[120px] max-h-[200px] sm:max-h-[250px]"
                    />
                  )}
                  <p
                    className={`text-xs mt-1 ${
                      msg.type === "image"
                        ? "text-gray-400"
                        : msg.senderId === auth.currentUser?.uid
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                  {msg.senderId === auth.currentUser?.uid && (
                    <button
                      onClick={() => deleteMsg(msg.timestamp)}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition cursor-pointer"
                    >
                      <MdDelete size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* auto scroll to bottom */}
            <div ref={chatScrollRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                hidden
                disabled={uploading}
              />

              {/* Gallery Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={`p-2 sm:p-3 rounded-lg ${
                  uploading
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:text-blue-500 hover:bg-gray-100 cursor-pointer"
                }`}
                title="Upload Image"
              >
                <RiGalleryLine className="size-5" />
              </button>
              <div className="flex-1 relative">
                <input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  ref={msgSendInputRef}
                  type="text"
                  placeholder="Type your message..."
                  className="w-full px-2 sm:px-4 py-1 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <button
                onClick={sendMessage}
                className="p-2 sm:p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg sm:rounded-xl cursor-pointer"
              >
                <IoSend className="size-3 sm:size-5" />
              </button>
            </div>
          </div>
        </>
      ) : (
        /* No User Selected State */
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

export default RightSideChat;
