import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import FashionUploadForm from "../components/FashionUploadForm";
import SearchCount from "../components/SearchCount";
import SiteLogo from "../components/SiteLogo";
import { Button } from "../components/ui/button";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen relative">
      <Head>
        <title>Dashboard | Fashion Search</title>
        <meta name="description" content="Get personalized fashion recommendations based on your style preferences and photos." />
      </Head>

      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <SiteLogo size="medium" />
          <div className="flex items-center gap-4">
            <SearchCount />
            <div className="flex items-center gap-2">
              <img 
                src={session.user?.image || "/images/default-avatar.png"} 
                alt={session.user?.name || "User"} 
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium">{session.user?.name}</span>
            </div>
            <Button 
              variant="outline" 
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <FashionUploadForm />
      </main>
    </div>
  );
} 