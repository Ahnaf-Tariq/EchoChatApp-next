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

const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password: string): string | null => {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number";
  return null;
};

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
      if (currentState === AuthState.SIGNIN) {
        if (!email || !password) {
          toast.error("Please fill all fields");
          return;
        }

        if (!validateEmail(email)) {
          toast.error("Invalid email format");
          return;
        }

        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!name || !email || !password) {
          toast.error("Please fill all fields");
          return;
        }

        if (!validateEmail(email)) {
          toast.error("Invalid email format");
          return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
          toast.error(passwordError);
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
    } catch (error: any) {
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        toast.error("Invalid Credentials");
      } else if (error.code === "auth/email-already-in-use") {
        toast.error("Email already in use");
      } else {
        console.error("Error in logging: " + error);
      }
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
