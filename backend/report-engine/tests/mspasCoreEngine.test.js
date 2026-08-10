const test = require('node:test');
const assert = require('node:assert/strict');

const { core, pipeline } = require('../mspas');

function idiomaBlock() {
  return {
    name: 'idioma_predominante',
    execute(rowData) {
      const result = pipeline.mapIdiomaPredominanteToExcel(rowData);
      if (result.status === 'fallback_unknown') {
        return {
          status: 'warning',
          assignments: result.assignments,
          diagnostics: [
            {
              severity: 'warning',
              code: 'UNKNOWN_IDIOMA_FALLBACK',
              message: 'Idioma desconocido mapeado a codigo fallback 26'
            }
          ]
        };
      }

      return {
        status: 'ok',
        assignments: result.assignments,
        diagnostics: []
      };
    }
  };
}

test('core engine executes one block and returns one-hot assignments', () => {
  const engine = new core.MSPASCoreEngine();

  const result = engine.runRow(
    { idioma_predominante: 'Kaqchikel' },
    { blocks: [idiomaBlock()], runId: 't1' }
  );

  assert.equal(result.status, 'completed');
  assert.equal(result.errors.length, 0);
  assert.equal(result.assignments.Z, 1);
  assert.equal(result.assignments.Q, '');
});

test('core engine reports warning when fallback is used', () => {
  const engine = new core.MSPASCoreEngine();

  const result = engine.runRow(
    { idioma_predominante: 'Aleman' },
    { blocks: [idiomaBlock()], runId: 't2' }
  );

  assert.equal(result.status, 'completed_with_warnings');
  assert.equal(result.warnings.length, 1);
  assert.equal(result.assignments.AP, 1);
});

test('core engine detects conflicting assignments as critical', () => {
  const engine = new core.MSPASCoreEngine({ failFastOnCritical: true });

  const result = engine.runRow(
    { idioma_predominante: 'Achi' },
    {
      runId: 't3',
      blocks: [
        {
          name: 'block_a',
          execute() {
            return { status: 'ok', assignments: { Q: 1 }, diagnostics: [] };
          }
        },
        {
          name: 'block_b',
          execute() {
            return { status: 'ok', assignments: { Q: '' }, diagnostics: [] };
          }
        }
      ]
    }
  );

  assert.equal(result.status, 'failed');
  assert.equal(result.halted, true);
  assert.equal(result.errors.some((e) => e.code === 'ASSIGNMENT_CONFLICT'), true);
});

test('runEngine processes multiple rows and aggregates diagnostics', () => {
  const engine = new core.MSPASCoreEngine();

  const run = engine.runEngine(
    [
      { idioma_predominante: 'Achi' },
      { idioma_predominante: 'Aleman' }
    ],
    {
      runId: 'batch-1',
      blocks: [idiomaBlock()]
    }
  );

  assert.equal(run.rowResults.length, 2);
  assert.equal(run.status, 'completed_with_warnings');
  assert.equal(run.warnings.length, 1);
  assert.equal(run.errors.length, 0);
});
