"use client";
import { cn } from "@/lib/utils";
import { InputProps } from "@/types/chat.interfaces";
import React from "react";

const Input = ({
  val,
  setVal,
  isFocused,
  setIsFocused,
  type,
  label,
  id,
  inputRef,
}: InputProps) => {
  return (
    // login page input
    <div className="flex flex-col gap-1 relative">
      <input
        type={type}
        className={cn(
          "px-2 py-2 text-sm sm:text-base border rounded-md outline-none transition-all duration-200 ease-in-out",
          isFocused ? "border-blue-500" : "border-gray-400"
        )}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        id={id}
        ref={inputRef}
      />
      <label
        htmlFor="email"
        className={cn(
          "absolute left-3 transition-all duration-200 ease-in-out pointer-events-none",
          isFocused || val ? "text-xs -top-2 px-1 bg-white" : "text-base top-2",
          isFocused ? "text-blue-500" : "text-gray-400"
        )}
      >
        {label}
      </label>
    </div>
  );
};

export default Input;
