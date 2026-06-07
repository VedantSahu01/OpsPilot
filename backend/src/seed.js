import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/database.js';
import Incident from './models/incident.model.js';

const sampleIncidents = [
  {
    heading: 'Checkout Service 500 Errors due to Redis Connection Pool Exhaustion',
    summary: 'Automated monitoring detected a sharp spike in HTTP 500 responses across the checkout microservice. Initial diagnostics point to Jedis pool saturation in the session-store-01 cluster, preventing new transaction handling.',
    resolved: false,
    sources: [
      {
        name: 'PROMETHEUS',
        description: 'namespace: production / svc: checkout-api',
        data: {
          metric: 'http_requests_total',
          value: '510 req/s',
          result: [
            {
              values: [
                "1780811474: 82",
                "1780811594: 245",
                "1780811714: 510",
                "1780811834: 498"
              ]
            }
          ]
        }
      },
      {
        name: 'GITHUB',
        description: 'PR #462',
        data: {
          pull_requests: [
            {
              pr_number: 462,
              title: 'perf(redis): Optimize session validation lookup',
              diff_summary: 'Changed default connection timeout from 2000ms to 500ms and increased max-active connections. +114 -42',
              state: 'MERGED',
              merge_date: '2026-06-07T10:00:00Z',
              url: 'https://github.com/VedantSahu01/OpsPilot/pull/462'
            }
          ]
        }
      },
      {
        name: 'KIBANA',
        description: 'cluster: us-east-1 / pod: checkout-v2-88fb',
        data: {
          hits: [
            {
              timestamp: '08:49:12.441',
              log_level: 'ERROR',
              message: 'redis.clients.jedis.exceptions.JedisConnectionException: Could not get a resource from the pool',
              stack_trace: '  at redis.clients.util.Pool.getResource(Pool.java:53)\n  at redis.clients.jedis.JedisPool.getResource(JedisPool.java:99)\n  at com.opspilot.checkout.SessionManager.validate(SessionManager.java:142)\n  CAUSED BY: java.util.NoSuchElementException: Timeout waiting for idle object\n\n08:49:13.002 [CRITICAL] Pool exhaustion detected on session-store-01. Max active reached (100/100).'
            }
          ]
        }
      },
      {
        name: 'ARGO',
        description: 'ArgoCD Deployment Sync',
        data: {
          deployment: 'checkout-service',
          version: 'v1.2.4',
          status: 'Healthy',
          sync_at: '2026-06-07T08:30:00Z',
          events: [
            'Sync Succeeded',
            'ReplicaSet checkout-service-7f4b8d96b8 scaled to 3'
          ]
        }
      }
    ]
  },
  {
    heading: 'Stripe API Webhook Latency Spike',
    summary: 'Muted webhook responses from the external payment service caused client transaction delays and database lock contentions.',
    resolved: true,
    sources: [
      {
        name: 'PROMETHEUS',
        description: 'namespace: billing / svc: webhook-handler',
        data: {
          metric: 'stripe_webhook_latency_seconds',
          value: '4.2s',
          result: [
            {
              values: [
                "1780811474: 0.8",
                "1780811594: 1.5",
                "1780811714: 4.2",
                "1780811834: 0.3"
              ]
            }
          ]
        }
      },
      {
        name: 'KIBANA',
        description: 'cluster: us-east-1 / pod: stripe-api-v1',
        data: {
          hits: [
            {
              timestamp: '08:50:00.123',
              log_level: 'WARN',
              message: 'Stripe webhook took too long to respond: 4200ms',
              stack_trace: '  at stripe.webhook.handler.process(Webhook.java:12)\n  at stripe.webhook.controller.receive(Controller.java:55)'
            }
          ]
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
