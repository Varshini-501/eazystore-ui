import React, { useState } from "react";
import { useLoaderData, useParams } from "react-router-dom";
import PageTitle from "./PageTitle";
import PostCard from "./PostCard";
import apiClient from "../api/apiClient";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../store/auth-slice";

export default function VendorProfilePage() {
  const { profile: initialProfile, posts: initialPosts } = useLoaderData();
  const { vendorId } = useParams();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [profile, setProfile] = useState(initialProfile);
  const [posts, setPosts] = useState(initialPosts.content);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(!initialPosts.last);
  const [loadingMore, setLoadingMore] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.info("Please login to follow vendors.");
      return;
    }
    setFollowLoading(true);
    try {
      const response = await apiClient.post(`/social/vendors/${vendorId}/follow`);
      setProfile((prev) => ({
        ...prev,
        followingCurrentUser: response.data.following,
        followerCount: response.data.followerCount,
      }));
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update follow status.");
    } finally {
      setFollowLoading(false);
    }
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const response = await apiClient.get(`/social/vendors/${vendorId}/posts`, {
        params: { page: nextPage, size: 10 },
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
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-700 shadow-md rounded-lg px-8 py-6 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center">
            {profile.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt={profile.storeName}
                className="w-16 h-16 rounded-full object-cover mr-4"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary dark:bg-light text-white dark:text-dark flex items-center justify-center text-2xl font-bold mr-4">
                {profile.storeName?.charAt(0)?.toUpperCase() || "V"}
              </div>
            )}
            <div>
              <PageTitle title={profile.storeName} />
              <p className="text-sm text-gray-600 dark:text-gray-400 -mt-4">
                {profile.followerCount} followers • {profile.postCount} posts
              </p>
            </div>
          </div>
          <button
            onClick={handleFollow}
            disabled={followLoading}
            className={`px-6 py-2 rounded-md transition duration-200 ${
              profile.followingCurrentUser
                ? "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                : "bg-primary dark:bg-light text-white dark:text-black hover:bg-dark dark:hover:bg-lighter"
            }`}
          >
            {profile.followingCurrentUser ? "Following" : "Follow"}
          </button>
        </div>
        {profile.storeDescription && (
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            {profile.storeDescription}
          </p>
        )}
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {posts.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            This vendor hasn't posted anything yet.
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

export async function vendorProfileLoader({ params }) {
  try {
    const [profileRes, postsRes] = await Promise.all([
      apiClient.get(`/social/vendors/${params.vendorId}`),
      apiClient.get(`/social/vendors/${params.vendorId}/posts`, {
        params: { page: 0, size: 10 },
      }),
    ]);
    return { profile: profileRes.data, posts: postsRes.data };
  } catch (error) {
    throw new Response(
      error.response?.data?.errorMessage ||
        error.message ||
        "Failed to load this vendor's profile. Please try again.",
      { status: error.status || 500 }
    );
  }
}
