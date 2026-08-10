const { createRunContext } = require('./context');
const { runBlocks } = require('./orchestrator');

class MSPASCoreEngine {
  constructor(options = {}) {
    this.mode = options.mode || 'tolerant';
    this.failFastOnCritical = options.failFastOnCritical !== false;
  }

  runRow(rowData, options = {}) {
    const context = createRunContext({
      runId: options.runId,
      mode: this.mode
    });

    const blocks = Array.isArray(options.blocks) ? options.blocks : [];
    const blockResult = runBlocks(rowData, blocks, context, {
      failFastOnCritical: this.failFastOnCritical
    });

    const hasCritical = context.errors.some((e) => e.severity === 'critical');
    const status = hasCritical
      ? 'failed'
      : context.warnings.length > 0 || context.errors.length > 0
        ? 'completed_with_warnings'
        : 'completed';

    context.finish();

    return {
      status,
      halted: blockResult.halted,
      assignments: blockResult.assignments,
      trace: context.trace,
      warnings: context.warnings,
      errors: context.errors
    };
  }

  runEngine(inputRows, engineConfig = {}) {
    const rows = Array.isArray(inputRows) ? inputRows : [];
    const blocks = Array.isArray(engineConfig.blocks) ? engineConfig.blocks : [];
    const runId = engineConfig.runId;
    const rowResults = [];

    for (let index = 0; index < rows.length; index += 1) {
      const rowResult = this.runRow(rows[index], {
        blocks,
        runId: runId ? `${runId}:row:${index + 1}` : undefined
      });
      rowResults.push(rowResult);
    }

    const warnings = rowResults.flatMap((r) => r.warnings);
    const errors = rowResults.flatMap((r) => r.errors);
    const trace = rowResults.flatMap((r) => r.trace);
    const hasCritical = errors.some((e) => e.severity === 'critical');

    return {
      workbook: null,
      rowResults,
      trace,
      warnings,
      errors,
      status: hasCritical ? 'failed' : warnings.length > 0 || errors.length > 0 ? 'completed_with_warnings' : 'completed'
    };
  }
}

module.exports = {
  MSPASCoreEngine
};
