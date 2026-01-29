
import { HeartPulse, PersonStanding } from 'lucide-react';

export function MotivationalQuote() {
    return (
        <section className="bg-muted/40 py-6">
            <div className="container text-center">
                <div className="max-w-2xl mx-auto">
                    <h3 className="text-sm uppercase tracking-[0.3em] text-muted-foreground font-medium">
                        A cada passo e em cada respiração, você fica mais perto do seu próximo desafio.
                    </h3>
                    <div className="flex items-center justify-center gap-6 mt-4 text-primary">
                        <PersonStanding className="h-6 w-6" />
                        <HeartPulse className="h-5 w-5" />
                        <PersonStanding className="h-6 w-6 transform -scale-x-100" />
                    </div>
                </div>
            </div>
        </section>
    );
}
