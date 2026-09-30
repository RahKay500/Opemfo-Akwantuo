import { z } from "zod";
import { isYoutubeUrl, VIDEO_CATEGORIES } from "@/lib/videos";

export const createVideoSchema = z
  .object({
    title: z.string().trim().min(1, "Enter a title").max(200),
    url: z.string().trim().url("Enter a valid URL"),
    category: z.enum(VIDEO_CATEGORIES),
    // Set only for an uploaded file ("video/mp4", "audio/mpeg", ...); absent
    // means url must be a YouTube link.
    mimeType: z.string().optional(),
  })
  .refine((data) => (data.mimeType ? /^(video|audio)\//.test(data.mimeType) : isYoutubeUrl(data.url)), {
    message: "Enter a valid YouTube link, or upload a video/audio file.",
    path: ["url"],
  });
