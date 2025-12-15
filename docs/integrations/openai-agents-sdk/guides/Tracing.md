# Tracing

The Agents SDK includes built-in tracing, collecting a comprehensive record of events during an agent run: LLM generations, tool calls, handoffs, guardrails, and even custom events that occur. Using the Traces dashboard, you can debug, visualize, and monitor your workflows during development and in production.

> **Note**
>
> Tracing is enabled by default. There are two ways to disable tracing:
>
> - You can globally disable tracing by setting the env var `OPENAI_AGENTS_DISABLE_TRACING=1`
> - You can disable tracing for a single run by setting `RunConfig.tracingDisabled` to `true`
>
> For organizations operating under a Zero Data Retention (ZDR) policy using OpenAI’s APIs, tracing is unavailable.

## Export loop lifecycle

In most environments traces will automatically be exported on a regular interval. In the browser or in Cloudflare Workers, this functionality is disabled by default. Traces will still get exported if too many are queued up but they are not exported on a regular interval. Instead you should use `getGlobalTraceProvider().forceFlush()` to manually export the traces as part of your code’s lifecycle.

For example, in a Cloudflare Worker, you should wrap your code into a `try/catch/finally` block and use force flush with `waitUntil` to ensure that traces are exported before the worker exits.

```javascript
import { getGlobalTraceProvider } from '@openai/agents';

export default {
  async fetch(request, env, ctx): Promise<Response> {
    try {
      // your agent code here
      return new Response(`success`);
    } catch (error) {
      console.error(error);
      return new Response(String(error), { status: 500 });
    } finally {
      // make sure to flush any remaining traces before exiting
      ctx.waitUntil(getGlobalTraceProvider().forceFlush());
    }
  },
};
```

## Traces and spans

Traces represent a single end-to-end operation of a “workflow”. They’re composed of Spans. Traces have the following properties:

-   **`workflow_name`**: This is the logical workflow or app. For example “Code generation” or “Customer service”.
-   **`trace_id`**: A unique ID for the trace. Automatically generated if you don’t pass one. Must have the format `trace_<32_alphanumeric>`.
-   **`group_id`**: Optional group ID, to link multiple traces from the same conversation. For example, you might use a chat thread ID.
-   **`disabled`**: If `True`, the trace will not be recorded.
-   **`metadata`**: Optional metadata for the trace.

Spans represent operations that have a start and end time. Spans have:

-   **`started_at`** and **`ended_at`** timestamps.
-   **`trace_id`**, to represent the trace they belong to
-   **`parent_id`**, which points to the parent Span of this Span (if any)
-   **`span_data`**, which is information about the Span. For example, `AgentSpanData` contains information about the Agent, `GenerationSpanData` contains information about the LLM generation, etc.

## Default tracing

By default, the SDK traces the following:

-   The entire `run()` or `Runner.run()` is wrapped in a `Trace`.
-   Each time an agent runs, it is wrapped in `AgentSpan`
-   LLM generations are wrapped in `GenerationSpan`
-   Function tool calls are each wrapped in `FunctionSpan`
-   Guardrails are wrapped in `GuardrailSpan`
-   Handoffs are wrapped in `HandoffSpan`

By default, the trace is named “Agent workflow”. You can set this name if you use `withTrace`, or you can can configure the name and other properties with the `RunConfig.workflowName`.

In addition, you can set up custom trace processors to push traces to other destinations (as a replacement, or secondary destination).

## Voice agent tracing

If you are using `RealtimeAgent` and `RealtimeSession` with the default OpenAI Realtime API, tracing will automatically happen on the Realtime API side unless you disable it on the `RealtimeSession` using `tracingDisabled: true` or using the `OPENAI_AGENTS_DISABLE_TRACING` environment variable.

Check out the Voice agents guide for more details.

## Higher level traces

Sometimes, you might want multiple calls to `run()` to be part of a single trace. You can do this by wrapping the entire code in a `withTrace()`.

```javascript
import { Agent, run, withTrace } from '@openai/agents';

const agent = new Agent({
  name: 'Joke generator',
  instructions: 'Tell funny jokes.',
});

await withTrace('Joke workflow', async () => {
  const result = await run(agent, 'Tell me a joke');
  const secondResult = await run(
    agent,
    `Rate this joke: ${result.finalOutput}`,
  );
  console.log(`Joke: ${result.finalOutput}`);
  console.log(`Rating: ${secondResult.finalOutput}`);
});
```

Because the two calls to `run` are wrapped in a `withTrace()`, the individual runs will be part of the overall trace rather than creating two traces.

## Creating traces

You can use the `withTrace()` function to create a trace. Alternatively, you can use `getGlobalTraceProvider().createTrace()` to create a new trace manually and pass it into `withTrace()`.

The current trace is tracked via a Node.js `AsyncLocalStorage` or the respective environment polyfills. This means that it works with concurrency automatically.

## Creating spans

You can use the various `create*Span()` (e.g. `createGenerationSpan()`, `createFunctionSpan()`, etc.) methods to create a span. In general, you don’t need to manually create spans. A `createCustomSpan()` function is available for tracking custom span information.

Spans are automatically part of the current trace, and are nested under the nearest current span, which is tracked via a Node.js `AsyncLocalStorage` or the respective environment polyfills.

## Sensitive data

Certain spans may capture potentially sensitive data.

The `createGenerationSpan()` stores the inputs/outputs of the LLM generation, and `createFunctionSpan()` stores the inputs/outputs of function calls. These may contain sensitive data, so you can disable capturing that data via `RunConfig.traceIncludeSensitiveData`.

## Custom tracing processors

The high level architecture for tracing is:

1.  At initialization, we create a global `TraceProvider`, which is responsible for creating traces and can be accessed through `getGlobalTraceProvider()`.
2.  We configure the `TraceProvider` with a `BatchTraceProcessor` that sends traces/spans in batches to a `OpenAITracingExporter`, which exports the spans and traces to the OpenAI backend in batches.

To customize this default setup, to send traces to alternative or additional backends or modifying exporter behavior, you have two options:

-   `addTraceProcessor()` lets you add an additional trace processor that will receive traces and spans as they are ready. This lets you do your own processing in addition to sending traces to OpenAI’s backend.
-   `setTraceProcessors()` lets you replace the default processors with your own trace processors. This means traces will not be sent to the OpenAI backend unless you include a `TracingProcessor` that does so.

### External tracing processors list

-   AgentOps
-   Keywords AI

---

Edit page

Previous: Model Context Protocol (MCP)

Next: Configuring the SDK