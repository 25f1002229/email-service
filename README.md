Resilient Email Service
A robust email-sending micro-service in TypeScript featuring automatic retries with exponential back-off, provider fallback, idempotency, rate limiting with queueing, status tracking, circuit breaker protection, and simple timestamped logging.

Prerequisites:
1. Node.js (v14 or newer)
2. npm (comes with Node.js)
3. TypeScript (included as dev dependency)
4. Jest (included as dev dependency)

Setup Instructions:
1. Clone and Install:
bash
git clone https://github.com/25f1002229/email-service.git
cd email-service
npm install
2. Build the Project:
bash
npm run build
3. Run Tests:
bash
npm test

Features:
1. Retry Logic: Exponential backoff, up to 3 attempts per provider
2. Fallback: Automatic switch to next provider on failure
3. Idempotency: Unique email IDs prevent duplicate sends
4. Rate Limiting: Token bucket (default 5 emails/sec), overflow goes to queue
5. Status Tracking: Real-time status, attempts, and error tracking
6. Circuit Breaker: Prevents repeated attempts on failing providers
7. Logging: Timestamped logs for all major actions
8. Queue System: FIFO queue for emails exceeding rate limit
9. Mock Providers: Simulated providers with configurable failure rates
10. Unit Tests: Jest test suite for all core features

Configuration
1. Rate Limiting: Default is 5 emails/sec; adjust in EmailService.ts constructor.
2. Circuit Breaker: Default is 3 failures, 10s timeout; adjust in CircuitBreaker.ts.
3. Provider Failure Rates: Change in ProviderA.ts and ProviderB.ts.


Test coverage includes:
1. Email sending success/failure
2. Idempotency
3. Rate limiting and queueing
4. Provider fallback
5. Circuit breaker
6. Status tracking

Assumptions:
1. Providers are mocks; no real emails are sent.
2. Rate limiting and queueing are in-memory.
3. Each email requires a unique ID for idempotency.
4. Exponential backoff uses a base delay of 100ms.

Contributing:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

License
MIT License. See the LICENSE file for details.