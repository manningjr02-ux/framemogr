import OpenAI from "openai";
import { env } from "@/lib/env";

let _openai: OpenAI | null = null;
function getOpenai(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return _openai;
}

/** Lazy: created on first use so build can complete without env vars. */
export const openai = new Proxy({} as OpenAI, {
  get(_, prop) {
    return (getOpenai() as unknown as Record<string, unknown>)[prop as string];
  },
});
