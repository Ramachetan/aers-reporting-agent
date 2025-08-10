
import React from 'react';
import {
    ClipboardList,
    Send,
    Loader2,
    Bot,
    User,
    Upload,
    Home,
    Pencil,
    MessageSquare,
    FileCheck2,
    X,
    AlertTriangle,
    Pill,
    ClipboardPen,
    ListPlus,
    Info,
    Download,
    UserSquare,
    Paperclip,
    File as FileIconLucide,
    ShieldCheck,
} from 'lucide-react';

export const Logo: React.FC = () => (
    <ClipboardList width="40" height="40" className="text-primary" strokeWidth={1.5} />
);

export const SendIcon: React.FC = () => (
    <Send width="24" height="24" />
);

export const Spinner: React.FC = () => (
  <Loader2 className="animate-spin h-5 w-5 text-white" />
);

export const BotIcon: React.FC = () => (
    <Bot width="24" height="24" strokeWidth={1.5} />
);

export const UserIcon: React.FC = () => (
    <User width="24" height="24" className="text-text" strokeWidth={1.5} />
);

export const UploadIcon: React.FC = () => (
  <Upload width="24" height="24" strokeWidth={1.5} />
);

export const HomeIcon: React.FC = () => (
    <Home width="24" height="24" strokeWidth={1.5} />
);

export const PencilIcon: React.FC<{inline?: boolean}> = ({ inline }) => (
    <Pencil width={inline ? "14" : "20"} height={inline ? "14" : "20"} strokeWidth={2} className={inline ? 'inline-block -mt-px mx-1' : ''} />
);

export const ChatBubbleIcon: React.FC = () => (
    <MessageSquare width="24" height="24" strokeWidth={1.5} />
);

export const DocumentCheckIcon: React.FC = () => (
    <FileCheck2 width="24" height="24" strokeWidth={1.5} />
);

export const RemoveIcon: React.FC = () => (
    <X width="20" height="20" strokeWidth="2" />
);

export const AlertTriangleIcon: React.FC = () => (
    <AlertTriangle width="24" height="24" strokeWidth={1.5} />
);

export const PillIcon: React.FC = () => (
    <Pill width="24" height="24" strokeWidth={1.5} />
);

export const ClipboardTextIcon: React.FC = () => (
    <ClipboardPen width="24" height="24" strokeWidth={1.5} />
);

export const ListPlusIcon: React.FC = () => (
    <ListPlus width="24" height="24" strokeWidth={1.5} />
);

export const InfoIcon: React.FC = () => (
    <Info width="24" height="24" strokeWidth={1.5} />
);

export const DownloadIcon: React.FC = () => (
    <Download width="20" height="20" strokeWidth={2} />
);

export const ReporterIcon: React.FC = () => (
    <UserSquare width="24" height="24" strokeWidth={1.5} />
);

export const PaperclipIcon: React.FC = () => (
    <Paperclip width="20" height="20" strokeWidth={2} />
);

export const FileIcon: React.FC = () => (
    <FileIconLucide width="20" height="20" className="text-text-muted" strokeWidth={1.5} />
);

export const ShieldCheckIcon: React.FC = () => (
    <ShieldCheck width="24" height="24" strokeWidth={1.5} />
);
