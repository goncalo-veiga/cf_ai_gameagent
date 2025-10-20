# 🎮 Chat GameAgent — AI-Powered Video Game Assistant

<a href="https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/agents-starter">
  <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare"/>
</a>

**Chat GameAgent** is an AI-powered chat application built with [Cloudflare’s Agent Platform](https://developers.cloudflare.com/agents/), designed to demonstrate how Large Language Models (LLMs), tools, and Cloudflare Workers can work together to create an intelligent, stateful web agent.  

This project extends the official [`agents-starter`](https://github.com/cloudflare/agents-starter) template, transforming it into an interactive assistant specialized in **video game information retrieval** — capable of identifying genres, summarizing stories, and finding developers of any video game.

---

## 🚀 Overview

GameAgent combines **Cloudflare Workers**, **AI models (Gemini by default)**, and **Cloudflare Agents** to power an interactive chat interface with persistent state, custom tools, and real-time responses.

---

## 🧩 Features

### 💬 Base Features (from Agents Starter)
- **Interactive Chat UI** – Real-time AI messaging with tool confirmations  
- **Human-in-the-loop Tools** – Tools that require user approval before execution  
- **Task Scheduling** – Schedule, list, and cancel tasks (delayed, one-time, or recurring)  
- **Persistent Memory** – Retains chat history and context  
- **Dynamic Theming** – Light/Dark mode  
- **Real-time Streaming** – Continuous text streaming for LLM responses  

### 🎮 GameAgent Custom Tools

#### 🧠 `getGameGenres`
> Returns the primary genres of a given video game.

- Uses **Wikipedia’s public API** to fetch the summary and automatically detects common game genres (e.g., "action", "RPG", "shooter", etc.).
- Example:  
  **User:** “What are the genres of *Hades*?”  
  **Agent:** “Hades belongs to the genres action, role-playing, and roguelike.”

#### 📖 `summarizeGameStory`
> Summarizes the story or plot of a given video game.

- Fetches the Wikipedia summary of a video game and returns a short synopsis of its plot or story.  
- Example:  
  **User:** “Summarize the story of *Super Mario Odyssey*.”  
  **Agent:** “Super Mario Odyssey is a platform game where Mario and his new ally Cappy journey across kingdoms to save Princess Peach from Bowser's forced marriage plans.”

#### 🏢 `getDeveloperInfo`
> Retrieves the developer or studio information for a video game.

- Finds the game’s Wikipedia page and extracts the developer name using a regex that looks for phrases like “developed by …”.
- Example:  
  **User:** “Who developed *Minecraft*?”  
  **Agent:** “Minecraft was developed by Mojang Studios.”

---

## 🧠 Architecture Components

| Component | Description | Cloudflare Integration |
|------------|-------------|------------------------|
| **LLM** | Large Language Model used to power chat and reasoning | Gemini 2.0 |
| **Workflow / Coordination** | Manages agent lifecycle, task scheduling, and workflow logic | Cloudflare **Workers** + **Agents runtime** |
| **User Input** | Real-time chat interface for conversation or commands | Built with **Cloudflare Pages** and Realtime API |
| **Memory / State** | Persistent conversation history and scheduled task storage | Backed by **Durable Objects** (via Agents framework) |

---

## ⚙️ Setup & Installation

### 1. Install dependencies:

```bash
npm install
```

### 2. Set up your environment:

Create a `.dev.vars` file:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_googleai_api_key
```

or

```env
OPENAI_API_KEY=your_openai_api_key
```

### 3. Run locally:

```bash
npm start
```

### 4. Deploy:

```bash
npm run deploy
```

## Project Structure

```
├── src/
│   ├── app.tsx        # Chat UI implementation
│   ├── server.ts      # Chat agent logic
│   ├── tools.ts       # Tool definitions
│   ├── utils.ts       # Helper functions
│   └── styles.css     # UI styling
```

### Use a different AI model provider

The starting [`server.ts`](https://github.com/cloudflare/agents-starter/blob/main/src/server.ts) implementation uses the [`ai-sdk`](https://sdk.vercel.ai/docs/introduction) and the [OpenAI provider](https://sdk.vercel.ai/providers/ai-sdk-providers/openai), but you can use any AI model provider by:

1. Installing an alternative AI provider for the `ai-sdk`, such as the [`workers-ai-provider`](https://sdk.vercel.ai/providers/community-providers/cloudflare-workers-ai) or [`anthropic`](https://sdk.vercel.ai/providers/ai-sdk-providers/anthropic) provider:
2. Replacing the AI SDK with the [OpenAI SDK](https://github.com/openai/openai-node)
3. Using the Cloudflare [Workers AI + AI Gateway](https://developers.cloudflare.com/ai-gateway/providers/workersai/#workers-binding) binding API directly

For example, to use the [`workers-ai-provider`](https://sdk.vercel.ai/providers/community-providers/cloudflare-workers-ai), install the package:

```sh
npm install workers-ai-provider
```

Replace the `@ai-sdk/openai` import and usage with the `workers-ai-provider`:

```diff
// server.ts
// Change the imports
- import { openai } from "@ai-sdk/openai";
+ import { createWorkersAI } from 'workers-ai-provider';

// Create a Workers AI instance
+ const workersai = createWorkersAI({ binding: env.AI });

// Use it when calling the streamText method (or other methods)
// from the ai-sdk
- const model = openai("gpt-4o-2024-11-20");
+ const model = workersai("@cf/deepseek-ai/deepseek-r1-distill-qwen-32b")
```

Commit your changes and then run the `agents-starter` as per the rest of this README.


## Learn More

- [`agents`](https://github.com/cloudflare/agents/blob/main/packages/agents/README.md)
- [Cloudflare Agents Documentation](https://developers.cloudflare.com/agents/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)

## License

MIT
