
"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import Link from 'next/link';
import Image from 'next/image';
import type { ThemedRace } from "@/lib/themed-races-data";

interface ColorChangeCardsProps {
  cards: ThemedRace[];
}

export const ColorChangeCards = ({ cards }: ColorChangeCardsProps) => {
  return (
    <div className="mx-auto grid w-full grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
      {cards.map((card) => (
        <Card
          key={card.slug}
          heading={card.heading}
          description={card.description}
          imgSrc={card.imgSrc}
          logoSrc={card.logoSrc}
          imageHint={card.imageHint}
          href={`/corrida-tematica/${card.slug}`}
        />
      ))}
    </div>
  );
};

// --- Card Component ---
interface CardProps {
  heading: string;
  description: string;
  imgSrc: string;
  logoSrc: string;
  imageHint: string;
  href: string;
}

const Card = ({ heading, description, imgSrc, logoSrc, imageHint, href }: CardProps) => {
  return (
    <Link href={href} className="group">
      <div className="flex flex-col h-full">
        {/* Text Section */}
        <div className="p-4 bg-card rounded-t-lg border-x border-t">
          <h4 className="font-semibold text-xl text-foreground uppercase">
            {heading}
          </h4>
          <p className="text-sm text-muted-foreground mt-1 h-10 line-clamp-2">{description}</p>
        </div>
        
        {/* Image Section */}
        <motion.div
          transition={{ staggerChildren: 0.035 }}
          whileHover="hover"
          className="relative w-full cursor-pointer overflow-hidden rounded-b-lg border-x border-b aspect-[16/9]"
        >
          <Image
              src={imgSrc}
              alt={heading}
              fill
              className="absolute inset-0 object-cover saturate-0 transition-all duration-500 group-hover:saturate-100"
              sizes="(max-width: 768px) 100vw, 50vw"
              data-ai-hint={imageHint}
          />
           {logoSrc && (
            <Image
              src={logoSrc}
              alt={`${heading} logo`}
              width={80}
              height={80}
              className="absolute top-4 left-4 z-10 w-20 h-auto"
            />
          )}
          <div className="absolute z-10 bottom-4 right-4 text-white">
             <FiArrowRight className="text-3xl transition-transform duration-500 group-hover:-rotate-45" />
          </div>
        </motion.div>
      </div>
    </Link>
  );
};
