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
          alt="Friends at a Brooklyn bar after a movie"
          fill
          className="object-cover"
          priority
          sizes="50vw"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, transparent 50%, #fefaf0 100%)" }}
        />
        <div className="absolute bottom-12 left-12 right-24">
          <blockquote
            className="text-xl font-medium italic"
            style={{ lineHeight: 1.6, color: "#ffffff", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
          >
            &ldquo;The best movie conversations happen right after you walk
            out.&rdquo;
          </blockquote>
        </div>
      </div>

      {/* Right: form */}
      <main
        className="flex w-full flex-col items-center justify-center px-8 py-12 lg:w-1/2"
        style={{ backgroundColor: "#fefaf0" }}
      >
        <LoginForm />
      </main>
    </div>
  );
}
