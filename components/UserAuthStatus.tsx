import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "./ui/button";

export default function UserAuthStatus() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="animate-pulse flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2">
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
    );
  }

  return (
    <Button 
      variant="outline" 
      onClick={() => signIn("google", { callbackUrl: router.asPath })}
    >
      Sign In
    </Button>
  );
} 