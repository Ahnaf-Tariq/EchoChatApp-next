"use client";
import Navbar from "@/components/Navbar";
import { onAuthStateChanged } from "firebase/auth";
import React, { useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { useRouter } from "next/navigation";
import { AppContext } from "@/context/Context";
import { HiDotsVertical } from "react-icons/hi";
import { FaSearch } from "react-icons/fa";
import { BsExclamationCircle } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";

interface User {
  id: string;
  username: string;
  email: string;
  lastSeen: number;
}

interface Message {
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
}

const Chat = () => {
  const { LoadUserData } = useContext(AppContext);
  const router = useRouter();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [originalUsersList, setOriginalUsersList] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    onAuthStateChanged(auth, (curuser) => {
      if (!curuser) {
        router.replace("/");
      }
      LoadUserData(curuser?.uid);
    });
  }, []);

  const msgLists = [
    {
      text: "lorem ipsum dolor tos ami kos Hala Madrid!",
      time: "9:39 PM",
      type: "Sender",
    },
    {
      text: "lorem ipsum dolor tos ami kos Visca Barca!",
      time: "4:40 PM",
      type: "Reciever",
    },
    {
      text: "lorem ipsum dolor tos ami kos Forza Inter!",
      time: "8:14 AM",
      type: "Sender",
    },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      const userRef = collection(db, "users");
      const snap = await getDocs(userRef);

      const users: User[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];

      console.log(users);
      setUsersList(users);
      setOriginalUsersList(users);
    };
    fetchUsers();
  }, []);

  // Send message function
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

  // Real-time messages
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

  const change = (e: any) => {
    const value = e.target.value;
    setSearchInput(value);

    const filtered = originalUsersList.filter((item) =>
      item.username.toLowerCase().includes(value.toLowerCase())
    );

    setUsersList(filtered);
  };
  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto my-10 grid grid-cols-[1fr_2fr] h-[600px]">
        {/* users */}
        <div className="bg-[#14b8a6] text-white border-r-2 border-gray-100">
          <div className="flex justify-between items-center p-6 gap-2">
            <h1 className="text-2xl font-semibold">ChatApp</h1>
            <p className="cursor-pointer">
              <HiDotsVertical />
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#0f766e] rounded-md px-3 py-2 mx-5 mb-4">
            <FaSearch className="text-white text-sm" />
            <input
              type="text"
              onChange={change}
              value={searchInput}
              placeholder="Search here.."
              className="bg-transparent text-white placeholder-white outline-none w-full"
            />
          </div>
          <div className="max-h-[450px] overflow-y-scroll scrollbar-hide">
            {usersList
              .filter((user) => user.id !== auth.currentUser?.uid)
              .map((user, index) => (
                <div
                  onClick={() => setSelectedUser(user)}
                  key={index}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-[#1A4FA3] cursor-pointer ${
                    selectedUser?.id === user.id ? "bg-[#1A4FA3]" : ""
                  }`}
                >
                  <img
                    src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-unknown-social-media-user-photo-default-avatar-profile-icon-vector-unknown-social-media-user-184816085.jpg"
                    alt="avatar"
                    className="size-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-sm text-gray-300">{user.email}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
        {/* chat display */}
        <div className="bg-[#14b8a6] text-white relative">
          <div className="flex justify-between items-center p-4 border-b-2 border-gray-300 mx-2">
            <div className="flex items-center gap-3">
              <img
                className="size-8 rounded-full"
                src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-unknown-social-media-user-photo-default-avatar-profile-icon-vector-unknown-social-media-user-184816085.jpg"
                alt=""
              />
              <h1 className="text-lg font-semibold capitalize">
                {selectedUser?.username}
              </h1>
              <p className="bg-yellow-400 rounded-full w-3 h-3"></p>
            </div>
            <BsExclamationCircle className="size-6 cursor-pointer" />
          </div>
          <div className="max-h-[450px] overflow-y-scroll scrollbar-hide">
            {messages.map((msg, ind) => (
              <div
                key={ind}
                className={`bg-[#0f766e] p-2 m-2 w-80 rounded-lg flex ${
                  msg.senderId === auth.currentUser?.uid
                    ? "ml-auto rounded-br-none"
                    : "rounded-bl-none"
                }`}
              >
                <div>
                  <h1>{msg.text}</h1>
                  <p className="flex justify-end text-sm text-gray-200">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
      </div>
    </div>
  );
};

export default Chat;
