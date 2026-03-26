import { Header } from "@/components/nav/header";
import { BottomNav } from "@/components/nav/bottom-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-20 pt-4">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
