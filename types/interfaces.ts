import { AuthState } from "./enums";

export interface User {
  id: string;
  username: string;
  email: string;
  lastSeen: number;
  typing: boolean;
  typingTo: string | null;
  active: boolean;
}

export interface Message {
  senderId: string;
  receiverId: string;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  type: "text" | "image" | "audio";
  timestamp: number;
  reactions?: { [emoji: string]: string[] };
  hasUserSeen: boolean;
}

export interface ChatMessagesProps {
  message: Message;
  playingAudio: string | null;
  isPaused: boolean;
  toggleAudio: (audioUrl: string) => void;
  deleteMessage: (timestamp: number) => void;
  addEmoji: (timestamp: number, emoji: string) => void;
  deleteEmoji: (timestamp: number, emoji: string) => void;
}

export interface ChatInputsProps {
  inputMessage: string;
  uploading: boolean;
  isRecording: boolean;
  msgSendInputRef: React.RefObject<HTMLInputElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleTyping: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  startRecording: () => void;
  stopRecording: () => void;
  sendMessage: () => void;
}

export interface InputProps {
  val: string;
  setVal: (val: string) => void;
  isFocused: boolean;
  setIsFocused: (val: boolean) => void;
  type: string;
  label: string;
  id: string;
  inputRef?: React.Ref<HTMLInputElement>;
}

export interface ButtonProps {
  isLoggedIn: boolean;
  onClick: () => void;
}

export interface ChatContextType {
  chatAppName: string;
  currentState: AuthState;
  setCurrentState: (state: AuthState) => void;
  loadUserData: (uid: string) => Promise<void>;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  loginInputRef: React.RefObject<HTMLInputElement | null>;
}
