import { MessageType } from "./enums";

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
  senderName: string;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  type: MessageType;
  timestamp: number;
  reactions?: { [emoji: string]: string[] };
  taggedUsers?: string[];
}

export interface GroupListProps {
  group: Group;
  isSelected: boolean;
  onSelect: (group: Group) => void;
}

export interface CreateGroupModalProps {
  showCreateGroupModal: boolean;
  setShowCreateGroupModal: (show: boolean) => void;
}
