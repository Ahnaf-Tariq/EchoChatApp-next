"use client";
import { useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, db, provider } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { AppContext } from "@/context/Context";

export const useLogin = () => {
  const { currentState } = useContext(AppContext);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<any>(null);

  const googleLogin = async () => {
    try {
      const res = await signInWithPopup(auth, provider);
      console.log(res.user);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignIn = async () => {
    try {
      if (currentState === "Sign In") {
        if (!email || !password) {
          toast.error("Please fill all fields");
          return;
        }
        const res = await signInWithEmailAndPassword(auth, email, password);
        console.log(res.user);
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
        console.log(user);

        await setDoc(doc(db, "users", user.uid), {
          id: user.uid,
          email,
          username: name.toLowerCase(),
          lastSeen: Date.now(),
        });
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.code);
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
