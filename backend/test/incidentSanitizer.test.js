import { test, describe } from 'node:test';
import assert from 'node:assert';
import { sanitizeIncidentPayload } from '../src/sanitizers/incidentSanitizer.js';

describe('Incident Sanitizer Unit Tests', () => {
  test('should normalize source names to uppercase', () => {
    const payload = {
      heading: 'Standard Incident Report',
      summary: 'Something went wrong on the production servers.',
      sources: [
        { name: 'prometheus', description: 'Prometheus metrics description' },
        { name: '  kibana  ', description: 'Kibana logs description' },
        { name: '<SourceTypeEnum.GITHUB: "GITHUB">', description: 'Github repo issues' },
        { name: 'argo', description: 'ArgoCD Sync status' }
      ]
    };

    const sanitized = sanitizeIncidentPayload(payload);
    assert.strictEqual(sanitized.sources[0].name, 'PROMETHEUS');
    assert.strictEqual(sanitized.sources[1].name, 'KIBANA');
    assert.strictEqual(sanitized.sources[2].name, 'GITHUB');
    assert.strictEqual(sanitized.sources[3].name, 'ARGO');
  });

  test('should recursively trim strings inside root fields and dynamic source.data', () => {
    const payload = {
      heading: '   Checkout Service 500 error spike   ',
      summary: '  The user checkout service is experiencing high failure rates.   ',
      sources: [
        {
          name: 'PROMETHEUS',
          description: '   CPU utilization metrics   ',
          data: {
            query: '   http_requests_total{job="checkout-service"}   ',
            nested: {
              alertName: '   HighCpuUsage   ',
              labels: ['  critical  ', '   frontend   '],
              threshold: 85 // non-string remains untouched
            }
          }
        }
      ]
    };

    const sanitized = sanitizeIncidentPayload(payload);
    assert.strictEqual(sanitized.heading, 'Checkout Service 500 error spike');
    assert.strictEqual(sanitized.summary, 'The user checkout service is experiencing high failure rates.');
    assert.strictEqual(sanitized.sources[0].description, 'CPU utilization metrics');
    assert.strictEqual(sanitized.sources[0].data.query, 'http_requests_total{job="checkout-service"}');
    assert.strictEqual(sanitized.sources[0].data.nested.alertName, 'HighCpuUsage');
    assert.deepStrictEqual(sanitized.sources[0].data.nested.labels, ['critical', 'frontend']);
    assert.strictEqual(sanitized.sources[0].data.nested.threshold, 85);
  });

  test('should default missing or null sources array to []', () => {
    const payload1 = {
      heading: 'Incident without sources property',
      summary: 'Some descriptive summary here'
    };
    const payload2 = {
      heading: 'Incident with null sources property',
      summary: 'Some descriptive summary here',
      sources: null
    };

    const sanitized1 = sanitizeIncidentPayload(payload1);
    const sanitized2 = sanitizeIncidentPayload(payload2);

    assert.deepStrictEqual(sanitized1.sources, []);
    assert.deepStrictEqual(sanitized2.sources, []);
  });

  test('should default missing descriptions in sources to empty string', () => {
    const payload = {
      heading: 'Incident with missing source descriptions',
      summary: 'Some descriptive summary here',
      sources: [
        { name: 'PROMETHEUS', data: {} },
        { name: 'KIBANA', description: null, data: {} },
        { name: 'GITHUB', description: '  Valid description  ', data: {} }
      ]
    };

    const sanitized = sanitizeIncidentPayload(payload);
    assert.strictEqual(sanitized.sources[0].description, '');
    assert.strictEqual(sanitized.sources[1].description, '');
    assert.strictEqual(sanitized.sources[2].description, 'Valid description');
  });

  test('should preserve dynamic source.data schema-less structure', () => {
    const payload = {
      heading: 'Incident with dynamic values',
      summary: 'Some descriptive summary here',
      sources: [
        {
          name: 'GITHUB',
          description: 'PR updates',
          data: {
            commitId: 'abc1234',
            author: 'John Doe',
            stats: {
              additions: 100,
              deletions: 50
            }
          }
        }
      ]
    };

    const sanitized = sanitizeIncidentPayload(payload);
    assert.deepStrictEqual(sanitized.sources[0].data, {
      commitId: 'abc1234',
      author: 'John Doe',
      stats: {
        additions: 100,
        deletions: 50
      }
    });
  });

  test('should return input if it is not an object', () => {
    assert.strictEqual(sanitizeIncidentPayload(null), null);
    assert.strictEqual(sanitizeIncidentPayload('not-an-object'), 'not-an-object');
  });
});
