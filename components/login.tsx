"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase.config";
import { useRouter } from "next/navigation";
import { useChat } from "@/context/ChatContext";
import { useLogin } from "@/hooks/useLogin";
import { doc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import Input from "./ui/input";
import { AuthState } from "@/types/enums";
import { Routes } from "@/routes/Routes";
import { useCommonTranslations } from "@/hooks/useTranslations";

const Login = () => {
  const { t } = useCommonTranslations();

  const { loginInputRef, currentState, setCurrentState } = useChat();
  const {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    handleSignIn,
    googleLogin,
  } = useLogin();
  const [isEmailFocused, setIsEmailFocused] = useState<boolean>(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
  const [isNameFocused, setIsNameFocused] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        router.push(Routes.chat);

        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, { active: true });
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex justify-center mt-10 sm:mt-14 items-center px-2">
      <div className="bg-white shadow-md p-4 sm:p-6 rounded-xl w-96 max-w-full sm:w-96">
        <div className="flex justify-center">
          <h1 className="font-bold text-xl sm:text-2xl">
            {currentState === AuthState.SIGNIN
              ? t("auth.login_title")
              : t("auth.signup_title")}
          </h1>
        </div>
        <hr className="text-gray-400 my-4" />

        <div className="flex flex-col gap-3">
          {currentState === AuthState.SIGNUP && (
            <Input
              val={name}
              setVal={setName}
              isFocused={isNameFocused}
              setIsFocused={setIsNameFocused}
              label={t("common.name")}
              type="text"
              id="name"
            />
          )}

          <Input
            val={email}
            setVal={setEmail}
            isFocused={isEmailFocused}
            setIsFocused={setIsEmailFocused}
            label={t("common.email")}
            type="email"
            id="email"
            inputRef={loginInputRef}
          />

          <Input
            val={password}
            setVal={setPassword}
            isFocused={isPasswordFocused}
            setIsFocused={setIsPasswordFocused}
            label={t("common.password")}
            type="password"
            id="password"
          />

          <button
            onClick={handleSignIn}
            className="w-full font-semibold text-sm sm:text-base bg-blue-500 hover:bg-blue-600 hover:shadow-md text-white rounded-lg py-1 mt-2 cursor-pointer"
          >
            {currentState === AuthState.SIGNIN
              ? t("common.login")
              : t("common.signup")}
          </button>

          <div className="flex items-center my-1">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="mx-2 text-gray-700">{t("common.or")}</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

          <button
            onClick={googleLogin}
            className="w-full flex justify-center items-center gap-2 border border-[#14b8a6] rounded-lg py-1 sm:py-2 hover:bg-gray-50 transition cursor-pointer"
          >
            <Image
              src={"/assests/google_img.jpeg"}
              width={20}
              height={20}
              alt="google_logo"
            />
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {t("common.continue_google")}
            </span>
          </button>
        </div>

        {currentState === AuthState.SIGNIN ? (
          <p className="mt-4 text-sm">
            {t("common.dont_have_account")}{" "}
            <span
              onClick={() => setCurrentState(AuthState.SIGNUP)}
              className="text-blue-500 font-semibold hover:underline cursor-pointer"
            >
              {AuthState.SIGNUP}
            </span>
          </p>
        ) : (
          <p className="mt-4 text-sm">
            {t("common.already_have_account")}{" "}
            <span
              onClick={() => setCurrentState(AuthState.SIGNIN)}
              className="text-blue-500 hover:underline font-semibold cursor-pointer"
            >
              {AuthState.SIGNIN}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
