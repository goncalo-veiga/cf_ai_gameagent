/**
 * Tool definitions for the AI chat agent
 * Tools can either require human confirmation or execute automatically
 */
import { tool, type ToolSet } from "ai";
import { z } from "zod/v3";

import type { Chat } from "./server";
import { getCurrentAgent } from "agents";
import { scheduleSchema } from "agents/schedule";

const scheduleTask = tool({
  description: "A tool to schedule a task to be executed at a later time",
  inputSchema: scheduleSchema,
  execute: async ({ when, description }) => {
    // we can now read the agent context from the ALS store
    const { agent } = getCurrentAgent<Chat>();

    function throwError(msg: string): string {
      throw new Error(msg);
    }
    if (when.type === "no-schedule") {
      return "Not a valid schedule input";
    }
    const input =
      when.type === "scheduled"
        ? when.date // scheduled
        : when.type === "delayed"
          ? when.delayInSeconds // delayed
          : when.type === "cron"
            ? when.cron // cron
            : throwError("not a valid schedule input");
    try {
      agent!.schedule(input!, "executeTask", description);
    } catch (error) {
      console.error("error scheduling task", error);
      return `Error scheduling task: ${error}`;
    }
    return `Task scheduled for type "${when.type}" : ${input}`;
  }
});

/**
 * Tool to list all scheduled tasks
 * This executes automatically without requiring human confirmation
 */
const getScheduledTasks = tool({
  description: "List all tasks that have been scheduled",
  inputSchema: z.object({}),
  execute: async () => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      const tasks = agent!.getSchedules();
      if (!tasks || tasks.length === 0) {
        return "No scheduled tasks found.";
      }
      return tasks;
    } catch (error) {
      console.error("Error listing scheduled tasks", error);
      return `Error listing scheduled tasks: ${error}`;
    }
  }
});

/**
 * Tool to cancel a scheduled task by its ID
 * This executes automatically without requiring human confirmation
 */
const cancelScheduledTask = tool({
  description: "Cancel a scheduled task using its ID",
  inputSchema: z.object({
    taskId: z.string().describe("The ID of the task to cancel")
  }),
  execute: async ({ taskId }) => {
    const { agent } = getCurrentAgent<Chat>();
    try {
      await agent!.cancelSchedule(taskId);
      return `Task ${taskId} has been successfully canceled.`;
    } catch (error) {
      console.error("Error canceling scheduled task", error);
      return `Error canceling task ${taskId}: ${error}`;
    }
  }
});

/**
 * Tool to get the genres of a given video game using public data
 * This executes automatically (no confirmation required)
 */
