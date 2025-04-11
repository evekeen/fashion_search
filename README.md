# Fashion Perplexity

A personalized fashion recommendation platform that allows users to upload images reflecting their preferred fashion aesthetics, describe their desired style, and receive targeted fashion recommendations.

## Features

- Image upload for fashion preferences
- Style description form (skin color, gender, expression, etc.)
- AI-powered search command generation
- Real-time fashion recommendations
- Responsive user interface
- Category-based product search results
- Visual style generation with AI
- Search tracking and rate limiting
- Redis-based data persistence

## Tech Stack

- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: OpenAI's ChatGPT API, Hugging Face
- **Search Integration**: SerpApi, SearchAPI.io
- **Data Storage**: Redis
- **Authentication**: NextAuth.js (Auth.js)

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- OpenAI API key
- SerpApi API key
- Hugging Face API key
- Redis instance (local or cloud)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/frido22/fashion_search.git
   cd fashion_search
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Then edit the `.env` file and add your API keys and Redis configuration:
   ```
   OPENAI_API_KEY=your_openai_api_key
   SERPAPI_API_KEY=your_serpapi_api_key
   HUGGINGFACE_API_KEY=your_huggingface_api_key
   REDIS_URL=your_redis_url
   SEARCH_LIMIT=5
   ```

### Running the Application

1. Start the development server:
   ```
   npm run dev
   ```
2. Open your browser and navigate to `http://localhost:3000`

## API Routes

- `POST /api/recommendations` - Generate fashion recommendations based on user input
  - Accepts: profile photo, inspiration images, budget, additional info
  - Returns: style description and recommended items by category

- `POST /api/search` - Search for products based on a query
  - Accepts: query string
  - Returns: list of product results with descriptions, prices, and links
  - Includes search tracking and rate limiting

## Search Tracking and Rate Limiting

The application implements search tracking and rate limiting using Redis:

- Each user's searches are tracked with a daily limit
- Search data is stored in Redis with automatic expiration
- Rate limiting is configurable via the `SEARCH_LIMIT` environment variable
- Fallback to in-memory storage when Redis is unavailable
- Search history is maintained for each user

### Redis Implementation

The Redis implementation includes:

- Connection management with automatic reconnection
- Search count tracking per user
- Search history storage (last 100 searches)
- Rate limit enforcement

## How It Works

1. Users upload their profile photo and inspiration images
2. Users provide additional style information and budget preferences
3. The application processes the images and information using AI services
4. The system generates personalized fashion recommendations
5. For each recommended item, the system searches for real products
6. Results are displayed in a category-based tab interface
7. Users can view product details and visit product pages

## Authentication Setup

This application uses NextAuth.js (Auth.js) for authentication with Google as the only provider. To set up authentication:

1. Create a Google OAuth application:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application" as the application type
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://your-production-domain.com/api/auth/callback/google` (for production)
   - Copy the Client ID and Client Secret

2. Update your `.env` file with the Google OAuth credentials:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

3. Generate a secure NEXTAUTH_SECRET:
   - You can use the following command to generate a secure secret:
     ```
     openssl rand -base64 32
     ```

4. Restart your development server after updating the environment variables.

## Protected Routes

The following routes require authentication:
- `/dashboard` - User dashboard
- `/results` - Search results page
- All API routes under `/api/*`

Users must sign in with Google to access these routes.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Setting up Vercel KV (Redis)

This application uses Vercel KV (Redis) to track user searches and implement search limits. To set up Vercel KV:

1. Install Vercel KV in your project:
   ```bash
   vercel kv add
   ```

2. Follow the prompts to create a new KV database.

3. Vercel will automatically add the necessary environment variables to your project:
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

4. For local development, create a `.env.local` file with the same environment variables.

## Search Limits

The application limits users to 5 searches per day. This is implemented using Vercel KV to track search counts.
