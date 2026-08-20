import { z } from "zod";
import { isYoutubeUrl, VIDEO_CATEGORIES } from "@/lib/videos";

export const createVideoSchema = z.object({
  title: z.string().trim().min(1, "Enter a title").max(200),
  url: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .refine(isYoutubeUrl, "Enter a valid YouTube link (youtube.com or youtu.be)"),
  category: z.enum(VIDEO_CATEGORIES),
});
