"use client";

import { Loader2 } from "lucide-react";

function basename(path: string): string {
  const segments = path.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? path;
}

function humanize(toolName: string): string {
  return toolName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getToolLabel(
  toolName: string,
  args: Record<string, unknown>
): string {
  const path = typeof args.path === "string" ? args.path : "";
  const filename = path ? basename(path) : "";

  if (toolName === "str_replace_editor") {
    const command = args.command;
    switch (command) {
      case "create":
        return filename ? `Creating ${filename}` : "Creating file";
      case "str_replace":
      case "insert":
        return filename ? `Editing ${filename}` : "Editing file";
      case "view":
        return filename ? `Reading ${filename}` : "Reading file";
      case "undo_edit":
        return filename ? `Undoing edit in ${filename}` : "Undoing edit";
      default:
        return humanize("str_replace_editor");
    }
  }

  if (toolName === "file_manager") {
    const command = args.command;
    switch (command) {
      case "rename": {
        const newPath = typeof args.new_path === "string" ? args.new_path : "";
        const newFilename = newPath ? basename(newPath) : "";
        if (filename && newFilename) {
          return `Renaming ${filename} to ${newFilename}`;
        }
        return filename ? `Renaming ${filename}` : "Renaming file";
      }
      case "delete":
        return filename ? `Deleting ${filename}` : "Deleting file";
      default:
        return "File Manager";
    }
  }

  return humanize(toolName);
}

interface ToolInvocationBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  state: string;
  result?: unknown;
}

export function ToolInvocationBadge({
  toolName,
  args,
  state,
  result,
}: ToolInvocationBadgeProps) {
  const isComplete = state === "result" && Boolean(result);
  const label = getToolLabel(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isComplete ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
