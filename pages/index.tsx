import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import SiteLogo from "../components/SiteLogo";
import { Button } from "../components/ui/button";
import SignatureStyle from "@/components/SignatureStyle";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleGetStarted = () => {
    if (status === "authenticated") {
      router.push("/dashboard");
    } else {
      router.push("/auth/signin?callbackUrl=/dashboard");
    }
  };

  return (
    <div className="min-h-screen relative">
      <Head>
        <title>Fashion Search | AI-Powered Fashion Recommendations</title>
        <meta name="description" content="Get personalized fashion recommendations based on your style preferences and photos." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <SiteLogo size="small" />
          </div>
          <div className="flex items-center gap-8">
            <button onClick={() => router.push('/auth/signin')} className="text-gray-700 hover:text-black">Log in</button>
            <Button
              onClick={handleGetStarted}
              className="bg-black text-white hover:bg-black/90 rounded-full px-6"
            >
              Get Started →
            </Button>
          </div>
        </div>
      </nav>

      <section className="container relative mx-auto px-4 pt-32 pb-20 flex flex-col md:flex-row items-start gap-12 z-10">
        <div className="flex-1 max-w-2xl">
          <h1 className="text-6xl md:text-7xl font-bold mb-8">Fashion Search</h1>
          <p className="text-gray-600 text-xl mb-8">
            Find new styles, shop recommended "looks" and experience AI-generated fashion recommendations with Fashion Search.
          </p>
          <Button
            className="rounded-full px-8 py-6 text-lg bg-black hover:bg-black/90 text-white"
            size="lg"
            onClick={handleGetStarted}
          >
            Get Started
          </Button>
        </div>
        <div className="flex-1 relative">
          <div className="grid grid-cols-2 gap-6">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden transform rotate-[-5deg]">
              <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/80 backdrop-blur flex items-center justify-center z-10">
                <div className="w-3 h-3 rounded-full bg-white"></div>
              </div>
              <Image
                src="/images/photo1.jpg"
                alt="Fashion showcase yellow outfit"
                layout="fill"
                objectFit="cover"
                className="transform hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden transform rotate-[5deg] mt-12">
              <div className="absolute bottom-8 right-4 bg-black/80 backdrop-blur text-white text-sm px-4 py-2 rounded-full z-10">
                Discover your style
              </div>
              <Image
                src="/images/photo2.jpeg"
                alt="Fashion showcase red outfit"
                layout="fill"
                objectFit="cover"
                className="transform hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600 text-lg">
            Our advanced AI helps you discover new styles and find the perfect outfits based on your preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 mb-6 flex items-center justify-center">
              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Upload Your Style</h3>
            <p className="text-gray-600">
              Upload photos of your favorite outfits or items you love to get personalized style recommendations.
            </p>
          </div>

          <div className="flex flex-col items-center text-center relative">
            <div className="w-16 h-16 mb-6 flex items-center justify-center">
              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Visual Search</h3>
            <p className="text-gray-600">
              Find similar items or complete looks based on images from social media, magazines, or your camera roll.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 mb-6 flex items-center justify-center">
              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3L14 9L20 10L15.5 14L17 20L12 17L7 20L8.5 14L4 10L10 9L12 3Z"/>
                <path d="M5 16L3 18"/>
                <path d="M19 16L21 18"/>
                <path d="M12 20L12 23"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">AI Recommendations</h3>
            <p className="text-gray-600">
              Experience cutting-edge AI algorithms that understand your style preferences and suggest perfect matches.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 mb-6 flex items-center justify-center">
              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <path d="M3 6h18"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Shop Complete Looks</h3>
            <p className="text-gray-600">
              Discover and purchase complete outfits curated by our AI from top fashion brands and retailers.
            </p>
          </div>
        </div>
      </section>

      <SignatureStyle />

      <footer className="border-t border-gray-200 py-12 mt-20 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6 flex justify-center">
            <SiteLogo size="medium" />
          </div>
          <div className="flex justify-center space-x-8 mb-8">
            <a href="https://www.sundai.club/projects/cef5b417-173f-4000-9eae-28155847b873" target="_blank" className="text-gray-400 hover:text-white transition-colors">
              About
            </a>
          </div>
          <p className="text-gray-500"> 2025 Fashion Search. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
