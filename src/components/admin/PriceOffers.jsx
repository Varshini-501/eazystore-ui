import React, { useEffect, useState } from "react";
import PageTitle from "../PageTitle";
import apiClient from "../../api/apiClient";
import { toast } from "react-toastify";

export default function PriceOffers() {
  const [selectedOffer, setSelectedOffer] = useState("NONE");
  const [currentOffer, setCurrentOffer] = useState("NONE");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchCurrentOffer = async () => {
      try {
        const response = await apiClient.get("/admin/price-offer");

        setSelectedOffer(response.data.offer || "NONE");
        setCurrentOffer(response.data.offer || "NONE");
        setDiscount(response.data.discount || 0);
      } catch (error) {
        toast.error("Failed to load current offer.");
      } finally {
        setFetching(false);
      }
    };

    fetchCurrentOffer();
  }, []);

  const handleApplyOffer = async () => {
    try {
      setLoading(true);

      const response = await apiClient.post(
        `/admin/price-offer?offer=${selectedOffer}`
      );

      setCurrentOffer(response.data.offer);
      setDiscount(response.data.discount);

      if (selectedOffer === "NONE") {
        toast.success("Offer removed.");
      } else if (selectedOffer === "FESTIVE") {
        toast.success("Festive offer applied.");
      } else {
        toast.success("Weekend offer applied.");
      }
    } catch (error) {
      toast.error("Failed to apply offer.");
    } finally {
      setLoading(false);
    }
  };

  const getOfferName = () => {
    switch (currentOffer) {
      case "FESTIVE":
        return "Festive Offer";
      case "WEEKEND":
        return "Weekend Offer";
      default:
        return "No Offer";
    }
  };

  return (
    <div className="min-h-[852px] container mx-auto px-6 py-12 font-primary dark:bg-darkbg">
      <PageTitle title="Price Offers" />

      <div className="max-w-xl mx-auto mt-8 bg-white dark:bg-gray-700 shadow-md rounded-md p-6">
        <h2 className="text-xl font-semibold text-primary dark:text-light mb-6">
          Select an Offer
        </h2>

        {fetching ? (
          <p className="text-gray-600 dark:text-lighter">
            Loading current offer...
          </p>
        ) : (
          <>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer text-lg text-primary dark:text-lighter">
                <input
                  type="radio"
                  name="offer"
                  value="FESTIVE"
                  checked={selectedOffer === "FESTIVE"}
                  onChange={(e) => setSelectedOffer(e.target.value)}
                  className="w-5 h-5"
                />
                Festive — 50% OFF
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-lg text-primary dark:text-lighter">
                <input
                  type="radio"
                  name="offer"
                  value="WEEKEND"
                  checked={selectedOffer === "WEEKEND"}
                  onChange={(e) => setSelectedOffer(e.target.value)}
                  className="w-5 h-5"
                />
                Weekend — 20% OFF
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-lg text-primary dark:text-lighter">
                <input
                  type="radio"
                  name="offer"
                  value="NONE"
                  checked={selectedOffer === "NONE"}
                  onChange={(e) => setSelectedOffer(e.target.value)}
                  className="w-5 h-5"
                />
                No Offer — Regular Price
              </label>
            </div>

            <button
              onClick={handleApplyOffer}
              disabled={loading}
              className="mt-8 px-6 py-3 bg-primary dark:bg-light text-white dark:text-primary font-semibold rounded-md hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Applying..." : "Apply Offer"}
            </button>

            <div className="mt-8 p-4 rounded-md bg-gray-100 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-primary dark:text-light">
                Current Offer
              </h3>

              <p className="mt-2 text-gray-700 dark:text-lighter">
                {getOfferName()}
              </p>

              <p className="mt-1 text-gray-600 dark:text-gray-300">
                Discount: {discount}%
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
