"use client";
import Navbar from "@/components/Navbar";
import { onAuthStateChanged } from "firebase/auth";
import React, { useContext, useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { useRouter } from "next/navigation";
import { AppContext } from "@/context/Context";
import { HiDotsVertical } from "react-icons/hi";

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
  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto my-10 grid grid-cols-[1fr_2fr]">
        {/* users */}
        <div>
          <div className="flex justify-between items-center gap-2">
            <h1 className="text-xl font-semibold">ChatApp</h1>
            <p className="cursor-pointer"><HiDotsVertical /></p>
          </div>
        </div>
        {/* chat display */}
        <div></div>
      </div>
    </div>
  );
};

export default Chat;
