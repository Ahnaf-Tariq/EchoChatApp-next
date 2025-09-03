import React from "react";
import { MdOutlineLogin } from "react-icons/md";
import { BiLogOut } from "react-icons/bi";
import { cn } from "@/lib/utils";
import { ButtonProps } from "@/types/chat.interfaces";
import { useCommonTranslations } from "@/hooks/useTranslations";

const Button = ({ isLoggedIn, onClick }: ButtonProps) => {
  const { t } = useCommonTranslations();
  return (
    // navbar button
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:shadow-sm cursor-pointer",
        isLoggedIn
          ? "text-[#b9bbbe] bg-[#3c3f44] hover:bg-[#4f545c] hover:text-white border border-[#4f545c]"
          : "text-white bg-[#5865f2] hover:bg-[#4752c4]"
      )}
    >
      {isLoggedIn ? <BiLogOut /> : <MdOutlineLogin />}

      <span className="hidden sm:inline">
        {isLoggedIn ? t("common.logout") : t("common.signin")}
      </span>
    </button>
  );
};

export default Button;
