import { test, describe } from 'node:test';
import assert from 'node:assert';
import { repairJsonPayload } from '../src/sanitizers/jsonRepair.js';
import { BadRequestError } from '../src/utils/ApiError.js';

describe('JSON Repair Service Unit Tests', () => {
  test('should parse a perfectly valid JSON object', () => {
    const input = JSON.stringify({
      heading: 'Standard valid incident heading',
      summary: 'Standard valid incident summary',
      sources: []
    });
    const result = repairJsonPayload(input);
    assert.deepStrictEqual(result, {
      heading: 'Standard valid incident heading',
      summary: 'Standard valid incident summary',
      sources: []
    });
  });

  test('should remove markdown json syntax wrappers', () => {
    const input = `
\`\`\`json
{
  "heading": "Incident from markdown wrapper",
  "summary": "This summary was wrapped in markdown",
  "sources": []
}
\`\`\`
    `;
    const result = repairJsonPayload(input);
    assert.strictEqual(result.heading, 'Incident from markdown wrapper');
    assert.strictEqual(result.summary, 'This summary was wrapped in markdown');
  });

  test('should remove markdown wrappers without language tag', () => {
    const input = `
\`\`\`
{
  "heading": "Incident from raw block",
  "summary": "This summary was wrapped in plain markdown code block",
  "sources": []
}
\`\`\`
    `;
    const result = repairJsonPayload(input);
    assert.strictEqual(result.heading, 'Incident from raw block');
  });

  test('should normalize invalid enum representation in raw string', () => {
    const input = `
    {
      "heading": "Prometheus metric spike detected",
      "summary": "The CPU usage of checkout-service has exceeded 90% threshold.",
      "sources": [
        {
          "name": "<SourceTypeEnum.PROMETHEUS: \\"PROMETHEUS\\">",
          "description": "CPU utilization metric alarm"
        }
      ]
    }
    `;
    const result = repairJsonPayload(input);
    assert.strictEqual(result.sources[0].name, 'PROMETHEUS');
  });

  test('should normalize invalid enum representation with single or no quotes', () => {
    const input = `
    {
      "heading": "Kibana log error pattern detected",
      "summary": "Connection failure to DB",
      "sources": [
        {
          "name": "<SourceTypeEnum.KIBANA: 'KIBANA'>"
        },
        {
          "name": "<SourceTypeEnum.GITHUB: GITHUB>"
        }
      ]
    }
    `;
    const result = repairJsonPayload(input);
    assert.strictEqual(result.sources[0].name, 'KIBANA');
    assert.strictEqual(result.sources[1].name, 'GITHUB');
  });

  test('should repair unescaped quotes inside string fields', () => {
    const input = `
    {
      "heading": "Checkout Service 500 Errors",
      "summary": "A spike in 500 errors was observed.",
      "sources": [
        {
          "name": "PROMETHEUS",
          "description": "Prometheus alert details",
          "data": {
            "query": "http_requests_total{job="checkout-service", code=~"5.."}"
          }
        }
      ]
    }
    `;
    const result = repairJsonPayload(input);
    assert.strictEqual(
      result.sources[0].data.query,
      'http_requests_total{job="checkout-service", code=~"5.."}'
    );
  });

  test('should convert null source arrays to []', () => {
    const input = `
    {
      "heading": "No source array incident report",
      "summary": "Incident details without any associated sources",
      "sources": null
    }
    `;
    const result = repairJsonPayload(input);
    assert.deepStrictEqual(result.sources, []);
  });

  test('should recursively convert undefined values to null', () => {
    // Standard JSON doesn't support undefined, but JS objects passed to it might.
    // Also, verify that undefined properties in objects are handled properly.
    const inputObj = {
      heading: 'Checking undefined values',
      summary: 'Summary details',
      sources: undefined,
      nested: {
        someVal: undefined,
        otherVal: '  Needs Trimming  '
      }
    };
    const result = repairJsonPayload(inputObj);
    assert.deepStrictEqual(result.sources, []); // converted to null then to []
    assert.strictEqual(result.nested.someVal, null);
    assert.strictEqual(result.nested.otherVal, 'Needs Trimming');
  });

  test('should throw BadRequestError on invalid JSON payloads', () => {
    const input = 'This is clearly not JSON at all and cannot be repaired.';
    assert.throws(() => {
      repairJsonPayload(input);
    }, BadRequestError);
  });
});
