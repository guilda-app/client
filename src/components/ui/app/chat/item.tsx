import { Member, Message, Profile } from "@prisma/client";
import { ChevronDown, CircleEllipsisIcon, ClipboardCopy, CrownIcon, DropletsIcon, Edit2, GripVerticalIcon, LucideShieldEllipsis, MenuIcon, ShieldAlert, ShieldCheck, Trash2Icon } from "lucide-react";
import { Avatar } from "../../avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { ActionTooltip } from "../../action-tooltip";
import { MemberRole } from "@/lib/members";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../dropdown-menu";
import MessageContent from "./message-content";
import { getRoleName } from "@/lib/roles";
import LordIcon from "../../lord-icon";

export type MessageWithMemberAndProfile = Message & {
    member: Member & {
        profile: Profile
    }
}

const TIMESTAMP_FORMAT = "d MMM yyyy, HH:mm";

export const roleIcons = {
    "guest": null,
    "moderator": <ShieldCheck className="w-4 h-4 ml-2 text-indigo-500" />,
    "admin": <ShieldAlert className="w-4 h-4 ml-2 text-rose-500" />,
    "owner": <CrownIcon className="w-4 h-4 ml-2 text-yellow-500" />,
}

export default function ({
    message,
    socketUrl,
    socketQuery,
    currentMember,
}: { 
    message: MessageWithMemberAndProfile;
    socketUrl: string;
    socketQuery: Record<string, string>;
    currentMember: Member;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    let roleName: string = getRoleName(currentMember.role);

    const hasBeenUpdated = message.createdAt !== message.updatedAt;
    const isAdmin = currentMember.role >= MemberRole.admin;
    const isModerator = currentMember.role == MemberRole.moderator;
    const isOwner = currentMember.id === message.memberId;
    const canDeleteMessage = !message.deleted && (isAdmin || isModerator || isOwner);
    const canEditMessage = !message.deleted && isOwner;

    return (
        <div className="relative group flex items-start hover:bg-black/5 p-4 transition w-full">
            <div className="group flex gap-x-2 items-start w-full">
                <div className="cursor-pointer hover:drop-shadow-md transition">
                    <Avatar>
                        <AvatarImage src={message.member.profile.imageUri} />
                    </Avatar>
                </div>
                <div className="flex flex-col w-full">
                    <div className="flex items-center gap-x-2">
                        <div className="flex items-center">
                            <p className="font-semibold test-sm hover:underline cursor-pointer">
                                {message.member.profile.name}
                            </p>
                            <ActionTooltip label={roleName} side="right">
                                {roleIcons[roleName.toLocaleLowerCase() as keyof typeof roleIcons]}
                            </ActionTooltip> 
                        </div>
                        <span className="text-xs text-zinc-400 ">
                            {format(new Date(message.createdAt), TIMESTAMP_FORMAT)}
                        </span>
                        {hasBeenUpdated &&  !message.deleted && (
                            <ActionTooltip label={format(
                                new Date(message.updatedAt),
                                TIMESTAMP_FORMAT
                            )} side="right">
                                <span className="text-[10px] text-zinc-400 ">
                                    (edited)
                                </span>
                            </ActionTooltip>
                        )}
                    </div>
                    <p className={cn("text-sm text-zinc-300",
                        message.deleted && "italic && text-zinc-400 text-xs mt-1")}>
                        <MessageContent embeds={(message as any).embeds} content={message.content} />
                    </p>
                    {/* TODO: images! */}

                </div>
            </div>
            <DropdownMenu onOpenChange={(open) => setIsDropdownOpen(open)}>
                <DropdownMenuTrigger asChild>
                    <div className={cn("anim-icon",
                        isDropdownOpen ? "flex" : "hidden group-hover:flex",
                    )}>
                        <ActionTooltip label="More actions" side="top">
                            <div style={{
                                width: '27px',
                                height: '27px',
                            }} className="flex items-center justify-center cursor-pointer rounded-sm mt-2 bg-zinc-900 border ml-2 text-zinc-200 group-hover:text-zinc-500 transition">
                                <LordIcon target=".anim-icon" icon="rxufjlal" size={18} className="m-0" />
                            </div>
                        </ActionTooltip>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" style={{ transform: 'translateX(-40%)' }}>
                    {canEditMessage && (
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Edit2 className="mr-2 h-4 w-4" />
                                <span>Edit message</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    )}
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <ClipboardCopy className="mr-2 h-4 w-4" />
                            <span>Copy message ID</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    {canDeleteMessage && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem className="anim-icon text-red-600">
                                    <LordIcon target=".anim-icon" icon="kfzfxczd" className="mr-2" size={20} />
                                    <span>Delete message</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}