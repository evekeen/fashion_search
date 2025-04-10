import { useRouter } from "next/router";
import { Button } from "../../components/ui/button";

export default function AuthError() {
  const router = useRouter();
  const { error } = router.query;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md">
        <div className="flex flex-col items-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Authentication Error</h2>
          <p className="mt-2 text-sm text-red-600">
            {error || "An error occurred during authentication"}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <Button
            onClick={() => router.push("/auth/signin")}
            className="w-full"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
} 