import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import apiClient from "../api/apiClient";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../store/auth-slice";

export default function PostCard({ post }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [liked, setLiked] = useState(post.likedByCurrentUser);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [loadingComments, setLoadingComments] = useState(false);

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    return new Date(isoDate).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.info("Please login to like posts.");
      return;
    }
    try {
      const response = await apiClient.post(`/social/posts/${post.postId}/like`);
      setLiked(response.data.liked);
      setLikeCount(response.data.likeCount);
    } catch (error) {
      toast.error("Failed to update like.");
    }
  };

  const loadComments = async () => {
    setShowComments((prev) => !prev);
    if (comments === null) {
      setLoadingComments(true);
      try {
        const response = await apiClient.get(
          `/social/posts/${post.postId}/comments`
        );
        setComments(response.data);
      } catch (error) {
        toast.error("Failed to load comments.");
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleAddComment = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      toast.info("Please login to comment.");
      return;
    }
    if (!commentText.trim()) return;
    try {
      const response = await apiClient.post(
        `/social/posts/${post.postId}/comments`,
        { content: commentText }
      );
      setComments((prev) => [...(prev || []), response.data]);
      setCommentCount((prev) => prev + 1);
      setCommentText("");
    } catch (error) {
      toast.error("Failed to add comment.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-700 shadow-md rounded-md p-5">
      <div className="flex items-center mb-3">
        {post.vendorLogoUrl ? (
          <img
            src={post.vendorLogoUrl}
            alt={post.storeName}
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary dark:bg-light text-white dark:text-dark flex items-center justify-center font-bold mr-3">
            {post.storeName?.charAt(0)?.toUpperCase() || "V"}
          </div>
        )}
        <div>
          <Link
            to={`/vendors/${post.vendorId}`}
            className="font-semibold text-primary dark:text-light hover:underline"
          >
            {post.storeName}
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(post.createdAt)}
          </p>
        </div>
      </div>

      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-3">
        {post.content}
      </p>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post"
          className="w-full max-h-96 object-cover rounded-md mb-3"
        />
      )}

      {post.productId && (
        <Link
          to={`/products/${post.productId}`}
          className="flex items-center border border-gray-200 dark:border-gray-600 rounded-md p-2 mb-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
        >
          {post.productImageUrl && (
            <img
              src={post.productImageUrl}
              alt={post.productName}
              className="w-12 h-12 object-cover rounded-md mr-3"
            />
          )}
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            View product: {post.productName}
          </span>
        </Link>
      )}

      <div className="flex items-center space-x-6 border-t dark:border-gray-600 pt-3">
        <button
          onClick={handleLike}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-red-500 transition"
        >
          <FontAwesomeIcon
            icon={liked ? faHeartSolid : faHeartRegular}
            className={liked ? "text-red-500" : ""}
          />
          <span>{likeCount}</span>
        </button>
        <button
          onClick={loadComments}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-light transition"
        >
          <FontAwesomeIcon icon={faComment} />
          <span>{commentCount}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-3 border-t dark:border-gray-600 pt-3 space-y-2">
          {loadingComments && (
            <p className="text-sm text-gray-500">Loading comments...</p>
          )}
          {comments?.map((comment) => (
            <div key={comment.commentId} className="text-sm">
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {comment.customerName}:{" "}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {comment.content}
              </span>
            </div>
          ))}
          {comments?.length === 0 && (
            <p className="text-sm text-gray-500">
              No comments yet. Be the first!
            </p>
          )}
          <form onSubmit={handleAddComment} className="flex space-x-2 mt-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              maxLength={500}
              className="flex-1 px-3 py-1.5 text-sm border rounded-md border-primary dark:border-light bg-white dark:bg-gray-600 text-gray-800 dark:text-lighter focus:outline-none focus:ring focus:ring-dark dark:focus:ring-lighter"
            />
            <button
              type="submit"
              className="px-4 py-1.5 text-sm text-white dark:text-black rounded-md bg-primary dark:bg-light hover:bg-dark dark:hover:bg-lighter transition"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
