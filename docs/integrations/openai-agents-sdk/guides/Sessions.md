# Sessions

Sessions give the Agents SDK a persistent memory layer. Provide any object that implements the `Session` interface to `Runner.run`, and the SDK handles the rest. When a session is present, the runner automatically:

-   Fetches previously stored conversation items and prepends them to the next turn.
-   Persists new user input and assistant output after each run completes.
-   Keeps the session available for future turns, whether you call the runner with new user text or resume from an interrupted `RunState`.

This removes the need to manually call `toInputList()` or stitch history between turns. The TypeScript SDK ships with two implementations: `OpenAIConversationsSession` for the Conversations API and `MemorySession`, which is intended for local development. Because they share the `Session` interface, you can plug in your own storage backend. For inspiration beyond the Conversations API, explore the sample session backends under `examples/memory/` (Prisma, file-backed, and more).

> **Tip:** To run the `OpenAIConversationsSession` examples on this page, set the `OPENAI_API_KEY` environment variable (or provide an `apiKey` when constructing the session) so the SDK can call the Conversations API.

## Quick start

Use `OpenAIConversationsSession` to sync memory with the Conversations API, or swap in any other `Session` implementation.

### Use the Conversations API as session memory

```typescript
import { Agent, OpenAIConversationsSession, run } from '@openai/agents';

const agent = new Agent({
  name: 'TourGuide',
  instructions: 'Answer with compact travel facts.',
});

// Any object that implements the Session interface works here. This example uses
// the built-in OpenAIConversationsSession, but you can swap in a custom Session.
const session = new OpenAIConversationsSession();

const firstTurn = await run(agent, 'What city is the Golden Gate Bridge in?', {
  session,
});
console.log(firstTurn.finalOutput); // "San Francisco"

const secondTurn = await run(agent, 'What state is it in?', { session });
console.log(secondTurn.finalOutput); // "California"
```

Reusing the same session instance ensures the agent receives the full conversation history before every turn and automatically persists new items. Switching to a different `Session` implementation requires no other code changes.

## How the runner uses sessions

-   Before each run it retrieves the session history, merges it with the new turn’s input, and passes the combined list to your agent.
-   After a non-streaming run one call to `session.addItems()` persists both the original user input and the model outputs from the latest turn.
-   For streaming runs it writes the user input first and appends streamed outputs once the turn completes.
-   When resuming from `RunResult.state` (for approvals or other interruptions) keep passing the same session. The resumed turn is added to memory without re-preparing the input.

## Inspecting and editing history

Sessions expose simple CRUD helpers so you can build “undo”, “clear chat”, or audit features.

### Read and edit stored items

```typescript
import { OpenAIConversationsSession } from '@openai/agents';
import type { AgentInputItem } from '@openai/agents-core';

// Replace OpenAIConversationsSession with any other Session implementation that
// supports get/add/pop/clear if you store history elsewhere.
const session = new OpenAIConversationsSession({
  conversationId: 'conv_123', // Resume an existing conversation if you have one.
});

const history = await session.getItems();
console.log(`Loaded ${history.length} prior items.`);

const followUp: AgentInputItem[] = [
  {
    type: 'message',
    role: 'user',
    content: [{ type: 'input_text', text: 'Let’s continue later.' }],
  },
];
await session.addItems(followUp);

const undone = await session.popItem();

if (undone?.type === 'message') {
  console.log(undone.role); // "user"
}

await session.clearSession();
```

`session.getItems()` returns the stored `AgentInputItem[]`. Call `popItem()` to remove the last entry—useful for user corrections before you rerun the agent.

## Bring your own storage

Implement the `Session` interface to back memory with Redis, DynamoDB, SQLite, or another datastore. Only five asynchronous methods are required.

### Custom in-memory session implementation

