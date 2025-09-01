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
        "flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-sm cursor-pointer",
        isLoggedIn
          ? "text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200"
          : "text-white bg-blue-500 hover:bg-blue-600"
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
