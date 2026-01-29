
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveContainer, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, LineChart, Line, PieChart, Pie, Cell, Sector } from 'recharts';
import { StatsCard } from '@/components/stats-card';
import { DollarSign, Users, Ticket, Shirt } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCollection, useFirestore } from '@/firebase';
import type { Race, Order, Participant } from '@/lib/types';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#6B46C1', '#A769E5', '#D5B7F3', '#482A8C'];

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`Qtd ${value}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`( ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


export default function AdminReportsPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const firestore = useFirestore();

  // Firestore Data Hooks
  const racesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'races') : null, [firestore]);
  const { data: races, loading: loadingRaces } = useCollection<Race>(racesQuery);

  const ordersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'orders') : null, [firestore]);
  const { data: orders, loading: loadingOrders } = useCollection<Order>(ordersQuery);

  const participantsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'participants') : null, [firestore]);
  const { data: participants, loading: loadingParticipants } = useCollection<Participant>(participantsQuery);
  
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatCompactCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(value);

  const processedData = useMemo(() => {
    if (!orders || !participants || !races) return null;

    let filteredOrders = orders;
    let filteredParticipants = participants;

    if (selectedEventId !== 'all') {
      filteredParticipants = participants.filter(p => p.raceId === selectedEventId);
      const participantOrderIds = new Set(filteredParticipants.map(p => p.orderId));
      filteredOrders = orders.filter(o => participantOrderIds.has(o.id));
    }
    
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const developerCommission = totalRevenue * 0.1;
    const totalRegistrations = filteredParticipants.length;
    const averageTicket = totalRegistrations > 0 ? totalRevenue / totalRegistrations : 0;

    const monthlyRevenueData = filteredOrders.reduce((acc, order) => {
        const date = (order.orderDate as any).toDate ? (order.orderDate as any).toDate() : new Date(order.orderDate);
        const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        acc[month] = (acc[month] || 0) + order.totalAmount;
        return acc;
    }, {} as Record<string, number>);

    const monthlyRevenue = Object.entries(monthlyRevenueData).map(([month, revenue]) => ({
      month,
      revenue,
    })).sort((a,b) => new Date(a.month).getTime() - new Date(b.month).getTime());
    

    const genderData = filteredParticipants.reduce((acc, p) => {
        const gender = p.userProfile?.gender || 'N/A';
        const existing = acc.find(g => g.name === gender);
        if (existing) {
            existing.value++;
        } else {
            acc.push({ name: gender, value: 1 });
        }
        return acc;
    }, [] as { name: string, value: number }[]);

    const shirtSizeData = filteredParticipants.reduce((acc, p) => {
        const size = p.shirtSize || 'N/A';
        const existing = acc.find(s => s.name === size);
        if (existing) {
            existing.value++;
        } else {
            acc.push({ name: size, value: 1 });
        }
        return acc;
    }, [] as { name: string, value: number }[]);

    const registrationsByEvent = races.map(race => ({
        name: race.name,
        registrations: participants.filter(p => p.raceId === race.id).length
    }));
    
    return { totalRevenue, developerCommission, totalRegistrations, averageTicket, monthlyRevenue, genderData, shirtSizeData, registrationsByEvent };
  }, [selectedEventId, orders, participants, races]);

  const loading = loadingRaces || loadingOrders || loadingParticipants;

  if (loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
    )
  }
  
  if (!processedData) {
    return <div>Não foi possível carregar os dados.</div>
  }

  return (
    <>
       <div className="mb-8">
          <h1 className="text-3xl font-bold">Relatórios e Métricas</h1>
          <p className="text-muted-foreground">Analise o desempenho dos seus eventos e da plataforma.</p>
        </div>
        
        <div className="mb-6 max-w-sm">
            <label htmlFor="event-filter" className="text-sm font-medium">Filtrar por Evento</label>
             <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger id="event-filter" className="w-full bg-card">
                    <SelectValue placeholder="Todos os Eventos" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos os Eventos</SelectItem>
                    {races?.map(race => (
                        <SelectItem key={race.id} value={race.id}>{race.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>


      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="registrations">Inscrições</TabsTrigger>
          <TabsTrigger value="demographics">Demografia</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatsCard title="Receita Total" value={formatCurrency(processedData.totalRevenue)} icon={DollarSign} description="Soma de todos os eventos" />
                <StatsCard title="Comissão Devs (10%)" value={formatCurrency(processedData.developerCommission)} icon={DollarSign} description="Valor para desenvolvedores" />
                <StatsCard title="Total de Inscrições" value={processedData.totalRegistrations.toLocaleString('pt-BR')} icon={Users} description="Inscrições pagas e confirmadas" />
                <StatsCard title="Ticket Médio" value={formatCurrency(processedData.averageTicket)} icon={Ticket} description="Receita / Inscrições" />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Receita Mensal</CardTitle>
                    <CardDescription>Evolução do faturamento total.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={processedData.monthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis tickFormatter={(value: number) => formatCompactCurrency(value)} />
                            <Tooltip formatter={(value: number) => [formatCurrency(value), 'Receita']} />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" name="Receita" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="financial">
           <Card>
            <CardHeader>
              <CardTitle>Análise Financeira</CardTitle>
              <CardDescription>Detalhes sobre a receita e desempenho dos eventos.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={processedData.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value: number) => formatCompactCurrency(value)} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), 'Receita']} />
                    <Legend />
                    <Bar dataKey="revenue" name="Receita Mensal" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registrations">
             <Card>
                <CardHeader>
                    <CardTitle>Inscrições por Evento</CardTitle>
                    <CardDescription>Performance de cada evento em número de inscritos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart layout="vertical" data={processedData.registrationsByEvent}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={120} />
                            <Tooltip formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Inscrições']} />
                            <Legend />
                            <Bar dataKey="registrations" name="Inscrições" fill="hsl(var(--primary))" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </TabsContent>

         <TabsContent value="demographics" className="grid md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Distribuição por Gênero</CardTitle>
                </CardHeader>
                <CardContent>
                   <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={processedData.genderData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label>
                                {processedData.genderData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Total']} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Distribuição de Camisetas</CardTitle>
                    <CardDescription>Logística de kits por tamanho.</CardDescription>
                </CardHeader>
                 <CardContent>
                   <ResponsiveContainer width="100%" height={300}>
                         <PieChart>
                            <Pie
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                data={processedData.shirtSizeData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="hsl(var(--primary))"
                                dataKey="value"
                                onMouseEnter={onPieEnter}
                            />
                             <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
