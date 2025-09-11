"use client";

import { loadStripe } from "@stripe/stripe-js";
import React from "react";
import './styles.css'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PhotoSizeSelectSmallIcon from '@mui/icons-material/PhotoSizeSelectSmall';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import FormatColorResetIcon from '@mui/icons-material/FormatColorReset';
import DownloadIcon from '@mui/icons-material/Download';
import EggIcon from '@mui/icons-material/Egg';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

export default function FirstPage() {
  async function handleCheckout(mode: "subscription" | "one_time" | "free") {
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });

      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }

      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load");

      // Redirect to Checkout. Prefer sessionId if present otherwise open the returned url.
      const sessionId = data.url ? new URL(data.url).searchParams.get("session_id") : null;
      if (sessionId) {
        await stripe.redirectToCheckout({ sessionId });
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message ?? String(err));
    }
  }

  const stats = [
    { id: 1, name: "That's the current estimated size of the global puzzle market. The market is not only massive but also continues to grow, with a projected compound annual growth rate (CAGR) of 6.4% from 2025 to 2033. This consistent demand ensures your books have a large and active audience of buyers.", value: '$11.2 Billion' },
    { id: 2, name: "This is the projected compound annual growth rate (CAGR) of the global print-on-demand market from 2025 to 2033, with the market size expected to reach $59.4 billion. This shows that the business model of print-on-demand is not just a trend but a rapidly expanding industry, making it a very strong long-term investment.", value: '20.89%' },
    { id: 3, name: "Top-selling puzzle books on Amazon can generate hundreds of sales per month. One example of a puzzle book for adults and seniors with a competitive price had an estimated monthly sales volume of 613, while others consistently saw 300-500+ sales per month. This demonstrates the potential for consistent and passive income from a single book.", value: '~500' },
  ]

  return (
    <>
      <section className="bg-white dark:bg-gray-900" style={{ width: "100%" }}>
        <div className="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
          <div className="mr-auto place-self-center lg:col-span-7">
            <h1 style={{ color: "rgb(252 208 244)" }} className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-white">
              Puzzle Book Generator for Amazon KDP</h1>
            <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">
              Riddleit is the all-in-one puzzle book generator that turns your creative ideas into a profitable side hustle on Amazon KDP.</p>
            <a href="#pricing" className="inline-flex items-center justify-center px-5 py-3 mr-3 text-base font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900">
              Get started
              <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </a>
            <a style={{ backgroundColor: "rgb(165 78 252)", borderRadius: 50 }} href="#pricing" className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
              Choose your plan
            </a>
          </div>
          <div className="hidden lg:mt-0 lg:col-span-5 lg:flex">
            <img src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/hero/phone-mockup.png" alt="mockup" />
          </div>
        </div>
      </section>

      <section className="features bg-white dark:bg-gray-900" style={{ width: "100%" }} id="features">
        <div className="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold " style={{ color: "rgb(252 208 244)" }}>Everything You Need to Create</h2>
          <p className="mb-5 font-light text-gray-500 sm:text-xl dark:text-gray-400">Powerful features that make puzzle book creation effortless</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><PhotoSizeSelectSmallIcon sx={{ color: "#ffff47" }} /></div>
            <h3 className="tracking-tight font-extrabold">Drag & Drop Editor</h3>
            <p>Intuitive interface that lets you create beautiful puzzle layouts without any design experience. Simply drag, drop, and arrange.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><AutoAwesomeIcon sx={{ color: "#ffff47" }} /></div>
            <h3 className="tracking-tight font-extrabold">AI Creative Assistant</h3>
            <p>Get intelligent suggestions, auto-generate puzzle content, and receive creative ideas powered by advanced AI technology.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><CollectionsBookmarkIcon sx={{ color: "#ffff47" }} /></div>
            <h3 className="tracking-tight font-extrabold">Bulk Creation</h3>
            <p>Create up to 500 pages at once with our Pro plans. Perfect for publishers and serious puzzle book creators.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FormatColorResetIcon sx={{ color: "#ffff47" }} /></div>
            <h3 className="tracking-tight font-extrabold">No Watermarks</h3>
            <p>Pro users enjoy completely watermark-free exports, ensuring your puzzle books look professional and polished.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><DownloadIcon sx={{ color: "#ffff47" }} /></div>
            <h3 className="tracking-tight font-extrabold">Instant Export</h3>
            <p>Download your creations instantly in multiple formats. Print-ready PDFs, digital formats, and more.</p>
          </div>
          <a href="#">
            <div className="feature-card" style={{ height: "100%" }}>
              <div className="feature-icon"><EggIcon sx={{ color: "#ffff47" }} /></div>
            </div>
          </a>
        </div>
      </section>

      <div className="bg-gray-900 py-24 sm:py-32" style={{ width: "100%" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.id} className="mx-auto flex max-w-xs flex-col gap-y-4">
                <dt className="text-base/7 text-gray-400">{stat.name}</dt>
                <dd style={{ color: "rgb(252 208 244)" }} className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section className="bg-white dark:bg-gray-900" style={{ width: "100%" }}>
        <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
          <div className="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
            <h2 id="pricing" className="mb-4 text-4xl tracking-tight font-extrabold " style={{ color: "rgb(252 208 244)" }}>Simple Plans, Powerful Puzzles</h2>
            <p className="mb-5 font-light text-gray-500 sm:text-xl dark:text-gray-400">Whether you're making a single page for fun or building a publishing business, choose the plan that unlocks the features you need.</p>
          </div>
          <div className="space-y-8 lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-10 lg:space-y-0">
            <div className="flex flex-col p-6 mx-auto max-w-lg text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
              <h3 className="mb-4 text-2xl font-semibold" style={{ color: "rgb(252 208 244)" }}>Free</h3>
              <p className="font-light text-gray-500 sm:text-lg dark:text-gray-400">Best for educators, parents, and hobbyists.</p>
              <div className="flex justify-center items-baseline my-8">
                <span className="mr-2 text-5xl font-extrabold">0€</span>
                <span className="text-gray-500 dark:text-gray-400">/ month</span>
              </div>
              <ul role="list" className="mb-8 space-y-4 text-left">
                <li className="flex items-center space-x-3">
                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span>Effortless Drag & Drop Creation</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span>One Page At a Time</span>
                </li>
                <li className="flex items-center space-x-3">

                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span>Unlimited Downloads</span>
                </li>
                <li className="flex items-center space-x-3">

                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span>Watermark</span>
                </li>
              </ul>
              <div className="flex justify-center" style={{ height: "100%", width: "100%", alignItems: "flex-end" }}>
                <button
                  className="mt-2 px-4 py-2 rounded"
                  onClick={() => handleCheckout("free")}
                  style={{ backgroundColor: "rgb(252 208 244)", color: "black", borderRadius: 50, width: "100%", }}
                >
                  Get started
                </button>
              </div>
            </div>

            <div className="flex flex-col p-6 mx-auto max-w-lg text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
              <h3 className="mb-4 text-2xl font-semibold" style={{ color: "rgb(252 208 244)" }}>Monthly Pro</h3>
              <p className="font-light text-gray-500 sm:text-lg dark:text-gray-400">The essential toolkit for commercial use.</p>
              <div className="flex justify-center items-baseline my-8">
                <span className="mr-2 text-5xl font-extrabold">11€</span>
                <span className="text-gray-500 dark:text-gray-400">/month</span>
              </div>

              <ul role="list" className="mb-8 space-y-4 text-left">
                <li className="flex items-center space-x-3">

                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span>Effortless Drag & Drop Creation</span>
                </li>
                <li className="flex items-center space-x-3">

                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span>Bulk Creation (Up to 500 Pages)</span>
                </li>
                <li className="flex items-center space-x-3">

                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span>Unlimited Downloads</span>
                </li>
                <li className="flex items-center space-x-3">

                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span>100% Watermark-Free</span>
                </li>
                <li className="flex items-center space-x-3">

                  <AutoAwesomeIcon sx={{ width: 20, height: 20, color: "rgb(252 208 244)" }} />
                  <span>AI Creative Assistant</span>
                </li>
                <li className="flex items-center space-x-3">

                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span>And more...</span>
                </li>
              </ul>
              <div className="flex justify-center" style={{ height: "100%", width: "100%", alignItems: "flex-end" }}>

                <button
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
                  onClick={() => handleCheckout("subscription")}
                  style={{ backgroundColor: "rgb(165 78 252)", borderRadius: 50, width: "100%", }}
                >
                  Get started
                </button>
              </div>
            </div>

            <div className="flex flex-col p-6 mx-auto max-w-lg text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
              <h3 className="mb-4 text-2xl font-semibold" style={{ color: "rgb(252 208 244)" }}>Lifetime Pro</h3>
              <p className="font-light text-gray-500 sm:text-lg dark:text-gray-400">For lifetime access to create unlimited books with a single payment.</p>
              <div className="flex justify-center items-baseline my-8">
                <span className="mr-2 text-5xl font-extrabold">300€</span>
                <span className="text-gray-500 dark:text-gray-400">/month</span>
              </div>

              <ul role="list" className="mb-8 space-y-4 text-left">
                <li className="flex items-center space-x-3"></li>
                <li className="flex items-center space-x-3">

                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span>Lifetime Access</span>
                </li>
                <li className="flex items-center space-x-3">

                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span>Effortless Drag & Drop Creation</span>
                </li>
                <li className="flex items-center space-x-3">

                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span>Bulk Creation (Up to 500 Pages)</span>
                </li>
                <li className="flex items-center space-x-3">

                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span>Unlimited Downloads</span>
                </li>
                <li className="flex items-center space-x-3">

                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span>100% Watermark-Free</span>
                </li>
                <li className="flex items-center space-x-3">

                  <AutoAwesomeIcon sx={{ width: 20, height: 20, color: "rgb(252 208 244)" }} />
                  <span>AI Creative Assistant</span>
                </li>
                <li className="flex items-center space-x-3">

                  <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  <span>And more...</span>
                </li>
              </ul>
              <button
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
                onClick={() => handleCheckout("one_time")}
                style={{ backgroundColor: "rgb(165 78 252)", borderRadius: 50 }}
              >
                Get started
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
