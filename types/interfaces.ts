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

export interface Group {
  id: string;
  name: string;
  members: string[];
  createdBy: string;
  createdAt: number;
}
export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName?: string;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  type: "text" | "image" | "audio";
  timestamp: number;
  reactions?: { [emoji: string]: string[] };
  taggedUsers?: string[];
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
  loginInputRef: React.RefObject<HTMLInputElement | null>;
}
