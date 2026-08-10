const { normalizeSeverity } = require('./context');

function mergeAssignments(current, next) {
  const merged = { ...current };

  for (const [column, value] of Object.entries(next || {})) {
    if (Object.prototype.hasOwnProperty.call(merged, column) && merged[column] !== value) {
      return {
        ok: false,
        conflict: {
          column,
          previous: merged[column],
          incoming: value
        }
      };
    }
    merged[column] = value;
  }

  return {
    ok: true,
    merged
  };
}

function runBlocks(rowData, blocks, context, options = {}) {
  const failFastOnCritical = options.failFastOnCritical !== false;
  let assignments = {};
  let halted = false;

  blocks.forEach((block, index) => {
    if (halted) return;

    const blockName = block.name || `block_${index + 1}`;
    context.addTrace('block_started', { block: blockName, order: index + 1 });

    let result;
    try {
      result = block.execute(rowData, context);
    } catch (err) {
      context.addError('BLOCK_EXECUTION_EXCEPTION', err.message, {
        block: blockName,
        severity: 'critical'
      });
      context.addTrace('block_failed_exception', { block: blockName });
      halted = failFastOnCritical;
      return;
    }

    const status = String(result?.status || 'ok').toLowerCase();

    const diagnostics = Array.isArray(result?.diagnostics) ? result.diagnostics : [];
    diagnostics.forEach((d, diagIndex) => {
      const sev = normalizeSeverity(d.severity || (status === 'error' ? 'critical' : 'warning'));
      const code = d.code || `DIAG_${diagIndex + 1}`;
      const message = d.message || 'Diagnostic event';

      if (sev === 'warning') {
        context.addWarning(code, message, { block: blockName });
      } else {
        context.addError(code, message, { block: blockName, severity: sev });
      }
    });

    if (status === 'warning' && diagnostics.length === 0) {
      context.addWarning('BLOCK_WARNING', 'Block reported warning status', { block: blockName });
    }

    if (status === 'error' && diagnostics.length === 0) {
      context.addError('BLOCK_ERROR', 'Block reported error status', {
        block: blockName,
        severity: 'critical'
      });
    }

    const mergedResult = mergeAssignments(assignments, result?.assignments || {});
    if (!mergedResult.ok) {
      context.addError('ASSIGNMENT_CONFLICT', 'Two blocks produced conflicting values for the same column', {
        block: blockName,
        severity: 'critical',
        conflict: mergedResult.conflict
      });
      context.addTrace('block_failed_conflict', { block: blockName });
      halted = failFastOnCritical;
      return;
    }

    assignments = mergedResult.merged;
    context.addTrace('block_completed', {
      block: blockName,
      status
    });

    if (status === 'error') {
      const hasCritical = diagnostics.some((d) => normalizeSeverity(d.severity) === 'critical');
      if (hasCritical || failFastOnCritical) {
        halted = true;
      }
    }
  });

  return {
    assignments,
    halted
  };
}

module.exports = {
  runBlocks
};
