"use client";
import Navbar from "@/components/Navbar";
import { onAuthStateChanged } from "firebase/auth";
import React, { useContext, useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { useRouter } from "next/navigation";
import { AppContext } from "@/context/Context";

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
      chat
    </div>
  );
};

export default Chat;
