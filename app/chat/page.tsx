"use client";
import Navbar from "@/components/Navbar";
import { onAuthStateChanged } from "firebase/auth";
import React, { useContext, useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { useRouter } from "next/navigation";
import { AppContext } from "@/context/Context";
import { HiDotsVertical } from "react-icons/hi";
import { FaSearch } from "react-icons/fa";

const Chat = () => {
  const { LoadUserData } = useContext(AppContext);
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, (curuser) => {
      if (!curuser) {
        router.replace("/");
      }
      LoadUserData(curuser?.uid);
    });
  }, []);

  const chatList = [
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
  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto my-10 grid grid-cols-[1fr_2fr]">
        {/* users */}
        <div className="bg-[#14b8a6] text-white">
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
          <div>
            {chatList.map((chat, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-[#1A4FA3] cursor-pointer ${
                  index === 0 ? "bg-[#1A4FA3]" : ""
                }`}
              >
                <img
                  src={chat.avatar}
                  alt="avatar"
                  className="size-10 rounded-full"
                />
                <div>
                  <p className="font-semibold">{chat.name}</p>
                  <p className="text-sm text-gray-300">{chat.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* chat display */}
        <div></div>
      </div>
    </div>
  );
};

export default Chat;
