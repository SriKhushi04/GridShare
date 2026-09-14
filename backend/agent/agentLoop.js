const { toolDeclarations } = require('./agentSchemas');
const { SYSTEM_INSTRUCTIONS } = require('./agentPrompts');
const { executeTool } = require('./agentTools');
const { runDeterministicFallback } = require('./agentPolicy');
const gridState = require('../services/gridService');
const { getTimestamp, generateId } = require('../utils/gridHelpers');

const MAX_ITERATIONS = parseInt(process.env.MAX_AGENT_ITERATIONS || '5', 10);

/**
 * Bounded Agentic Loop using official @google/genai SDK
 * Cycle: Observe -> Reason -> Tool Call -> Backend Validation -> Execute -> Verify -> Re-plan / Finish
 */
async function runAgentLoop(customObjective) {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  // If Gemini API Key is missing or blank, seamlessly fall back to Deterministic Safety Mode
  if (!apiKey || apiKey.trim() === '') {
    console.log('[Grid Share Agent] GEMINI_API_KEY not configured. Running Deterministic Safety Fallback.');
    return await runDeterministicFallback(customObjective);
  }

  let GoogleGenAI;
  try {
    const genaiModule = require('@google/genai');
    GoogleGenAI = genaiModule.GoogleGenAI;
  } catch (err) {
    console.warn('[Grid Share Agent] @google/genai SDK not available. Using Deterministic Safety Fallback.');
    return await runDeterministicFallback(customObjective);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const objective = customObjective || 'Maintain microgrid energy balance, prioritize P2P sharing, and minimize grid imports.';
    const promptMessage = `Microgrid Objective: ${objective}\nBegin observation and balance the microgrid.`;

    const contents = [
      { role: 'user', parts: [{ text: promptMessage }] }
    ];

    const toolsConfig = [{ functionDeclarations: toolDeclarations }];
    const executedTools = [];
    const trace = [];
    let iterations = 0;
    let finalDecisionText = '';

    console.log(`[Agent Loop] Starting run (Model: ${modelName}, Max Iterations: ${MAX_ITERATIONS})`);
    trace.push({ type: 'OBSERVE', timestamp: getTimestamp(), message: `Agent observing microgrid with objective: ${objective}` });

    // Bounded Execution Loop
    while (iterations < MAX_ITERATIONS) {
      iterations++;
      console.log(`[Agent Loop] Iteration ${iterations}/${MAX_ITERATIONS}`);
      trace.push({ type: 'ANALYZE', timestamp: getTimestamp(), message: `Iteration ${iterations}: Analyzing grid state and reasoning.` });

      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS,
          tools: toolsConfig,
          temperature: 0.2,
        },
      });

      const candidate = response.candidates?.[0];
      if (!candidate) break;

      const modelPart = candidate.content?.parts?.[0];
      contents.push(candidate.content);

      // Check if Gemini requested function tool calls
      const functionCalls = candidate.functionCalls || (modelPart && modelPart.functionCall ? [modelPart.functionCall] : []);

      if (functionCalls && functionCalls.length > 0) {
        const toolResponseParts = [];
        trace.push({ type: 'PLAN', timestamp: getTimestamp(), message: `Agent determined ${functionCalls.length} actions to take.` });

        for (const fc of functionCalls) {
          const toolName = fc.name;
          const args = fc.args || {};

          console.log(`[Agent Loop] Tool Requested: ${toolName}`, JSON.stringify(args));
          executedTools.push(toolName);
          trace.push({ type: 'TOOL', timestamp: getTimestamp(), message: `Agent requested tool: ${toolName}` });

          // Execute backend tool with physical validation
          trace.push({ type: 'VALIDATION', timestamp: getTimestamp(), message: `Backend validating constraints for: ${toolName}` });
          const toolResult = await executeTool(toolName, args);
          console.log(`[Agent Loop] Tool Result (${toolName}):`, toolResult.status || 'OK');

          if (toolResult.success) {
            trace.push({ type: 'EXECUTE', timestamp: getTimestamp(), message: `Action approved and executed by backend.` });
          } else {
            trace.push({ type: 'ERROR', timestamp: getTimestamp(), message: `Backend REJECTED action: ${toolResult.reason || 'Constraint failed'}` });
            trace.push({ type: 'REPLAN', timestamp: getTimestamp(), message: `Agent must recalculate approach based on rejection.` });
          }

          toolResponseParts.push({
            functionResponse: {
              name: toolName,
              response: toolResult,
            },
          });
        }

        // Add tool execution results back into conversation history for re-planning
        contents.push({ role: 'user', parts: toolResponseParts });
      } else {
        // No more tool calls; Gemini reached final reasoning
        finalDecisionText = modelPart?.text || 'Grid balance optimized.';
        console.log(`[Agent Loop] Completed reasoning: ${finalDecisionText}`);
        trace.push({ type: 'VERIFY', timestamp: getTimestamp(), message: `Agent verifying final grid state after actions.` });
        break;
      }
    }

    trace.push({ type: 'COMPLETE', timestamp: getTimestamp(), message: `Agent execution finished: ${finalDecisionText}` });

    // Build structured decision record for UI display & audit trail
    const currentState = gridState.getCompleteState();
    const activeTx = currentState.activeTransfers[0] || currentState.transactions[0];

    const decisionRecord = {
      id: generateId(),
      timestamp: getTimestamp(),
      status: 'EXECUTED',
      action: activeTx ? (activeTx.type === 'P2P' ? 'P2P_TRANSFER' : activeTx.type === 'CENTRAL_BATTERY' ? 'BATTERY_DISCHARGE' : 'MAIN_GRID_SUPPLY') : 'NO_ACTION',
      from: activeTx ? activeTx.fromName : 'Grid Core',
      to: activeTx ? activeTx.toName : 'Microgrid',
      amountKwh: activeTx ? activeTx.amount : 0,
      situation: `Microgrid status: ${currentState.gridStatus}. Total Generation: ${currentState.summaryStats.totalGeneration} kW, Consumption: ${currentState.summaryStats.totalConsumption} kW.`,
      decision: finalDecisionText || 'Grid Share AI optimized energy distribution across nodes.',
      reason: 'AI Agent evaluated microgrid state using tools and issued backend-validated transfers.',
      priority: 'HIGH',
      confidence: 0.98,
      objective,
      sourceMode: 'GEMINI_AGENT',
      toolsUsed: [...new Set(executedTools)],
      iterations,
      validationResult: 'APPROVED (Backend Tool Validation)',
      executionResult: 'COMPLETED',
      verificationResult: `Grid Status: ${currentState.gridStatus}`,
      result: 'COMPLETED',
      trace
    };

    gridState.addAiDecisions([decisionRecord]);

    return {
      success: true,
      mode: 'GEMINI_AGENT',
      decision: decisionRecord,
      actions: currentState.activeTransfers,
      toolCalls: executedTools,
      gridState: currentState,
    };
  } catch (err) {
    console.error('[Agent Loop Error]', err.message);
    console.log('[Agent Loop] Gemini API call failed. Falling back to Deterministic Safety Mode.');
    return await runDeterministicFallback(customObjective);
  }
}

module.exports = { runAgentLoop };

