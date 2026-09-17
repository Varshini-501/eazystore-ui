import React, { useState } from "react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import PageTitle from "../PageTitle";
import apiClient from "../../api/apiClient";
import { toast } from "react-toastify";

export default function VendorDashboard() {
  const { profile, myPosts, myProducts } = useLoaderData();
  const revalidator = useRevalidator();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const [postContent, setPostContent] = useState("");
  const [postImageUrl, setPostImageUrl] = useState("");
  const [linkedProductId, setLinkedProductId] = useState(null);
  const [posting, setPosting] = useState(false);
  const [generatingProductId, setGeneratingProductId] = useState(null);

  const labelStyle =
    "block text-lg font-semibold text-primary dark:text-light mb-2";
  const textFieldStyle =
    "w-full px-4 py-2 text-base border rounded-md transition border-primary dark:border-light focus:ring focus:ring-dark dark:focus:ring-lighter focus:outline-none text-gray-800 dark:text-lighter bg-white dark:bg-gray-600 placeholder-gray-400 dark:placeholder-gray-300";

  const handleFileChange = (event) => {
    setFile(event.target.files?.[0] || null);
    setUploadResult(null);
  };

  const handleBulkUpload = async (event) => {
    event.preventDefault();
    if (!file) {
      toast.error("Please choose a CSV or Excel file first.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    setUploadResult(null);
    try {
      const response = await apiClient.post(
        "/vendor/products/bulk-upload",
        formData,
        { headers: { "Content-Type": undefined } }
      );
      setUploadResult(response.data);
      toast.success(
        `Uploaded ${response.data.successCount} of ${response.data.totalRows} products.`
      );
      revalidator.revalidate();
    } catch (error) {
      toast.error(error.response?.data?.error || "Bulk upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleGeneratePromo = async (product) => {
    setGeneratingProductId(product.productId);
    try {
      const response = await apiClient.post(
        `/vendor/products/${product.productId}/generate-promo`
      );
      setPostContent(response.data.promoText);
      setLinkedProductId(product.productId);
      toast.success("AI promo generated — review it below and publish!");
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to generate promo text."
      );
    } finally {
      setGeneratingProductId(null);
    }
  };

  const handleCreatePost = async (event) => {
    event.preventDefault();
    if (!postContent.trim()) {
      toast.error("Write something before posting.");
      return;
    }
    setPosting(true);
    try {
      await apiClient.post("/social/posts", {
        content: postContent,
        imageUrl: postImageUrl || null,
        productId: linkedProductId || null,
      });
      toast.success("Post published to your followers!");
      setPostContent("");
      setPostImageUrl("");
      setLinkedProductId(null);
      revalidator.revalidate();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to publish post.");
    } finally {
      setPosting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await apiClient.delete(`/social/posts/${postId}`);
      toast.success("Post deleted.");
      revalidator.revalidate();
    } catch (error) {
      toast.error("Failed to delete post.");
    }
  };

  return (
    <div className="min-h-[852px] container mx-auto px-6 py-12 font-primary dark:bg-darkbg space-y-10">
      <PageTitle title={`Vendor Dashboard — ${profile.storeName}`} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-center">
        <div className="bg-white dark:bg-gray-700 rounded-md shadow-md p-4">
          <p className="text-2xl font-bold text-primary dark:text-light">
            {profile.followerCount}
          </p>
          <p className="text-gray-600 dark:text-gray-400">Followers</p>
        </div>
        <div className="bg-white dark:bg-gray-700 rounded-md shadow-md p-4">
          <p className="text-2xl font-bold text-primary dark:text-light">
            {profile.postCount}
          </p>
          <p className="text-gray-600 dark:text-gray-400">Posts</p>
        </div>
        <div className="bg-white dark:bg-gray-700 rounded-md shadow-md p-4">
          <p className="text-2xl font-bold text-primary dark:text-light">
            {myPosts.length}
          </p>
          <p className="text-gray-600 dark:text-gray-400">Loaded Posts</p>
        </div>
      </div>

      {/* Bulk Upload */}
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-700 shadow-md rounded-lg px-8 py-6">
        <h2 className="text-2xl font-bold text-primary dark:text-light mb-2">
          Bulk Upload Products
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
          Upload a CSV or Excel (.xlsx) file with columns:{" "}
          <code>name, description, price, popularity, imageUrl</code>. The
          first row must be the header.
        </p>
        <form onSubmit={handleBulkUpload} className="space-y-4">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className={textFieldStyle}
          />
          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-2 text-white dark:text-black rounded-md transition duration-200 bg-primary dark:bg-light hover:bg-dark dark:hover:bg-lighter"
          >
            {uploading ? "Uploading..." : "Upload Products"}
          </button>
        </form>

        {uploadResult && (
          <div className="mt-4 border-t pt-4 text-sm">
            <p className="text-gray-800 dark:text-gray-200">
              Total rows: {uploadResult.totalRows} • Succeeded:{" "}
              <span className="text-green-600 font-semibold">
                {uploadResult.successCount}
              </span>{" "}
              • Failed:{" "}
              <span className="text-red-500 font-semibold">
                {uploadResult.failureCount}
              </span>
            </p>
            {uploadResult.errors?.length > 0 && (
              <ul className="mt-2 max-h-40 overflow-y-auto list-disc list-inside text-red-500">
                {uploadResult.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Your Products */}
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-700 shadow-md rounded-lg px-8 py-6">
        <h2 className="text-2xl font-bold text-primary dark:text-light mb-4">
          Your Products
        </h2>
        {myProducts.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            No products yet — upload some above to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {myProducts.map((product) => (
              <div
                key={product.productId}
                className="flex items-center justify-between border border-gray-200 dark:border-gray-600 rounded-md p-3"
              >
                <div className="flex items-center min-w-0">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-md mr-3 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500">₹{product.price}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleGeneratePromo(product)}
                  disabled={generatingProductId === product.productId}
                  className="ml-4 shrink-0 px-4 py-2 text-sm rounded-md transition duration-200 bg-primary dark:bg-light text-white dark:text-black hover:bg-dark dark:hover:bg-lighter disabled:opacity-60"
                >
                  {generatingProductId === product.productId
                    ? "Generating..."
                    : "✨ Generate AI Promo"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create a promo post */}
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-700 shadow-md rounded-lg px-8 py-6">
        <h2 className="text-2xl font-bold text-primary dark:text-light mb-4">
          Share an Update with Your Followers
        </h2>
        {linkedProductId && (
          <div className="flex items-center justify-between bg-primary/10 dark:bg-light/10 text-primary dark:text-light text-sm rounded-md px-3 py-2 mb-4">
            <span>
              Linked to:{" "}
              {myProducts.find((p) => p.productId === linkedProductId)
                ?.name || "product"}
            </span>
            <button
              type="button"
              onClick={() => setLinkedProductId(null)}
              className="ml-3 underline"
            >
              Unlink
            </button>
          </div>
        )}
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className={labelStyle}>What's new?</label>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="New arrivals, discounts, restocks..."
              className={textFieldStyle}
            />
          </div>
          <div>
            <label className={labelStyle}>Image URL (optional)</label>
            <input
              type="text"
              value={postImageUrl}
              onChange={(e) => setPostImageUrl(e.target.value)}
              placeholder="https://..."
              className={textFieldStyle}
            />
          </div>
          <button
            type="submit"
            disabled={posting}
            className="px-6 py-2 text-white dark:text-black rounded-md transition duration-200 bg-primary dark:bg-light hover:bg-dark dark:hover:bg-lighter"
          >
            {posting ? "Publishing..." : "Publish Post"}
          </button>
        </form>
      </div>

      {/* My posts */}
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-primary dark:text-light">
          Your Posts
        </h2>
        {myPosts.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            You haven't posted anything yet.
          </p>
        ) : (
          myPosts.map((post) => (
            <div
              key={post.postId}
              className="bg-white dark:bg-gray-700 shadow-md rounded-md p-4"
            >
              <div className="flex justify-between items-start">
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {post.content}
                </p>
                <button
                  onClick={() => handleDeletePost(post.postId)}
                  className="text-red-500 hover:text-red-600 text-sm ml-4 shrink-0"
                >
                  Delete
                </button>
              </div>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="mt-2 max-h-48 rounded-md object-cover"
                />
              )}
              <p className="text-sm text-gray-500 mt-2">
                {post.likeCount} likes • {post.commentCount} comments
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export async function vendorDashboardLoader() {
  try {
    const [profileRes, myPostsRes, myProductsRes] = await Promise.all([
      apiClient.get("/vendor/profile"),
      apiClient.get("/social/posts/mine"),
      apiClient.get("/vendor/products"),
    ]);
    return {
      profile: profileRes.data,
      myPosts: myPostsRes.data,
      myProducts: myProductsRes.data,
    };
  } catch (error) {
    throw new Response(
      error.response?.data?.errorMessage ||
        error.message ||
        "Failed to load vendor dashboard. Please try again.",
      { status: error.status || 500 }
    );
  }
}
