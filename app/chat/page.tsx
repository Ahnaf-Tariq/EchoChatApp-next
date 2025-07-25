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
import { collection, getDocs } from "firebase/firestore";

interface User {
  id: string;
  username: string;
  email: string;
  lastSeen: number;
}

const Chat = () => {
  const { LoadUserData } = useContext(AppContext);
  const router = useRouter();
  const [usersList, setUsersList] = useState<User[]>([]);

  useEffect(() => {
    onAuthStateChanged(auth, (curuser) => {
      if (!curuser) {
        router.replace("/");
      }
      LoadUserData(curuser?.uid);
    });
  }, []);

  const usersLists = [
    {
      name: "Richard Sanford",
      message: "Hello, How are you?",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
      name: "Cristiano Ronaldo",
      message: "Hello, How are you?",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    },
    {
      name: "Lionel Messi",
      message: "Hello, How are you?",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    {
      name: "Neymar Jr",
      message: "Hello, How are you?",
      avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    },
    {
      name: "Kylian Mbappe",
      message: "Hello, How are you?",
      avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    },
    {
      name: "Ronaldinho",
      message: "Hello, How are you?",
      avatar: "https://randomuser.me/api/portraits/men/6.jpg",
    },
    {
      name: "Fede Valverde",
      message: "Hello, How are you?",
      avatar: "https://randomuser.me/api/portraits/men/7.jpg",
    },
    {
      name: "Thierry Henry",
      message: "Hello, How are you?",
      avatar: "https://randomuser.me/api/portraits/men/8.jpg",
    },
  ];

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
    }
  ];

  useEffect(() => {
    const fetch = async () => {
      const userRef = collection(db, "users");
      const snap = await getDocs(userRef);

      const users: User[] = snap.docs.map((doc) => doc.data() as User);

      console.log(users);
      setUsersList(users);
    };
    fetch();
  }, []);
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
              placeholder="Search here.."
              className="bg-transparent text-white placeholder-white outline-none w-full"
            />
          </div>
          <div className="max-h-[450px] overflow-y-scroll scrollbar-hide">
            {usersList.map((users, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-[#1A4FA3] cursor-pointer ${
                  index === 0 ? "bg-[#1A4FA3]" : ""
                }`}
              >
                <img
                  src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-unknown-social-media-user-photo-default-avatar-profile-icon-vector-unknown-social-media-user-184816085.jpg"
                  alt="avatar"
                  className="size-10 rounded-full"
                />
                <div>
                  <p className="font-semibold">{users.username}</p>
                  <p className="text-sm text-gray-300">{users.email}</p>
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
                src="https://randomuser.me/api/portraits/men/1.jpg"
                alt=""
              />
              <h1 className="text-lg font-semibold">Richard Stanford</h1>
              <p className="bg-yellow-400 rounded-full w-3 h-3"></p>
            </div>
            <BsExclamationCircle className="size-6 cursor-pointer" />
          </div>
          <div  className="max-h-[450px] overflow-y-scroll scrollbar-hide">
            {msgLists.map((msg,ind) => (
              <div key={ind} className={`bg-[#0f766e] p-2 m-2 w-80 rounded-lg flex flex-col ${msg.type === 'Sender' ? 'ml-auto rounded-br-none' : 'mr-auto rounded-bl-none'}`}>
                <h1>{msg.text}</h1>
                <p className="flex self-end text-sm text-gray-200">{msg.time}</p>
              </div>
            ))}
          </div>
          {/* input msg */}
          <div className="absolute bottom-0 w-full flex items-center gap-2 bg-[#0f766e] p-4">
            <input
              type="text"
              placeholder="Search here.."
              className="text-white placeholder-white outline-none w-full"
            />
            <p className="cursor-pointer">
              <IoSend className="size-6" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
