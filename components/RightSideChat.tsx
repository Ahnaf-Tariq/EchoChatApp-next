"use client";
import { auth, db } from "@/app/firebase/config";
import { AppContext } from "@/context/Context";
import { formatDistanceToNow } from "date-fns";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { BsExclamationCircle } from "react-icons/bs";
import { IoSend } from "react-icons/io5";

interface Message {
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
}

const RightSideChat = () => {
  const { selectedUser } = useContext(AppContext);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

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

  const sendMessage = async () => {
    if (!selectedUser || !auth.currentUser || !inputMessage.trim()) return;

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

  return (
    <div className="bg-[#14b8a6] text-white relative">
      {/* user info */}
      <div className="flex justify-between items-center p-4 border-b-2 border-gray-300 mx-2">
        <div className="flex items-center gap-3">
          <img
            className="size-8 rounded-full"
            src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-unknown-social-media-user-photo-default-avatar-profile-icon-vector-unknown-social-media-user-184816085.jpg"
            alt=""
          />
          <div>
            <h1 className="text-lg font-semibold capitalize">
              {selectedUser?.username ? selectedUser?.username : "Select User"}
            </h1>
            <p className="text-xs">
              Last Seen:{" "}
              {selectedUser?.lastSeen
                ? formatDistanceToNow(new Date(selectedUser.lastSeen), {
                    addSuffix: true,
                  })
                : "N/A"}
            </p>
          </div>
          {/* <p className="bg-yellow-400 rounded-full w-3 h-3"></p> */}
        </div>
        <BsExclamationCircle className="size-6 cursor-pointer" />
      </div>
      
      {/* chats msgs */}
      {selectedUser ? (
        <div className="max-h-[450px] overflow-y-scroll scrollbar-hide">
          {messages.map((msg, ind) => (
            <div
              key={ind}
              className={`bg-[#0f766e] p-2 m-2 w-44 rounded-lg flex flex-col gap-1 ${
                msg.senderId === auth.currentUser?.uid
                  ? "ml-auto rounded-br-none"
                  : "rounded-bl-none"
              }`}
            >
              <h1>{msg.text}</h1>
              <p
                className={`${
                  msg.receiverId === selectedUser?.id
                    ? "self-end"
                    : "self-start"
                } text-sm text-gray-200`}
              >
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center mt-32">
          <h1 className="text-2xl">No User Selected</h1>
          <p className="text-xl">Please select any user to chat!</p>
        </div>
      )}
      
      {/* input msg */}
      <div className="absolute bottom-0 w-full flex items-center gap-2 bg-[#0f766e] p-4">
        <input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          type="text"
          placeholder="Search here.."
          className="text-white placeholder-white outline-none w-full"
        />
        <p onClick={sendMessage} className="cursor-pointer">
          <IoSend className="size-6" />
        </p>
      </div>
    </div>
  );
};

export default RightSideChat;
