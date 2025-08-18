"use client";
import Navbar from "@/components/Navbar";
import { onAuthStateChanged } from "firebase/auth";
import { useContext, useEffect } from "react";
import { auth } from "../firebase/config";
import { useRouter } from "next/navigation";
import { AppContext } from "@/context/Context";
import LeftSideChat from "@/components/chats comp/LeftSideChat";
import RightSideChat from "@/components/chats comp/RightSideChat";

const Chat = () => {
  const { LoadUserData, selectedUser } = useContext(AppContext);
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, (curuser) => {
      if (!curuser) {
        router.replace("/");
      } else {
        LoadUserData(curuser?.uid);
      }
    });
  }, []);

  return (
    <div className="bg-gray-50 h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto my-6 grid grid-cols-1 sm:grid-cols-[1fr_2fr] h-[600px] shadow-md">
        {/* left side users */}
        <div className={`${selectedUser ? "hidden sm:block" : "block"}`}>
          <LeftSideChat />
        </div>

        {/* right side chat display */}
        <div className={`${selectedUser ? "block" : "hidden sm:block"}`}>
          <RightSideChat />
        </div>
      </div>
    </div>
  );
};

export default Chat;
