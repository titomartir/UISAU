const DEFAULT_MODE = 'tolerant';

function normalizeSeverity(severity) {
  const value = String(severity || '').toLowerCase();
  if (value === 'critical' || value === 'warning' || value === 'recoverable') {
    return value;
  }
  return 'warning';
}

function createRunContext(options = {}) {
  const runId = options.runId || `run-${Date.now()}`;
  const mode = options.mode || DEFAULT_MODE;
  const now = options.now || (() => new Date().toISOString());

  const context = {
    runId,
    mode,
    startedAt: now(),
    finishedAt: null,
    trace: [],
    warnings: [],
    errors: [],
    rows: [],
    addTrace(event, details = {}) {
      context.trace.push({
        ts: now(),
        event,
        ...details
      });
    },
    addWarning(code, message, details = {}) {
      context.warnings.push({
        ts: now(),
        severity: 'warning',
        code,
        message,
        ...details
      });
    },
    addError(code, message, details = {}) {
      context.errors.push({
        ts: now(),
        severity: normalizeSeverity(details.severity || 'critical'),
        code,
        message,
        ...details
      });
    },
    finish() {
      context.finishedAt = now();
    }
  };

  context.addTrace('core_engine_initialized', {
    runId,
    mode
  });

  return context;
}

module.exports = {
  createRunContext,
  normalizeSeverity
};
