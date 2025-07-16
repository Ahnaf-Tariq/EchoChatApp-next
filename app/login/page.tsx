"use client";
import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase/config";

const Login = () => {
  const [currentState, setCurrentState] = useState("Sign In");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const googleLogin = async () => {
    try {
      const res = await signInWithPopup(auth, provider);
      console.log(res.user);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="flex justify-center mt-20 items-center px-2">
      <div className="bg-white shadow-md p-6 rounded-xl w-96">
        <div className="flex justify-between">
          <h1 className="font-semibold text-xl">{currentState}</h1>
          <button className="text-xl">X</button>
        </div>
        <hr className="text-gray-400 my-4" />
        <div className="flex flex-col gap-3">
          {currentState === "Sign Up" && (
            <div className="flex flex-col gap-1">
              <label htmlFor="name">Name</label>
              <input
                className="border border-gray-400 rounded-md px-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Full Name..."
                id="name"
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label htmlFor="email">Email</label>
            <input
              className="border border-gray-400 rounded-md px-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email..."
              id="email"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password">Password</label>
            <input
              className="border border-gray-400 rounded-md px-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password..."
              id="password"
            />
          </div>
          <button
            // onClick={signIn}
            className="w-full font-semibold bg-[#14b8a6] text-white rounded-lg py-1 mt-2 cursor-pointer"
          >
            {currentState}
          </button>
          {/* </div> */}
          <div className="flex items-center my-1">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="mx-2 text-gray-700">Or</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>
          <button
            onClick={googleLogin}
            className="w-full border border-[#14b8a6] text-xl rounded-lg cursor-pointer flex justify-center"
          >
            {/* Google logo */}
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOHI2JLXYQ0StQ1vzNLvULyckAUF1uIUnoxg&s"
              className="size-7"
              alt=""
            />
          </button>
        </div>
        {currentState === "Sign In" ? (
          <p
            className="mt-4 text-lg"
            onClick={() => setCurrentState("Sign Up")}
          >
            or dont have an account{" "}
            <span className="text-[#14b8a6] text-base font-semibold cursor-pointer">
              Sign Up
            </span>
          </p>
        ) : (
          <p
            className="mt-4 text-lg"
            onClick={() => setCurrentState("Sign In")}
          >
            back to{" "}
            <span className="text-[#14b8a6] text-base font-semibold cursor-pointer">
              Sign In
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
