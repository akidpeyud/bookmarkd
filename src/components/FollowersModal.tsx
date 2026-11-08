"use client";

import React from "react";
import Link from "next/link";
import { UserProfile } from "@/types";
import { useBookmarkd } from "@/lib/store";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { UserCheck, UserPlus, Users } from "lucide-react";

export interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: UserProfile[];
}

export function FollowersModal({
  isOpen,
  onClose,
  title,
  users,
}: FollowersModalProps) {
  const { currentUser, isFollowing, followUser, unfollowUser } = useBookmarkd();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      subtitle="Literary Community"
      title={title}
      maxWidth="sm"
    >
      <div className="space-y-3">
        {users.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#7A6F65] bg-white rounded-xl border border-dashed border-[#E8DDCE]">
            No readers found in this list yet.
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {users.map((user) => {
              const following = isFollowing(user.id);
              const isMe = user.id === currentUser.id;

              return (
                <div
                  key={user.id}
                  className="p-3 rounded-xl bg-white border border-[#E7DCCE] flex items-center justify-between gap-3 hover:border-[#6E3511] transition-colors"
                >
                  <Link
                    href={`/profile/${user.username}`}
                    onClick={onClose}
                    className="flex items-center gap-2.5 overflow-hidden group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-9 h-9 rounded-full object-cover border border-[#D5C6B5]"
                    />
                    <div className="truncate">
                      <span className="font-semibold text-xs text-[#2C221A] group-hover:text-[#6E3511] block truncate">
                        {user.full_name}
                      </span>
                      <span className="text-[10px] text-[#8C7D70] block truncate">
                        @{user.username}
                      </span>
                    </div>
                  </Link>

                  {!isMe && (
                    <Button
                      onClick={() =>
                        following ? unfollowUser(user.id) : followUser(user.id)
                      }
                      variant={following ? "forest" : "primary"}
                      size="xs"
                      leftIcon={
                        following ? (
                          <UserCheck className="w-3 h-3" />
                        ) : (
                          <UserPlus className="w-3 h-3" />
                        )
                      }
                    >
                      {following ? "Following" : "Follow"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
