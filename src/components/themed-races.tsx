
'use client';

import React from "react";
import { ColorChangeCards } from "@/components/ui/color-change-card";
import { THEMED_RACES_DATA } from "@/lib/themed-races-data";

export const ThemedRaces = () => {
  return (
    <section className="bg-background py-8 sm:py-16">
        <div className="container">
            <div className="text-center mb-12">
                <span className='font-semibold uppercase text-primary tracking-wider'>Nossos Eventos</span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-2">
                    Corridas Temáticas
                </h2>
            </div>
            <ColorChangeCards cards={THEMED_RACES_DATA} />
        </div>
    </section>
  );
};
