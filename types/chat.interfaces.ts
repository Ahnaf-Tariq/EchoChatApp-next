import { ChangeEvent, KeyboardEvent, RefObject } from "react";
import { AuthState, MessageType, TabType } from "./enums";
import { Group } from "./group.interfaces";

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
  type: MessageType;
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
  textMessage: string;
  isUploading: boolean;
  isRecording: boolean;
  msgSendInputRef: RefObject<HTMLInputElement | null>;
  fileRef: RefObject<HTMLInputElement | null>;
  handleTyping: (e: ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (e: KeyboardEvent<HTMLInputElement>) => void;
  handleImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
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
}

export interface EmojiModalProps {
  isOwnMessage: boolean;
  messageTimestamp: number;
  reactions?: Record<string, string[]>;
  addEmoji: (timestamp: number, emoji: string) => void;
  deleteEmoji: (timestamp: number, emoji: string) => void;
  deleteMessage: (timestamp: number) => void;
  menuOption: boolean;
  setmenuOption: (menuOption: boolean) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (showEmojiPicker: boolean) => void;
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
  selectedGroup: Group | null;
  setSelectedGroup: (group: Group | null) => void;
  loginInputRef: RefObject<HTMLInputElement | null>;
  getFirstLetterCapitalized: (name: string) => string;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}
