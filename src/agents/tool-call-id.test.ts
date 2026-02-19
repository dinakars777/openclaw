import type { AgentMessage } from "@mariozechner/pi-agent-core";
import { describe, it, expect } from "vitest";
import { extractToolCallsFromAssistant } from "./tool-call-id.js";

describe("extractToolCallsFromAssistant", () => {
  it("extracts valid tool calls", () => {
    const msg: Extract<AgentMessage, { role: "assistant" }> = {
      role: "assistant",
      content: [
        {
          type: "toolCall",
          id: "call_123",
          name: "calculator",
        },
      ],
    };
    const result = extractToolCallsFromAssistant(msg);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ id: "call_123", name: "calculator" });
  });

  it("sanitizes tool names (trim + lowercase)", () => {
    const msg: Extract<AgentMessage, { role: "assistant" }> = {
      role: "assistant",
      content: [
        {
          type: "toolCall",
          id: "call_ABC",
          name: "  MyToolName  ",
        },
      ],
    };
    const result = extractToolCallsFromAssistant(msg);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ id: "call_ABC", name: "mytoolname" });
  });

  it("handles missing names gracefully", () => {
    const msg: Extract<AgentMessage, { role: "assistant" }> = {
      role: "assistant",
      content: [
        {
          type: "toolCall",
          id: "call_456",
        },
      ],
    };
    const result = extractToolCallsFromAssistant(msg);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ id: "call_456", name: undefined });
  });
});
