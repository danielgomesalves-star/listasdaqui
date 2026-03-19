import { BottomNav } from '@/components/layout/BottomNav';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-bg2 flex flex-col items-center justify-start min-h-screen">
            <div className="w-full max-w-[480px] bg-bg min-h-screen relative overflow-x-hidden md:shadow-custom-lg md:ring-1 md:ring-border">
                {children}
                <BottomNav />
            </div>
        </div>
    )
}
