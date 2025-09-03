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
}: InputProps) => {
  return (
    // login page input
    <div className="flex flex-col gap-1 relative">
      <input
        type={type}
        className={cn(
          "p-2 text-sm sm:text-base border rounded-md outline-none transition-all duration-200 ease-in-out bg-[#40444b] text-white placeholder-transparent",
          isFocused
            ? "border-[#5865f2] ring-1 ring-[#5865f2]"
            : "border-[#4f545c]"
        )}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        id={id}
        placeholder={label}
      />
      <label
        htmlFor={id}
        className={cn(
          "absolute left-3 transition-all duration-200 pointer-events-none",
          isFocused || val
            ? "text-xs -top-2 px-1 bg-[#40444b] text-[#b9bbbe]"
            : "text-sm top-3 text-[#72767d]"
        )}
      >
        {label}
      </label>
    </div>
  );
};

export default Input;
