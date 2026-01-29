'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EventAdminTabsProps {
    raceId: string;
}

export function EventAdminTabs({ raceId }: EventAdminTabsProps) {
    const pathname = usePathname();
    const router = useRouter();

    // Determine the active tab based on the current URL
    const getActiveTab = () => {
        if (pathname.includes('/registrations')) {
            return 'registrations';
        }
        if (pathname.includes('/settings')) {
            return 'settings';
        }
        if (pathname.includes('/results')) {
            return 'results';
        }
        return 'details';
    }
    
    const activeTab = getActiveTab();

    const handleTabChange = (value: string) => {
        if (value === 'details') {
            router.push(`/admin/events/${raceId}`);
        } else {
            router.push(`/admin/events/${raceId}/${value}`);
        }
    };

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="registrations">Inscritos</TabsTrigger>
                <TabsTrigger value="results">Resultados</TabsTrigger>
                <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
        </Tabs>
    );
}
