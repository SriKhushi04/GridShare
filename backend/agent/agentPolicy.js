const gridState = require('../services/gridService');
const { allocateEnergy } = require('../services/allocationService');
const { getTimestamp, generateId } = require('../utils/gridHelpers');

/**
 * Deterministic fallback service when Gemini API is unconfigured or unavailable.
 * Follows the exact same tool execution and decision recording interfaces.
 */
async function runDeterministicFallback(customObjective) {
  const timestamp = getTimestamp();
  const logs = [];

  logs.push('[DETERMINISTIC_FALLBACK] Executing rule-based energy allocation');

  const trace = [];
  trace.push({ type: 'OBSERVE', timestamp: getTimestamp(), message: 'Deterministic fallback activated.' });
  trace.push({ type: 'ANALYZE', timestamp: getTimestamp(), message: 'Evaluating grid status via deterministic allocation engine.' });

  // Trigger backend allocation engine
  const gridStateResult = allocateEnergy();
  const activeTx = gridStateResult.activeTransfers[0] || gridStateResult.transactions[0];

  trace.push({ type: 'TOOL', timestamp: getTimestamp(), message: 'Engine calculating baseline allocation.' });

  let actionType = 'NO_ACTION';
  let fromName = 'Grid Core';
  let toName = 'Microgrid';
  let amountKwh = 0;
  let situationText = 'Microgrid energy monitoring active.';
  let decisionText = 'System balanced. No immediate transfer required.';
  let reasonText = 'Baseline generation covers consumption or central battery reserves are stable.';

  if (activeTx) {
    actionType = activeTx.type === 'P2P' ? 'P2P_TRANSFER' : activeTx.type === 'CENTRAL_BATTERY' ? 'BATTERY_DISCHARGE' : 'MAIN_GRID_SUPPLY';
    fromName = activeTx.fromName;
    toName = activeTx.toName;
    amountKwh = activeTx.amount;
    situationText = `${toName} has an energy deficit.`;
    decisionText = `Transfer ${amountKwh} kWh from ${fromName} to ${toName}.`;
    reasonText = 'Deterministic Fallback: Peer surplus takes priority over central battery and main grid.';
    trace.push({ type: 'ACTION', timestamp: getTimestamp(), message: `Fallback engine resolving: ${decisionText}` });
  } else {
    trace.push({ type: 'ACTION', timestamp: getTimestamp(), message: 'No action needed.' });
  }

  trace.push({ type: 'EXECUTE', timestamp: getTimestamp(), message: 'Transfers applied by deterministic engine.' });
  trace.push({ type: 'COMPLETE', timestamp: getTimestamp(), message: 'Fallback allocation complete.' });

  const decisionRecord = {
    id: generateId(),
    timestamp,
    status: 'EXECUTED',
    action: actionType,
    from: fromName,
    to: toName,
    amountKwh,
    situation: situationText,
    decision: decisionText,
    reason: reasonText,
    priority: 'HIGH',
    confidence: null,
    objective: customObjective || 'Maintain microgrid energy balance while prioritizing local reserves',
    sourceMode: 'DETERMINISTIC_SAFETY_FALLBACK',
    toolsUsed: [],
    iterations: 1,
    validationResult: 'APPROVED (Deterministic Rule Engine)',
    executionResult: 'COMPLETED',
    verificationResult: `Grid Status: ${gridStateResult.gridStatus}`,
    result: 'COMPLETED',
    trace
  };

  gridState.addAiDecisions([decisionRecord]);

  return {
    success: true,
    mode: 'DETERMINISTIC_SAFETY_FALLBACK',
    decision: decisionRecord,
    actions: activeTx ? [activeTx] : [],
    toolCalls: ['calculate_energy_summary', 'allocate_energy'],
    gridState: gridStateResult,
  };
}

module.exports = { runDeterministicFallback };

