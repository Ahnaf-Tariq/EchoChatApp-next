"use client";
import Navbar from "@/components/Navbar";
import { onAuthStateChanged } from "firebase/auth";
import { useContext, useEffect } from "react";
import { auth } from "../firebase/config";
import { useRouter } from "next/navigation";
import { AppContext } from "@/context/Context";
import LeftSideChat from "@/components/LeftSideChat";
import RightSideChat from "@/components/RightSideChat";

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
    <div className="bg-gray-50 h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto my-10 grid grid-cols-[1fr_2fr] h-[600px] shadow-md">
        {/* left side users */}
        <LeftSideChat />

        {/* right side chat display */}
        <RightSideChat />
      </div>
    </div>
  );
};

export default Chat;
