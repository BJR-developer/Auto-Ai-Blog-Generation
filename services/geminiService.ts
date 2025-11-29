import { GoogleGenAI } from "@google/genai";
import { GeneratedContentResponse } from "../types";

// Initialize Gemini Client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }
  return new GoogleGenAI({ apiKey });
};

// System instruction to guide the blog generation
const SYSTEM_INSTRUCTION = `
You are a senior journalist and trend-watcher for "Look Trending", a fast-paced news blog.
Your job is to identify breaking news, viral topics, and emerging trends across Technology, Science, World News, and Internet Culture.
You must RESEARCH facts using Google Search before writing.
You must cite your sources at the end of the article.
Do not write about topics provided in the "Exclusion List".
Tone: Engaging, investigative, factual, yet accessible.
Format: Clean Markdown.
`;

export const generateBlogContent = async (existingTitles: string[] = []): Promise<GeneratedContentResponse> => {
  const ai = getClient();
  
  // Exclusion list to prevent duplicates
  const exclusionContext = existingTitles.length > 0 
    ? `Do NOT write about these topics as they are already covered: ${JSON.stringify(existingTitles.slice(0, 20))}.` 
    : "No exclusions.";

  // We use a delimiter-based format because JSON often breaks when the model generates 
  // complex markdown with quotes, and responseMimeType: 'application/json' is not reliably 
  // supported when using tools like googleSearch in all environments.
  const prompt = `
  1. Use Google Search to find a specific, currently trending news story or viral topic in the last 24-48 hours.
  2. ${exclusionContext}
  3. Research this topic thoroughly.
  4. Write a complete blog post about it.
  
  FORMATTING REQUIREMENTS:
  Do NOT return JSON. Use the exact delimiters below to separate sections.
  
  :::TITLE:::
  (Write a catchy, journalistic headline here)
  :::EXCERPT:::
  (Write a 2-sentence hook/summary here)
  :::AUTHOR:::
  (The name of the persona, e.g. 'Trend Scout')
  :::READ_TIME:::
  (e.g. '4 min read')
  :::TAGS:::
  (Tag1, Tag2, Tag3 - comma separated)
  :::IMAGE_PROMPT:::
  (A highly detailed description for an editorial cover image representing this news story)
  :::CONTENT:::
  (The full article in Markdown. Must include a '## References' section at the bottom with a bulleted list of the source URLs you found. Format these explicitly as markdown links: - [Source Title](URL))
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ googleSearch: {} }],
      // Higher temperature for more creative angle on news
      temperature: 0.7, 
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate text content");
  }

  const text = response.text;
  
  // Helper to extract content between delimiters
  const extract = (tag: string) => {
    // Matches content between :::TAG::: and the next ::: or end of string
    const regex = new RegExp(`:::${tag}:::([\\s\\S]*?)(?=:::|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  };

  const title = extract('TITLE');
  const excerpt = extract('EXCERPT');
  const author = extract('AUTHOR');
  const readTime = extract('READ_TIME');
  const tagsStr = extract('TAGS');
  const imagePrompt = extract('IMAGE_PROMPT');
  const content = extract('CONTENT');

  if (!title || !content) {
    console.error("Model output malformed:", text);
    throw new Error("Failed to parse generated content structure. See logs.");
  }

  return {
    title,
    excerpt: excerpt || "Read the latest update on this trending story.",
    content,
    author: author || "Trend Watcher",
    readTime: readTime || "3 min read",
    tags: tagsStr.split(',').map(t => t.trim()).filter(t => t.length > 0),
    imagePrompt: imagePrompt || `News editorial image about ${title}`
  };
};

export const generateBlogImage = async (prompt: string): Promise<string | undefined> => {
  const ai = getClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [
        {
            text: prompt + ". Editorial style, high quality news photography or sophisticated digital art, 4k resolution, cinematic lighting."
        }
      ],
      config: {
        // Nano banana models do not support responseMimeType or responseSchema
      }
    });

    // Extract image from parts
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return undefined;
  } catch (error) {
    console.error("Image generation failed:", error);
    // Return undefined to let the UI handle the missing image gracefully or let the caller decide
    return undefined; 
  }
};