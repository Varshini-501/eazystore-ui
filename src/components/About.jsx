import React from "react";

import PageTitle from "./PageTitle";

export default function About() {
  const h3Style =
    "text-lg font-semibold text-primary dark:text-light mb-2";

  const pStyle = "text-gray-600 dark:text-lighter";

  return (
    <div className="max-w-[1152px] min-h-[852px] mx-auto px-6 py-8 font-primary">
      <PageTitle title="About Us" />

      {/* About VKART Content */}
      <p className="leading-6 mb-8 text-gray-600 dark:text-lighter">
        <span className="text-lg font-semibold text-primary dark:text-light">
          VKART
        </span>{" "}
        is a modern online shopping platform designed to make discovering,
        exploring, and purchasing products simple and convenient. Our goal is
        to provide customers with a smooth shopping experience while bringing
        a variety of products together in one place.
      </p>

      {/* Why Choose Us Section */}
      <h2 className="text-2xl leading-[32px] font-bold text-primary dark:text-light mb-6">
        Why Choose VKART?
      </h2>

      {/* Features */}
      <div className="space-y-8">
        {/* Feature: Quality Products */}
        <div>
          <h3 className={h3Style}>Quality Products</h3>
          <p className={pStyle}>
            We aim to offer products that provide great value and meet the
            expectations of our customers. Every product is presented with
            clear information to help you make confident purchasing decisions.
          </p>
        </div>

        {/* Feature: Easy Shopping */}
        <div>
          <h3 className={h3Style}>Easy Shopping Experience</h3>
          <p className={pStyle}>
            VKART is designed with simplicity in mind. From browsing products
            and adding items to your cart to checkout and payment, every step
            is designed to be convenient and easy to use.
          </p>
        </div>

        {/* Feature: Secure & Reliable */}
        <div>
          <h3 className={h3Style}>Secure & Reliable</h3>
          <p className={pStyle}>
            We focus on providing a reliable shopping experience with secure
            authentication, protected customer information, and a smooth
            order and payment process.
          </p>
        </div>

        {/* Feature: Customer First */}
        <div>
          <h3 className={h3Style}>Customer First</h3>
          <p className={pStyle}>
            Customer satisfaction is at the heart of VKART. We strive to make
            shopping straightforward, enjoyable, and accessible while
            continuously improving the experience.
          </p>
        </div>
      </div>
    </div>
  );
}
