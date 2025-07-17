"use client";
import Navbar from "@/components/Navbar";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect } from "react";
import { auth } from "../firebase/config";
import { useRouter } from "next/navigation";

const Chat = () => {
  const router = useRouter();
  useEffect(() => {
    onAuthStateChanged(auth, (curuser) => {
      if (!curuser) {
        router.replace("/");
      }
    });
  }, []);
  return (
    <div>
      <Navbar />
      chat
    </div>
  );
};

export default Chat;
