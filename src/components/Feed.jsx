import React, { useState, useEffect } from "react";
import { useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import PageTitle from "./PageTitle";
import PostCard from "./PostCard";
import apiClient from "../api/apiClient";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../store/auth-slice";
import { toast } from "react-toastify";

export default function Feed() {
  const initialData = useLoaderData();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const followingOnly = searchParams.get("following") === "true";

  const [page, setPage] = useState(0);
  const [posts, setPosts] = useState(initialData.content);
  const [hasMore, setHasMore] = useState(!initialData.last);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setPosts(initialData.content);
    setHasMore(!initialData.last);
    setPage(0);
  }, [initialData]);

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const response = await apiClient.get("/social/feed", {
        params: { page: nextPage, size: 10, followingOnly },
      });
      setPosts((prev) => [...prev, ...response.data.content]);
      setHasMore(!response.data.last);
      setPage(nextPage);
    } catch (error) {
      toast.error("Failed to load more posts.");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-[852px] container mx-auto px-6 py-12 font-primary dark:bg-darkbg">
      <PageTitle title="Vendor Feed" />

      {isAuthenticated && (
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => navigate("/feed")}
            className={`px-4 py-2 rounded-md transition ${
              !followingOnly
                ? "bg-primary dark:bg-light text-white dark:text-black"
                : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => navigate("/feed?following=true")}
            className={`px-4 py-2 rounded-md transition ${
              followingOnly
                ? "bg-primary dark:bg-light text-white dark:text-black"
                : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
            }`}
          >
            Following
          </button>
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        {posts.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            {followingOnly
              ? "You're not following any vendors yet. Discover some!"
              : "No posts yet. Check back soon!"}
          </p>
        ) : (
          posts.map((post) => <PostCard key={post.postId} post={post} />)
        )}

        {hasMore && (
          <div className="text-center pt-4">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-6 py-2 text-white dark:text-black rounded-md transition duration-200 bg-primary dark:bg-light hover:bg-dark dark:hover:bg-lighter"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export async function feedLoader({ request }) {
  const url = new URL(request.url);
  const followingOnly = url.searchParams.get("following") === "true";
  try {
    const response = await apiClient.get("/social/feed", {
      params: { page: 0, size: 10, followingOnly },
    });
    return response.data;
  } catch (error) {
    throw new Response(
      error.response?.data?.errorMessage ||
        error.message ||
        "Failed to load the feed. Please try again.",
      { status: error.status || 500 }
    );
  }
}
