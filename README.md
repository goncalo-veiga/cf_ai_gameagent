# 🤖 Chat GameAgent

![npm i agents command](./npm-agents-banner.svg)

<a href="https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/agents-starter"><img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare"/></a>

Built from a starter template for building AI-powered chat agents using Cloudflare's Agent platform, powered by [`agents`](https://www.npmjs.com/package/agents). This project provides an interactive chat with the ability to give information about video games.

## Base Features

- 💬 Interactive chat interface with AI
- 🛠️ Built-in tool system with human-in-the-loop confirmation
- 📅 Advanced task scheduling (one-time, delayed, and recurring via cron)
- 🌓 Dark/Light theme support
- ⚡️ Real-time streaming responses
- 🔄 State management and chat history
- 🎨 Modern, responsive UI

## GameAgent Features

- Provides the genres of a given video game
- Give a summary of the game
- Tells you who are the developers

## Prerequisites

- Gemini or OpenAI API key
- Cloudflare account (only for deployment)

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Set up your environment:

Create a `.dev.vars` file:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_googleai_api_key
```

or

```env
OPENAI_API_KEY=your_openai_api_key
```

3. Run locally:

```bash
npm start
```

4. Deploy:

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
