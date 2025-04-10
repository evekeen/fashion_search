import { useSession } from "next-auth/react"
import Image from 'next/image'
import { useRouter } from "next/router"

const SignatureStyle = () => {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleGetStarted = () => {
    if (status === "authenticated") {
      router.push("/dashboard")
    } else {
      router.push("/auth/signin?callbackUrl=/dashboard")
    }
  }

  return (
    <section className="flex items-center justify-between py-16 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="relative w-1/2">
        <div className="relative w-full h-[600px]">
          <Image
            src="/images/photo3.jpg"
            alt="Fashion illustration"
            fill
            className="object-contain"
            priority
          />
        </div>        
      </div>
      
      <div className="w-1/2 pl-12">
        <div className="mb-6">
          <span className="text-sm font-medium tracking-wider text-gray-600">AI-POWERED STYLE</span>
        </div>
        
        <h2 className="text-5xl font-serif mb-8">Discover Your Signature Style</h2>
        
        <p className="text-gray-600 mb-12">
          Our cutting-edge AI analyzes thousands of fashion trends, styles, and combinations to provide you with personalized recommendations that express your unique essence.
        </p>

        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">1</div>
            <div>
              <h3 className="font-medium text-xl mb-2">Upload Reference Images</h3>
              <p className="text-gray-600">Share photos that inspire your style vision or specific items you're seeking.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">2</div>
            <div>
              <h3 className="font-medium text-xl mb-2">Add Your Style Preferences</h3>
              <p className="text-gray-600">Describe your style goals with specific details to refine your search.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">3</div>
            <div>
              <h3 className="font-medium text-xl mb-2">Explore Curated Recommendations</h3>
              <p className="text-gray-600">Browse personalized outfit suggestions and similar items that elevate your style identity.</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleGetStarted}
          className="mt-12 bg-black text-white px-8 py-3 rounded-full flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          Begin Your Style Journey
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.75 6.75L19.25 12L13.75 17.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 12H4.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </section>
  )
}

export default SignatureStyle 