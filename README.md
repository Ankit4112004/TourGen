# BiharChale

BiharChale is a thoughtful travel planner that generates custom itineraries for exploring the historical and cultural depth of Bihar, India. Rather than presenting generic tourist lists, the application uses AI to construct personalized travel routes based on your pace, budget, and selected preferences.

## How it works

The platform uses Retrieval-Augmented Generation (RAG) powered by Mistral AI embeddings. When you enter your preferences, the application searches a vector database of curated local stays and activities, retrieving the most relevant options. An AI agent then evaluates these results, logically groups them by geography, and assembles a realistic day-by-day itinerary.

## Architecture

- **Frontend**: Built with React (Vite). Features a modern, responsive UI with integrated dark mode.
- **Backend**: Built with Node.js and Express. Handles API requests and orchestrates the AI agents.
- **Database**: PostgreSQL with the pgvector extension for high-performance vector similarity search.
- **AI Models**: Integrates with the Mistral API for generating embeddings and reasoning about travel plans.

## Setup Instructions

### 1. Database Setup

You will need a PostgreSQL instance with the `pgvector` extension enabled.

Update the `.env` file in the `server` directory with your database connection string and Mistral API key:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/biharchale
MISTRAL_API_KEY=your_mistral_api_key_here
```

### 2. Backend Initialization

Navigate to the server directory, install dependencies, and seed the database. The seed script will process the raw JSON data, generate embeddings via Mistral, and populate the database.

```bash
cd server
npm install
npm run seed
```

Start the backend development server:

```bash
npm run dev
```

### 3. Frontend Initialization

In a separate terminal, navigate to the client directory, install dependencies, and start the Vite development server.

```bash
cd client
npm install
npm run dev
```

The application should now be accessible at `http://localhost:5173`.
