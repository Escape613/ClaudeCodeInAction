import { describe, test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { getToolLabel, ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

describe("getToolLabel", () => {
  describe("str_replace_editor", () => {
    test("create command returns Creating <filename>", () => {
      expect(
        getToolLabel("str_replace_editor", { command: "create", path: "/src/App.jsx" })
      ).toBe("Creating App.jsx");
    });

    test("str_replace command returns Editing <filename>", () => {
      expect(
        getToolLabel("str_replace_editor", { command: "str_replace", path: "/src/Button.tsx" })
      ).toBe("Editing Button.tsx");
    });

    test("insert command returns Editing <filename>", () => {
      expect(
        getToolLabel("str_replace_editor", { command: "insert", path: "/src/utils.ts" })
      ).toBe("Editing utils.ts");
    });

    test("view command returns Reading <filename>", () => {
      expect(
        getToolLabel("str_replace_editor", { command: "view", path: "/src/index.ts" })
      ).toBe("Reading index.ts");
    });

    test("undo_edit command returns Undoing edit in <filename>", () => {
      expect(
        getToolLabel("str_replace_editor", { command: "undo_edit", path: "/src/App.jsx" })
      ).toBe("Undoing edit in App.jsx");
    });

    test("deeply nested path returns only filename", () => {
      expect(
        getToolLabel("str_replace_editor", { command: "create", path: "/a/b/c/d/Component.tsx" })
      ).toBe("Creating Component.tsx");
    });

    test("unknown command falls back to humanized tool name", () => {
      expect(
        getToolLabel("str_replace_editor", { command: "unknown_cmd", path: "/src/App.jsx" })
      ).toBe("Str Replace Editor");
    });

    test("missing command falls back to humanized tool name", () => {
      expect(getToolLabel("str_replace_editor", {})).toBe("Str Replace Editor");
    });

    test("empty path returns graceful fallback", () => {
      expect(
        getToolLabel("str_replace_editor", { command: "create", path: "" })
      ).toBe("Creating file");
    });
  });

  describe("file_manager", () => {
    test("rename command returns Renaming <filename> to <new_filename>", () => {
      expect(
        getToolLabel("file_manager", {
          command: "rename",
          path: "/src/Old.tsx",
          new_path: "/src/New.tsx",
        })
      ).toBe("Renaming Old.tsx to New.tsx");
    });

    test("rename without new_path omits 'to X'", () => {
      expect(
        getToolLabel("file_manager", { command: "rename", path: "/src/Old.tsx" })
      ).toBe("Renaming Old.tsx");
    });

    test("delete command returns Deleting <filename>", () => {
      expect(
        getToolLabel("file_manager", { command: "delete", path: "/src/Unused.tsx" })
      ).toBe("Deleting Unused.tsx");
    });

    test("unknown command returns File Manager", () => {
      expect(
        getToolLabel("file_manager", { command: "copy", path: "/src/File.tsx" })
      ).toBe("File Manager");
    });

    test("missing command returns File Manager", () => {
      expect(getToolLabel("file_manager", {})).toBe("File Manager");
    });
  });

  describe("unknown tools", () => {
    test("snake_case tool name is humanized", () => {
      expect(getToolLabel("my_custom_tool", {})).toBe("My Custom Tool");
    });

    test("single word tool name is title-cased", () => {
      expect(getToolLabel("search", {})).toBe("Search");
    });
  });
});

describe("ToolInvocationBadge component", () => {
  test("state=result with truthy result shows green dot and label", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "create", path: "/src/App.jsx" }}
        state="result"
        result="Success"
      />
    );

    expect(screen.getByText("Creating App.jsx")).toBeDefined();
    const container = screen.getByText("Creating App.jsx").closest("div");
    const dot = container?.querySelector(".bg-emerald-500");
    expect(dot).toBeTruthy();
  });

  test("state=call shows spinner and label", () => {
    const { container } = render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "str_replace", path: "/src/Button.tsx" }}
        state="call"
      />
    );

    expect(screen.getByText("Editing Button.tsx")).toBeDefined();
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeTruthy();
  });

  test("state=result with falsy result shows spinner, not green dot", () => {
    const { container } = render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "create", path: "/src/App.jsx" }}
        state="result"
        result={undefined}
      />
    );

    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeTruthy();
    const dot = container.querySelector(".bg-emerald-500");
    expect(dot).toBeNull();
  });

  test("file_manager rename label renders correctly", () => {
    render(
      <ToolInvocationBadge
        toolName="file_manager"
        args={{ command: "rename", path: "/src/Old.tsx", new_path: "/src/New.tsx" }}
        state="result"
        result="done"
      />
    );

    expect(screen.getByText("Renaming Old.tsx to New.tsx")).toBeDefined();
  });

  test("file_manager delete label renders correctly", () => {
    render(
      <ToolInvocationBadge
        toolName="file_manager"
        args={{ command: "delete", path: "/src/Unused.tsx" }}
        state="result"
        result="done"
      />
    );

    expect(screen.getByText("Deleting Unused.tsx")).toBeDefined();
  });

  test("unknown tool renders humanized name", () => {
    render(
      <ToolInvocationBadge
        toolName="my_custom_tool"
        args={{}}
        state="call"
      />
    );

    expect(screen.getByText("My Custom Tool")).toBeDefined();
  });

  test("container has correct CSS classes", () => {
    const { container } = render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "create", path: "/src/App.jsx" }}
        state="call"
      />
    );

    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("inline-flex");
    expect(badge.className).toContain("items-center");
    expect(badge.className).toContain("bg-neutral-50");
    expect(badge.className).toContain("rounded-lg");
    expect(badge.className).toContain("border-neutral-200");
  });

  test("label span has correct CSS class", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "create", path: "/src/App.jsx" }}
        state="call"
      />
    );

    const label = screen.getByText("Creating App.jsx");
    expect(label.className).toContain("text-neutral-700");
  });
});
