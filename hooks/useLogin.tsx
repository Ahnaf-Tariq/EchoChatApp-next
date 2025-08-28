"use client";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, db, provider } from "@/lib/firebase.config";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useChat } from "@/context/ChatContext";
import { AuthState } from "@/types/enums";

export const useLogin = () => {
  const { currentState } = useChat();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");

  const googleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error in logging: " + error);
    }
  };

  const handleSignIn = async () => {
    try {
      if (currentState === AuthState.signin) {
        if (!email || !password) {
          toast.error("Please fill all fields");
          return;
        }

        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!name || !email || !password) {
          toast.error("Please fill all fields");
          return;
        }

        if (password.length < 6) {
          toast.error("Password must be strong");
          return;
        }

        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;

        await setDoc(doc(db, "users", user.uid), {
          id: user.uid,
          email,
          username: name.toLowerCase(),
          lastSeen: Date.now(),
          typing: false,
          typingTo: null,
          active: false,
        });
      }
    } catch (error) {
      console.error("Error in logging: ", error);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    handleSignIn,
    googleLogin,
  };
};
