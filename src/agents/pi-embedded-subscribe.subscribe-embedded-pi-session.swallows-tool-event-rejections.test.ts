import { describe, expect, it, vi } from "vitest";
import { subscribeEmbeddedPiSession } from "./pi-embedded-subscribe.js";

type StubSession = {
  subscribe: (fn: (evt: unknown) => void) => () => void;
};

type SessionEventHandler = (evt: unknown) => void;

describe("subscribeEmbeddedPiSession", () => {
  it("swallows onAgentEvent rejections for tool update/result events", async () => {
    let handler: SessionEventHandler | undefined;
    const session: StubSession = {
      subscribe: (fn) => {
        handler = fn;
        return () => {};
      },
    };

    const onAgentEvent = vi.fn().mockRejectedValue(new Error("boom"));

    subscribeEmbeddedPiSession({
      session: session as unknown as Parameters<typeof subscribeEmbeddedPiSession>[0]["session"],
      runId: "run",
      onAgentEvent,
    });

    expect(() => {
      handler?.({
        type: "tool_execution_update",
        toolName: "bash",
        toolCallId: "tool-1",
        partialResult: "ok",
      });
      handler?.({
        type: "tool_execution_end",
        toolName: "bash",
        toolCallId: "tool-1",
        isError: false,
        result: "ok",
      });
    }).not.toThrow();

    // Allow async rejection handling to settle.
    await Promise.resolve();

    expect(onAgentEvent).toHaveBeenCalledTimes(2);
  });
});
