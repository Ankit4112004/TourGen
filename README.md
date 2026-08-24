# BiharChale

BiharChale is a thoughtful travel planner that generates custom itineraries for exploring the historical and cultural depth of Bihar, India. Rather than presenting generic tourist lists, the application uses AI to construct personalized travel routes based on your pace, budget, and selected preferences.

## How it works

The platform uses Retrieval-Augmented Generation (RAG) powered by Mistral AI embeddings. When you enter your preferences, the application searches a vector database of curated local stays and activities, retrieving the most relevant options. An AI agent then evaluates these results, logically groups them by geography, and assembles a realistic day-by-day itinerary.

## Architecture

- **Frontend**: Built with React (Vite). Features a modern, responsive UI with integrated dark mode.
- **Backend**: Built with Node.js and Express. Handles API requests and orchestrates the AI agents.
- **Database**: PostgreSQL with the pgvector extension for high-performance vector similarity search.
- **AI Models**: Integrates with the Mistral API for generating embeddings and reasoning about travel plans.
