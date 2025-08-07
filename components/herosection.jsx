"use client";
import React, { useRef, useEffect } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";

const HeroSection = () => {
  const imageRef = useRef();

  useEffect(() => {
    const imgElement = imageRef.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;
      if (scrollPosition > scrollThreshold) {
        imgElement.classList.add("scrolled");
      } else {
        imgElement.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="pb-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="pb-6 text-5xl md:text-8xl lg:text-[105px] pr-2 font-extrabold tracking-tight bg-gradient-to-br from-blue-600 to-purple-600  text-transparent bg-clip-text ">
          Manage Your Finances <br /> with Intelligence
        </h1>
        <p className="text-xl max-w-2xl mx-auto text-gray-600 mb-8">
          An AI-powered financial management platform that helps you track,
          analyze, and optimize your spending with real-time insights.
        </p>
        <div>
          <Link href={"/dashboard"}>
            <div>
              <Button variant="default">Get Started</Button>
            </div>
          </Link>
        </div>
        <div className="hero-image-wrapper">
          <div ref={imageRef} className="hero-image">
            <Image
              src={"/banner.jpeg"}
              width={1280}
              height={720}
              alt="banner image"
              className="mx-auto border shadow-2xl rounded-lg"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
