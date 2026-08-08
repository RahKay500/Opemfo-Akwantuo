"use client";

import { useRef } from "react";
import ProgressBar from "./ProgressBar";
import { CheckCircleIcon, CloudUploadIcon, TrashIcon } from "./icons";

// Application Components → File upload, pulled from the Figma design
// system ("gfgfg" in the Figma MCP) — "_File upload base" dropzone (node
// 1175:100312, State=Default/Hover/Disabled) + "_File upload item base"
// progress rows (node 1175:100366, Type=Progress bar/Progress fill,
// State=In progress/Complete/Error). Only the "Progress bar" item style
// is implemented (reuses the app's own ProgressBar primitive); "Progress
// fill" is a filled-background alternate skin for the same data, skipped
// as redundant. Dropzone accepts click-to-browse via a hidden native
// `<input type="file">` and drag-and-drop; file list rendering (name,
// size, progress, complete/error state, remove) is left to the consumer
// via the `files` prop — this app has no file upload flow yet, so this
// is a new capability rather than a restyle of something existing.
export interface FileUploadFile {
  id: string;
  name: string;
  sizeLabel: string;
  progress: number;
  status: "uploading" | "complete" | "error";
}

export interface FileUploadProps {
  onFilesSelected: (files: FileList) => void;
  files?: FileUploadFile[];
  onRemove?: (id: string) => void;
  accept?: string;
  hint?: string;
  className?: string;
}

export default function FileUpload({
  onFilesSelected,
  files = [],
  onRemove,
  accept,
  hint = "SVG, PNG, JPG or GIF (max. 800x400px)",
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`flex flex-col gap-4 ${className ?? ""}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) onFilesSelected(e.dataTransfer.files);
        }}
        className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-4 hover:bg-gray-50"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
        />
        <span className="flex size-10 items-center justify-center rounded-md border border-gray-300 text-gray-600">
          <CloudUploadIcon className="size-5" />
        </span>
        <div className="flex flex-col items-center gap-1">
          <span className="font-body text-sm">
            <span className="font-semibold text-brand-700">Click to upload</span>{" "}
            <span className="text-gray-600">or drag and drop</span>
          </span>
          <p className="text-center font-body text-xs text-gray-600">{hint}</p>
        </div>
      </div>

      {files.map((file) => (
        <div key={file.id} className="relative flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="truncate font-body text-sm font-medium text-gray-700">{file.name}</p>
            <div className="flex items-center gap-2 font-body text-sm text-gray-600">
              <span>{file.sizeLabel}</span>
              <span className="h-3 w-px bg-gray-200" />
              {file.status === "complete" ? (
                <span className="flex items-center gap-1 text-success-600">
                  <CheckCircleIcon className="size-4" />
                  Complete
                </span>
              ) : file.status === "error" ? (
                <span className="text-error-600">Upload failed</span>
              ) : (
                <span className="flex items-center gap-1 text-gray-500">
                  <CloudUploadIcon className="size-4" />
                  Uploading...
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <ProgressBar value={file.progress} className="flex-1" />
              <span className="font-body text-sm font-medium text-gray-700">{file.progress}%</span>
            </div>
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(file.id)}
              aria-label="Remove file"
              className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-sm text-gray-500 hover:bg-gray-50"
            >
              <TrashIcon className="size-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
