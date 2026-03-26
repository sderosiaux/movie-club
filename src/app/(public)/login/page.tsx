import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left: image (hidden on mobile) */}
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="/images/hero-friends.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/80" />
        <div className="absolute bottom-12 left-12 right-12">
          <blockquote className="text-xl font-medium italic text-white drop-shadow-lg">
            &ldquo;The best movie conversations happen right after you walk
            out.&rdquo;
          </blockquote>
        </div>
      </div>

      {/* Right: form */}
      <main className="flex w-full flex-col items-center justify-center px-8 py-12 lg:w-1/2">
        <LoginForm />
      </main>
    </div>
  );
}
