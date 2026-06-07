import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/database.js';
import Incident from './models/incident.model.js';

const sampleIncidents = [
  {
    heading: 'High CPU utilization detected on checkout-service',
    summary: 'A CPU utilization spike exceeded the threshold of 90% for more than 5 minutes on the checkout microservice instances.',
    sources: [
      {
        name: 'PROMETHEUS',
        description: 'Alertmanager trigger: CpuUtilizationHigh',
        data: {
          metric: 'node_cpu_seconds_total',
          value: 94.2,
          threshold: 90.0,
          labels: {
            service: 'checkout-service',
            env: 'production'
          }
        }
      }
    ]
  },
  {
    heading: 'Database connection pool exhaustion in checkout-service logs',
    summary: 'Multiple JedisConnectionException entries found in checkout-service logs, causing failures in transaction processing.',
    sources: [
      {
        name: 'KIBANA',
        description: 'Kibana log analysis query for connection timeouts',
        data: {
          query: 'service:checkout-service AND error:"JedisConnectionException"',
          hits: 47,
          logs: [
            'redis.clients.jedis.exceptions.JedisConnectionException: Could not get a resource from the pool',
            'Connection lease expired after 3000ms'
          ]
        }
      }
    ]
  },
  {
    heading: 'Checkout Service deployment checkout-service-pr-142 fails on start',
    summary: 'Deployment logs show application crashes immediately after merging PR #142 containing Redis connection properties updates.',
    sources: [
      {
        name: 'GITHUB',
        description: 'GitHub Pull Request: Update Redis configuration properties',
        data: {
          repo: 'VedantSahu01/OpsPilot',
          pr_number: 142,
          author: 'dev-user',
          merged_at: '2026-06-07T10:00:00Z',
          changes: {
            files: ['config/redis.yml'],
            additions: 4,
            deletions: 2
          }
        }
      }
    ]
  },
  {
    heading: 'Checkout Service 500 Errors due to Redis Connection Pool Exhaustion',
    summary: 'A spike in 500 errors on checkout-service was detected by Prometheus, confirmed by JedisConnectionExceptions in Kibana logs, and correlated to recent GitHub PR configuration updates.',
    sources: [
      {
        name: 'PROMETHEUS',
        description: 'Prometheus metrics showing increase in HTTP 500 errors.',
        data: {
          metric: 'http_requests_total',
          filters: { status: '500', service: 'checkout-service' },
          value: 154,
          duration: '10m'
        }
      },
      {
        name: 'KIBANA',
        description: 'Kibana logs showing JedisConnectionException.',
        data: {
          timestamp: '2026-06-07T10:15:00Z',
          log_level: 'ERROR',
          message: 'redis.clients.jedis.exceptions.JedisConnectionException: Could not get a resource from the pool'
        }
      },
      {
        name: 'GITHUB',
        description: 'GitHub PR details.',
        data: {
          pr_id: 1042,
          title: 'feat: decrease connection pool timeout for redis',
          status: 'merged'
        }
      }
    ]
  }
];

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing incidents...');
    await Incident.deleteMany({});
    console.log('Existing incidents cleared.');

    console.log('Seeding new incidents...');
    const createdIncidents = await Incident.create(sampleIncidents);
    console.log(`Successfully seeded ${createdIncidents.length} incidents.`);
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedData();
