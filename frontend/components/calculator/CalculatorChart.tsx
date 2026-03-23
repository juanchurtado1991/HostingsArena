"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GlassCard } from "@/components/ui/GlassCard";

interface CalculatorChartProps {
    data: any[];
    provider1Name: string;
    provider2Name: string;
}

export function CalculatorChart({ data, provider1Name, provider2Name }: CalculatorChartProps) {
    if (!data || data.length === 0) return null;

    return (
        <GlassCard className="p-4 md:p-6 md:p-8 min-h-[300px] flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-3 right-3 text-xs font-mono text-muted-foreground/20 pointer-events-none hidden md:block">
                PREDICTIVE MODEL v2.1
            </div>
            <div className="h-[220px] md:h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis 
                            dataKey="month" 
                            tickFormatter={(val) => `${Math.floor(val / 12)}Y`} 
                            stroke="#9ca3af" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                        />
                        <YAxis 
                            tickFormatter={(val) => `$${val}`} 
                            stroke="#9ca3af" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value: any) => [`$${value}`, '']}
                            labelFormatter={(label) => `Month ${label}`}
                        />
                        <Legend verticalAlign="top" height={36} />
                        <Line 
                            name={provider1Name} 
                            type="monotone" 
                            dataKey={provider1Name} 
                            stroke="#ef4444" 
                            strokeWidth={3} 
                            dot={false} 
                            activeDot={{ r: 6 }} 
                        />
                        <Line 
                            name={provider2Name} 
                            type="monotone" 
                            dataKey={provider2Name} 
                            stroke="#22c55e" 
                            strokeWidth={3} 
                            dot={false} 
                            activeDot={{ r: 6 }} 
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    );
}