const getGameGenres = tool({
  description: "Get the genres of a given video game using public Wikipedia data.",
  inputSchema: z.object({
    name: z.string().describe("The name of the video game to find genres for"),
  }),
  execute: async ({ name }) => {
    console.log(`Fetching genres for game: ${name}`);

    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        name
      )}&utf8=&format=json`;

      const searchRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
          name + " video game"
        )}&utf8=&format=json`,
        {
          headers: {
            "User-Agent": "CloudflareAgentDemo/1.0",
            Accept: "application/json",
          },
        }
      );

      const searchData = (await searchRes.json()) as {
        query?: {
          search?: { title: string }[];
        };
      };

      if (!searchData.query?.search?.length) {
        return `No Wikipedia page found for "${name}".`;
      }

      const pageTitle = searchData.query.search[0].title;

      // Summary of the most relevant page
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        pageTitle
      )}`;
      const summaryRes = await fetch(summaryUrl, {
        headers: {
          "User-Agent": "CloudflareAgentDemo/1.0 (https://developers.cloudflare.com/)",
          "Accept": "application/json",
        },
      });

      const summaryData = (await summaryRes.json()) as {
        extract?: string;
        title?: string;
      };

      const extract = summaryData.extract || "";
      const lower = extract.toLowerCase();

      // Detect common genre keywords in the summary text
      const genreKeywords = [
        "action",
        "adventure",
        "role-playing",
        "rpg",
        "shooter",
        "puzzle",
        "strategy",
        "simulation",
        "sports",
        "racing",
        "platform",
        "horror",
        "survival",
        "sandbox",
        "fighting",
        "stealth",
        "visual novel",
        "mmo",
        "fps",
        "tps",
        "metroidvania",
      ];

      const genres = genreKeywords.filter((g) => lower.includes(g));

      if (genres.length === 0) {
        return `Couldn't determine genres for "${pageTitle}". Summary: ${extract.substring(
          0,
          200
        )}...`;
      }

      return `${pageTitle} belongs to genres: ${genres.join(", ")}.`;
    } catch (error) {
      console.error("Error fetching game genres:", error);
      return `Error fetching game genres: ${error}`;
    }
  },
});

const summarizeGameStory = tool({
  description: "Summarize the story or plot of a video game using Wikipedia.",
  inputSchema: z.object({
    name: z.string().describe("The name of the video game"),
  }),
  execute: async ({ name }) => {
    try {
      console.log(`Fetching story summary for: ${name}`);

      // Step 1: Search Wikipedia
      const searchRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
          name + " video game"
        )}&utf8=&format=json`,
        {
          headers: {
            "User-Agent": "CloudflareAgentDemo/1.0",
            Accept: "application/json",
          },
        }
      );
      const searchData = (await searchRes.json()) as {
        query?: { search?: { title: string }[] };
      };

      if (!searchData.query?.search?.length) {
        return `No Wikipedia page found for "${name}".`;
      }

      const pageTitle = searchData.query.search[0].title;

      // Step 2: Get page summary
      const summaryRes = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          pageTitle
        )}`,
        {
          headers: {
            "User-Agent": "CloudflareAgentDemo/1.0",
            Accept: "application/json",
          },
        }
      );
      const summaryData = (await summaryRes.json()) as { extract?: string };

      const extract = summaryData.extract || "";
      if (!extract) {
        return `Could not find a story summary for "${pageTitle}".`;
      }

      // Step 3: Summarize (first 2 sentences)
      const sentences = extract.split(". ");
      const shortSummary = sentences.slice(0, 2).join(". ") + ".";
      return `Story summary of "${pageTitle}": ${shortSummary}`;
    } catch (error) {
      console.error("Error summarizing game story:", error);
      return `Error summarizing game story: ${error}`;
    }
  },
});

const getDeveloperInfo = tool({
  description: "Get information about the developer or studio of a video game using Wikipedia.",
  inputSchema: z.object({
    name: z.string().describe("The name of the video game"),
  }),
  execute: async ({ name }) => {
    try {
      console.log(`Fetching developer info for: ${name}`);

      // Step 1: Search Wikipedia
      const searchRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
          name + " video game"
        )}&utf8=&format=json`,
        {
          headers: {
            "User-Agent": "CloudflareAgentDemo/1.0",
            Accept: "application/json",
          },
        }
      );
      const searchData = (await searchRes.json()) as {
        query?: { search?: { title: string }[] };
      };

      if (!searchData.query?.search?.length) {
        return `No Wikipedia page found for "${name}".`;
      }

      const pageTitle = searchData.query.search[0].title;

      // Step 2: Get page summary
      const summaryRes = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          pageTitle
        )}`,
        {
          headers: {
            "User-Agent": "CloudflareAgentDemo/1.0",
            Accept: "application/json",
          },
        }
      );
      const summaryData = (await summaryRes.json()) as { extract?: string };

      const extract = summaryData.extract || "";
      if (!extract) {
        return `Could not find developer info for "${pageTitle}".`;
      }

      // Step 3: Try to extract developer info heuristically
      const developerMatches = extract.match(
        /developed (?:and published )?by ([^.,;]+)/i
      );
      const developer = developerMatches ? developerMatches[1] : "Unknown";

      return `Developer of "${pageTitle}": ${developer}. Summary: ${extract.substring(
        0,
        200
      )}...`;
    } catch (error) {
      console.error("Error fetching developer info:", error);
      return `Error fetching developer info: ${error}`;
    }
  },
});




/**
 * Export all available tools
 * These will be provided to the AI model to describe available capabilities
 */
export const tools = {
  getGameGenres,
  summarizeGameStory,
  getDeveloperInfo,
  scheduleTask,
  getScheduledTasks,
  cancelScheduledTask
} satisfies ToolSet;

/**
 * Implementation of confirmation-required tools
 * This object contains the actual logic for tools that need human approval
 * Each function here corresponds to a tool above that doesn't have an execute function
 */
export const executions = {
  getWeatherInformation: async ({ city }: { city: string }) => {
    console.log(`Getting weather information for ${city}`);
    return `The weather in ${city} is sunny`;
  }
};
