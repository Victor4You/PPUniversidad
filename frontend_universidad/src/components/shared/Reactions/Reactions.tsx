// src/components/shared/Reactions/Reactions.tsx - VERSIÓN RESPONSIVA
'use client';

import { Post } from '@/lib/types/post.types';
import { useAuth } from '@/hooks/useAuth'; 

interface ReactionsProps {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  isMobile?: boolean; // ← Añadido para responsividad
}

export default function Reactions({ 
  post, 
  onLike, 
  onComment, 
  onShare, 
  isMobile = false 
}: ReactionsProps) {
  const { isAuthenticated } = useAuth();

  const handleLike = () => {
    if (!isAuthenticated) return;
    onLike();
  };

  const handleComment = () => {
    if (!isAuthenticated) return;
    onComment();
  };

  const handleShare = () => {
    if (!isAuthenticated) return;
    onShare();
  };

  return (
    <div className={`flex justify-between ${isMobile ? 'pt-2' : 'pt-3'}`}>
      <button
        onClick={handleLike}
        disabled={!isAuthenticated}
        className={`flex items-center ${
          isMobile ? 'space-x-1 px-2 py-1.5' : 'space-x-2 px-4 py-2'
        } rounded-lg transition-colors flex-1 justify-center ${
          !isAuthenticated 
            ? 'text-gray-400 cursor-not-allowed' 
            : post.liked 
            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        aria-label="Dar me gusta"
      >
        <span className={`${isMobile ? 'text-base' : 'text-lg'}`}>
          {post.liked ? '❤️' : '🤍'}
        </span>
        {!isMobile && (
          <span className="font-medium text-sm lg:text-base">
            Me gusta
          </span>
        )}
        {isMobile && post.likes > 0 && (
          <span className="text-xs font-medium">
            {post.likes}
          </span>
        )}
      </button>

      <button
        onClick={handleComment}
        disabled={!isAuthenticated}
        className={`flex items-center ${
          isMobile ? 'space-x-1 px-2 py-1.5' : 'space-x-2 px-4 py-2'
        } rounded-lg transition-colors flex-1 justify-center ${
          !isAuthenticated 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        aria-label="Comentar"
      >
        <span className={`${isMobile ? 'text-base' : 'text-lg'}`}>💬</span>
        {!isMobile && (
          <span className="font-medium text-sm lg:text-base">
            Comentar
          </span>
        )}
        {isMobile && post.comments.length > 0 && (
          <span className="text-xs font-medium">
            {post.comments.length}
          </span>
        )}
      </button>

      <button
        onClick={handleShare}
        disabled={!isAuthenticated}
        className={`flex items-center ${
          isMobile ? 'space-x-1 px-2 py-1.5' : 'space-x-2 px-4 py-2'
        } rounded-lg transition-colors flex-1 justify-center ${
          !isAuthenticated 
            ? 'text-gray-400 cursor-not-allowed' 
            : post.shared 
            ? 'bg-green-50 text-green-600 hover:bg-green-100' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        aria-label="Compartir"
      >
        <span className={`${isMobile ? 'text-base' : 'text-lg'}`}>
          {post.shared ? '🔄' : '↗️'}
        </span>
        {!isMobile && (
          <span className="font-medium text-sm lg:text-base">
            Compartir
          </span>
        )}
        {isMobile && post.shares > 0 && (
          <span className="text-xs font-medium">
            {post.shares}
          </span>
        )}
      </button>
    </div>
  );
}