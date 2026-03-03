"use client";

import { useState, useEffect } from "react";
import { Post } from "@/lib/types/post.types";
import Reactions from "@/components/shared/Reactions/Reactions";
import Comments from "@/components/posts/Comments/Comments";
import { Avatar } from "@/components/ui/Avatar/Avatar";
import { useAuth } from "@/hooks/useAuth";

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string, content: string) => void;
  onShare?: (postId: string) => void;
  onVote?: (postId: string, index: number) => void;
}

export default function PostCard({
  post,
  onLike,
  onComment,
  onShare,
  onVote,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const pollInfo = post.pollData;
  const totalVotes =
    pollInfo?.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;
  const hasVoted = pollInfo?.options?.some((opt) =>
    opt.vitedBy?.includes(currentUser?.id?.toString() || ""),
  );

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return timestamp;
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 lg:mb-6">
      <div className="p-4 lg:p-6">
        <div className="flex items-start space-x-3">
          <Avatar
            src={post.user?.avatar}
            alt={`Avatar de ${post.user?.name || "Usuario"}`}
            size={isMobile ? "sm" : "md"}
            fallbackLetter={post.user?.name?.charAt(0) || "U"}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm lg:text-base truncate">
              {post.user?.name || "Usuario desconocido"}
            </h3>
            <p className="text-gray-500 text-xs lg:text-sm truncate">
              {post.user?.role || "Invitado"} • {formatDate(post.timestamp)}
            </p>
          </div>
        </div>

        <div className="mt-3 lg:mt-4">
          <p className="text-gray-800 whitespace-pre-line text-sm lg:text-base break-words">
            {post.content}
          </p>

          {post.media?.type === "image" && (
            <div className="mt-3 lg:mt-4">
              <img
                src={post.media.url}
                alt="Media"
                className="rounded-lg w-full h-auto max-h-48 lg:max-h-96 object-cover"
              />
            </div>
          )}

          {post.isPoll && pollInfo && (
            <div className="mt-3 lg:mt-4 p-3 lg:p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                {pollInfo.question}
              </h4>
              <div className="space-y-2">
                {pollInfo.options.map((option, idx) => {
                  const percentage =
                    totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                  const userVotedThis = option.vitedBy?.includes(
                    currentUser?.id?.toString() || "",
                  );
                  return (
                    <button
                      key={idx}
                      onClick={() => !hasVoted && onVote?.(post.id, idx)}
                      disabled={!currentUser || hasVoted}
                      className={`w-full text-left p-2 rounded-lg border-2 relative overflow-hidden transition-all ${
                        userVotedThis
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      {hasVoted && (
                        <div
                          className={`absolute left-0 top-0 h-full ${userVotedThis ? "bg-blue-200" : "bg-gray-100"}`}
                          style={{ width: `${percentage}%`, zIndex: 0 }}
                        />
                      )}
                      <div className="relative z-10 flex justify-between text-sm font-medium">
                        <span>
                          {userVotedThis && "✓ "} {option.option}
                        </span>
                        {hasVoted && <span>{percentage.toFixed(0)}%</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-gray-500 text-xs mt-2">{totalVotes} votos</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 lg:px-6 pb-2 lg:pb-3">
        <div className="flex items-center space-x-3 text-xs lg:text-sm text-gray-500 border-b pb-2 mb-2">
          <span>{post.likes || 0} me gusta</span>
          <span>{post.comments?.length || 0} comentarios</span>
          <span>{post.shares || 0} compartidos</span>
        </div>

        <Reactions
          post={post}
          onLike={() => onLike?.(post.id)}
          onComment={() => setShowComments(!showComments)}
          onShare={() => onShare?.(post.id)}
          isMobile={isMobile}
        />
      </div>

      {showComments && (
        <div className="border-t">
          <Comments
            post={post}
            currentUser={currentUser}
            onCommentAdded={(c) => onComment?.(post.id, c.content)}
            isMobile={isMobile}
          />
        </div>
      )}
    </div>
  );
}
