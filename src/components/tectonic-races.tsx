
'use client';

import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Race } from '@/lib/types';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { Skeleton } from './ui/skeleton';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const KineticCard = ({ race }: { race: Race }) => {
    const router = useRouter();
    const cardRef = useRef<HTMLDivElement>(null);

    const raceDate = new Date(race.date);
    raceDate.setMinutes(raceDate.getMinutes() + raceDate.getTimezoneOffset());
    const day = raceDate.toLocaleDateString('pt-BR', { day: '2-digit' });
    const month = raceDate.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');

    const imageUrl = race.image?.startsWith('http')
        ? race.image
        : PlaceHolderImages.find(p => p.id === race.image)?.imageUrl || `https://picsum.photos/seed/${race.id}/800/600`;

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const imageEl = card.querySelector<HTMLElement>('.event-image');
        const ringEl = card.querySelector<HTMLElement>('.kinetic-ring');
        if (!imageEl || !ringEl) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const xc = rect.width / 2;
            const yc = rect.height / 2;
            const dx = x - xc;
            const dy = y - yc;

            imageEl.style.transform = `scale(1.1) translate(${dx / 20}px, ${dy / 20}px)`;
            ringEl.style.transform = `scale(1.5) translate(${dx / 10}px, ${dy / 10}px)`;
        };

        const handleMouseLeave = () => {
            imageEl.style.transform = 'scale(1) translate(0, 0)';
            ringEl.style.transform = 'scale(1) translate(0, 0)';
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div ref={cardRef} className="event-card" onClick={() => router.push(`/races/${race.id}`)}>
            <div className="event-image" style={{ backgroundImage: `url('${imageUrl}')`}}></div>
            <div className="asphalt-overlay"></div>
            <div className="perforation"></div>
            <div className="kinetic-ring"></div>
            <div className="card-body">
                <div className="card-header">
                    <div className="date-box">
                        <span className="date-day">{day}</span>
                        <span className="date-month">{month}</span>
                    </div>
                    {race.featured && <span className="status-badge">Destaque</span>}
                </div>
                <div className="card-footer">
                    <div className="location-text">{race.location}</div>
                    <h2 className="title">{race.name}</h2>
                    <div className="stats-grid">
                        {race.options.slice(0, 3).map((option, index) => (
                             <div key={index} className="stat-item">
                                <span className="stat-val">{option.distance}</span>
                                <span className="stat-lab">Distância</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


export function TectonicRaces() {
    const firestore = useFirestore();
    const trackRef = useRef<HTMLDivElement>(null);

    const nextRacesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        const today = new Date().toISOString().split('T')[0];
        return query(
            collection(firestore, 'races'),
            where('date', '>=', today),
            orderBy('date', 'asc')
        );
    }, [firestore]);

    const { data: races, loading } = useCollection<Race>(nextRacesQuery);

    const scrollTrack = (direction: number) => {
        if (trackRef.current) {
            const card = trackRef.current.querySelector('.event-card');
            const cardWidth = card ? card.clientWidth + 30 : 430; // Use default if card not found
            trackRef.current.scrollBy({
                left: direction * cardWidth,
                behavior: 'smooth'
            });
        }
    };
    
    const hasRaces = races && races.length > 0;

    if (!loading && !hasRaces) {
        return null;
    }

    return (
         <section className="bg-white py-24 sm:py-32">
            <div className="container">
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 uppercase">Próximas Corridas</h2>
                    <p className="text-lg text-slate-600 mt-4 max-w-2xl mx-auto">Garanta sua vaga nos eventos mais aguardados do ano.</p>
                </div>

                <div className="carousel-container !py-0">
                    <div className="carousel-track" ref={trackRef}>
                        {loading ? (
                            <>
                                 <Skeleton className="h-[520px] w-[400px] rounded-3xl shrink-0" />
                                 <Skeleton className="h-[520px] w-[400px] rounded-3xl shrink-0" />
                                 <Skeleton className="h-[520px] w-[400px] rounded-3xl shrink-0" />
                            </>
                        ) : (
                            races.map(race => (
                                <KineticCard key={race.id} race={race as Race} />
                            ))
                        )}
                    </div>
                    <div className="controls">
                        <button className="btn-nav text-slate-900" onClick={() => scrollTrack(-1)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                        </button>
                        <button className="btn-nav text-slate-900" onClick={() => scrollTrack(1)}>
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                        </button>
                    </div>
                </div>
            </div>
         </section>
    );
}
