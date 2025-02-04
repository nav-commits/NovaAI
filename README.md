# NovaAI - AI-Powered Chatbot with Gemma 2 & Hugging Face API

NovaAI is an AI-powered chatbot application built using **Next.js**, **TypeScript**, and **Hugging Face's google/gemma-2-2b-it** model. The project integrates cutting-edge AI technology to provide real-time conversational capabilities with a modern, responsive frontend built using **Tailwind CSS** and **Radix UI**.

Chats are saved in a **Supabase** database, allowing for persistent chat history. The application includes API routes for posting, getting, and deleting chat messages, all available on **localhost:3000/api/chat**.

## Key Features:
- **Next.js & TypeScript**: A robust, type-safe application.
- **Radix UI**: Accessible and customizable UI components.
- **Tailwind CSS**: Mobile-first, responsive design.
- **AI Integration**: Utilizes **google/gemma-2-2b-it** from Hugging Face to power intelligent conversations.
- **Chat History**: Chats are saved in a **Supabase** database for persistence.
- **API Routes**: The application includes API routes for interacting with chat data:
  - **POST**: Add a new chat message.
  - **GET**: Retrieve chat history.
  - **DELETE**: Remove a chat message.

## Installation

To run the project locally:

1. Clone the repository:

   ```bash
   git clone https://github.com/nav-commits/NovaAI.git
   cd NovaAI
