import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { payloadNormalizationMiddleware } from '../src/middleware/payloadNormalization.middleware.js';
import { BadRequestError } from '../src/utils/ApiError.js';

describe('Payload Normalization Middleware Unit Tests', () => {
  let logOutput = [];
  const originalLog = console.log;

  beforeEach(() => {
    logOutput = [];
    console.log = (msg) => {
      logOutput.push(msg);
    };
  });

  afterEach(() => {
    console.log = originalLog;
  });

  test('should do nothing if body is empty', () => {
    const req = { body: null };
    const res = {};
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    payloadNormalizationMiddleware(req, res, next);

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.body, null);
    assert.strictEqual(logOutput.length, 0);
  });

  test('should parse valid JSON without changes and not log', () => {
    const initialObj = {
      heading: 'Valid Incident Heading',
      summary: 'Valid incident summary description',
      sources: []
    };
    const req = { body: JSON.stringify(initialObj) };
    const res = {};
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    payloadNormalizationMiddleware(req, res, next);

    assert.strictEqual(nextCalled, true);
    assert.deepStrictEqual(req.body, initialObj);
    assert.strictEqual(logOutput.length, 0);
  });

  test('should log payload_repaired when invalid enum representation is corrected', () => {
    const rawString = `
    {
      "heading": "Incident about Prometheus spike",
      "summary": "This CPU threshold was breached on node1",
      "sources": [
        {
          "name": "<SourceTypeEnum.PROMETHEUS: \\"PROMETHEUS\\">",
          "description": "Metric description"
        }
      ]
    }
    `;
    const req = { body: rawString };
    const res = {};
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    payloadNormalizationMiddleware(req, res, next);

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.body.sources[0].name, 'PROMETHEUS');
    assert.strictEqual(logOutput.length, 1);

    const logEntry = JSON.parse(logOutput[0]);
    assert.strictEqual(logEntry.event, 'payload_repaired');
    assert.strictEqual(logEntry.changesDetected, true);
    assert.ok(logEntry.timestamp);
  });

  test('should log payload_repaired when unescaped quotes are repaired', () => {
    const rawString = `
    {
      "heading": "Unescaped quotes inside query string",
      "summary": "The application log analysis reports syntax error",
      "sources": [
        {
          "name": "PROMETHEUS",
          "description": "Nested quotes",
          "data": {
            "query": "up{job="checkout-service"}"
          }
        }
      ]
    }
    `;
    const req = { body: rawString };
    const res = {};
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    payloadNormalizationMiddleware(req, res, next);

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.body.sources[0].data.query, 'up{job="checkout-service"}');
    assert.strictEqual(logOutput.length, 1);

    const logEntry = JSON.parse(logOutput[0]);
    assert.strictEqual(logEntry.event, 'payload_repaired');
  });

  test('should propagate BadRequestError to next() if repair fails completely', () => {
    const rawString = 'This is complete gibberish and cannot be repaired into JSON';
    const req = { body: rawString };
    const res = {};
    let nextError = null;
    const next = (err) => {
      nextError = err;
    };

    payloadNormalizationMiddleware(req, res, next);

    assert.ok(nextError instanceof BadRequestError);
    assert.strictEqual(nextError.message, 'Invalid JSON payload');
    assert.strictEqual(logOutput.length, 0);
  });
});
