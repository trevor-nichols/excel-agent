# Human in the loop

This guide demonstrates how to use the built-in human-in-the-loop support in the SDK to pause and resume agent runs based on human intervention.

The primary use case for this right now is asking for approval for sensitive tool executions.

## Approval requests

You can define a tool that requires approval by setting the `needsApproval` option to `true` or to an async function that returns a boolean.

### Tool approval definition

```javascript
import { tool } from '@openai/agents';
import z from 'zod';

const sensitiveTool = tool({
  name: 'cancelOrder',
  description: 'Cancel order',
  parameters: z.object({
    orderId: z.number(),
  }),
  // always requires approval
  needsApproval: true,
  execute: async ({ orderId }, args) => {
    // prepare order return
  },
});

const sendEmail = tool({
  name: 'sendEmail',
  description: 'Send an email',
  parameters: z.object({
    to: z.string(),
    subject: z.string(),
    body: z.string(),
  }),
  needsApproval: async (_context, { subject }) => {
    // check if the email is spam
    return subject.includes('spam');
  },
  execute: async ({ to, subject, body }, args) => {
    // send email
  },
});
```

## Flow

1.  If the agent decides to call a tool (or many) it will check if this tool needs approval by evaluating `needsApproval`.
2.  If the approval is required, the agent will check if approval is already granted or rejected.
3.  If approval has not been granted or rejected, the tool will return a static message to the agent that the tool call cannot be executed.
4.  If approval / rejection is missing it will trigger a tool approval request.
5.  The agent will gather all tool approval requests and interrupt the execution.
6.  If there are any interruptions, the result will contain an `interruptions` array describing pending steps. A `ToolApprovalItem` with `type: "tool_approval_item"` appears when a tool call requires confirmation.
7.  You can call `result.state.approve(interruption)` or `result.state.reject(interruption)` to approve or reject the tool call.
8.  After handling all interruptions, you can resume execution by passing the `result.state` back into `runner.run(agent, state)` where `agent` is the original agent that triggered the overall run.
9.  The flow starts again from step 1.

## Example

Below is a more complete example of a human-in-the-loop flow that prompts for approval in the terminal and temporarily stores the state in a file.

### Human in the loop

```javascript
import { z } from 'zod';
import readline from 'node:readline/promises';
import fs from 'node:fs/promises';
import { Agent, run, tool, RunState, RunResult } from '@openai/agents';

const getWeatherTool = tool({
  name: 'get_weather',
  description: 'Get the weather for a given city',
  parameters: z.object({
    location: z.string(),
  }),
  needsApproval: async (_context, { location }) => {
    // forces approval to look up the weather in San Francisco
    return location === 'San Francisco';
  },
  execute: async ({ location }) => {
    return `The weather in ${location} is sunny`;
  },
});

const dataAgentTwo = new Agent({
  name: 'Data agent',
  instructions: 'You are a data agent',
  handoffDescription: 'You know everything about the weather',
  tools: [getWeatherTool],
});

const agent = new Agent({
  name: 'Basic test agent',
  instructions: 'You are a basic agent',
  handoffs: [dataAgentTwo],
});

async function confirm(question: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await rl.question(`${question} (y/n): `);
  const normalizedAnswer = answer.toLowerCase();
  rl.close();
  return normalizedAnswer === 'y' || normalizedAnswer === 'yes';
}

async function main() {
  let result: RunResult<unknown, Agent<unknown, any>> = await run(
    agent,
    'What is the weather in Oakland and San Francisco?',
  );
  let hasInterruptions = result.interruptions?.length > 0;
  while (hasInterruptions) {
    // storing
    await fs.writeFile(
      'result.json',
      JSON.stringify(result.state, null, 2),
      'utf-8',
    );

    // from here on you could run things on a different thread/process

    // reading later on
    const storedState = await fs.readFile('result.json', 'utf-8');
    const state = await RunState.fromString(agent, storedState);

    for (const interruption of result.interruptions) {
      const confirmed = await confirm(
        `Agent ${interruption.agent.name} would like to use the tool ${interruption.name} with "${interruption.arguments}". Do you approve?`,
      );

      if (confirmed) {
        state.approve(interruption);
      } else {
        state.reject(interruption);
      }
    }

    // resume execution of the current state
    result = await run(agent, state);
    hasInterruptions = result.interruptions?.length > 0;
  }

  console.log(result.finalOutput);
}

main().catch((error) => {
  console.dir(error, { depth: null });
});
```

See the full example script for a working end-to-end version.

## Dealing with longer approval times

The human-in-the-loop flow is designed to be interruptible for longer periods of time without keeping your server running. If you need to shut down the request and continue later on you can serialize the state and resume later.

You can serialize the state using `JSON.stringify(result.state)` and resume later on by passing the serialized state into `RunState.fromString(agent, serializedState)` where `agent` is the instance of the agent that triggered the overall run.

That way you can store your serialized state in a database, or along with your request.

## Versioning pending tasks

> **Note**
>
> This primarily applies if you are trying to store your serialized state for a longer time while doing changes to your agents.

If your approval requests take a longer time and you intend to version your agent definitions in a meaningful way or bump your Agents SDK version, we currently recommend for you to implement your own branching logic by installing two versions of the Agents SDK in parallel using package aliases.

In practice this means assigning your own code a version number and storing it along with the serialized state and guiding the deserialization to the correct version of your code.

---

[Edit page](https://www.example.com/edit)

**Previous**  
[Streaming](https://www.example.com/streaming)

**Next**  
[Model Context Protocol (MCP)](https://www.example.com/mcp)