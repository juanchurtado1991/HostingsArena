import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Video Studio - HostingArena',
    description: 'AI-Powered News Video Generation Studio',
};

export default function StudioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black text-white w-full h-full">
            {children}
        </div>
    );
}
