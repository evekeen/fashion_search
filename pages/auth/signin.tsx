import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "../../components/ui/button";

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { callbackUrl } = router.query;

  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl as string || "/dashboard");
    }
  }, [status, router, callbackUrl]);

  const handleGoogleSignIn = () => {
    signIn("google", { 
      callbackUrl: callbackUrl as string || "/dashboard",
      redirect: true
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Head>
        <title>Sign In | Fashion Search</title>
        <meta name="description" content="Sign in to Fashion Search to get personalized fashion recommendations" />
      </Head>

      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md">
        <div className="flex flex-col items-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Sign in to your account</h2>          
        </div>

        <div className="mt-8 space-y-6">
          <Button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-6 text-lg"
            variant="outline"
          >
            <FcGoogle className="w-6 h-6" />
            <span>Continue with Google</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 