```typescript
import { Agent, run } from '@openai/agents';
import { randomUUID } from '@openai/agents-core/_shims';
import { logger, Logger } from '@openai/agents-core/dist/logger';
import type { AgentInputItem, Session } from '@openai/agents-core';

/**
 * Minimal example of a Session implementation; swap this class for any storage-backed version.
 */
export class CustomMemorySession implements Session {
  private readonly sessionId: string;
  private readonly logger: Logger;

  private items: AgentInputItem[];

  constructor(
    options: {
      sessionId?: string;
      initialItems?: AgentInputItem[];
      logger?: Logger;
    } = {},
  ) {
    this.sessionId = options.sessionId ?? randomUUID();
    this.items = options.initialItems
      ? options.initialItems.map(cloneAgentItem)
      : [];
    this.logger = options.logger ?? logger;
  }

  async getSessionId(): Promise<string> {
    return this.sessionId;
  }

  async getItems(limit?: number): Promise<AgentInputItem[]> {
    if (limit === undefined) {
      const cloned = this.items.map(cloneAgentItem);
      this.logger.debug(
        `Getting items from memory session (${this.sessionId}): ${JSON.stringify(cloned)}`,
      );
      return cloned;
    }
    if (limit <= 0) {
      return [];
    }
    const start = Math.max(this.items.length - limit, 0);
    const items = this.items.slice(start).map(cloneAgentItem);
    this.logger.debug(
      `Getting items from memory session (${this.sessionId}): ${JSON.stringify(items)}`,
    );
    return items;
  }

  async addItems(items: AgentInputItem[]): Promise<void> {
    if (items.length === 0) {
      return;
    }
    const cloned = items.map(cloneAgentItem);
    this.logger.debug(
      `Adding items to memory session (${this.sessionId}): ${JSON.stringify(cloned)}`,
    );
    this.items = [...this.items, ...cloned];
  }

  async popItem(): Promise<AgentInputItem | undefined> {
    if (this.items.length === 0) {
      return undefined;
    }
    const item = this.items[this.items.length - 1];
    const cloned = cloneAgentItem(item);
    this.logger.debug(
      `Popping item from memory session (${this.sessionId}): ${JSON.stringify(cloned)}`,
    );
    this.items = this.items.slice(0, -1);
    return cloned;
  }

  async clearSession(): Promise<void> {
    this.logger.debug(`Clearing memory session (${this.sessionId})`);
    this.items = [];
  }
}

function cloneAgentItem<T extends AgentInputItem>(item: T): T {
  return structuredClone(item);
}

const agent = new Agent({
  name: 'MemoryDemo',
  instructions: 'Remember the running total.',
});

// Using the above custom memory session implementation here
const session = new CustomMemorySession({
  sessionId: 'session-123-4567',
});

const first = await run(agent, 'Add 3 to the total.', { session });
console.log(first.finalOutput);

const second = await run(agent, 'Add 4 more.', { session });
console.log(second.finalOutput);
```

Custom sessions let you enforce retention policies, add encryption, or attach metadata to each conversation turn before persisting it.

## Control how history and new items merge

When you pass an array of `AgentInputItems` as the run input, provide a `sessionInputCallback` to merge them with stored history deterministically. The runner loads the existing history, calls your callback before the model invocation, and hands the returned array to the model as the turn’s complete input. This hook is ideal for trimming old items, deduplicating tool results, or highlighting only the context you want the model to see.

### Truncate history with `sessionInputCallback`

```typescript
import { Agent, OpenAIConversationsSession, run } from '@openai/agents';
import type { AgentInputItem } from '@openai/agents-core';

const agent = new Agent({
  name: 'Planner',
  instructions: 'Track outstanding tasks before responding.',
});

// Any Session implementation can be passed here; customize storage as needed.
const session = new OpenAIConversationsSession();

const todoUpdate: AgentInputItem[] = [
  {
    type: 'message',
    role: 'user',
    content: [
      { type: 'input_text', text: 'Add booking a hotel to my todo list.' },
    ],
  },
];

await run(agent, todoUpdate, {
  session,
  // function that combines session history with new input items before the model call
  sessionInputCallback: (history, newItems) => {
    const recentHistory = history.slice(-8);
    return [...recentHistory, ...newItems];
  },
});
```

For string inputs the runner merges history automatically, so the callback is optional.

## Handling approvals and resumable runs

Human-in-the-loop flows often pause a run to wait for approval:

```typescript
const result = await runner.run(agent, 'Search the itinerary', {
  session,
  stream: true,
});

if (result.requiresApproval) {
  // ... collect user feedback, then resume the agent in a later turn
  const continuation = await runner.run(agent, result.state, { session });
  console.log(continuation.finalOutput);
}
```

When you resume from a previous `RunState`, the new turn is appended to the same memory record to preserve a single conversation history. Human-in-the-loop (HITL) flows stay fully compatible—approval checkpoints still round-trip through `RunState` while the session keeps the transcript complete.

---

[Edit page](https://www.example.com/edit)

**Previous**  
[Context management](https://www.example.com/context)

**Next**  
[Models](https://www.example.com/models)