/**
 * Performance and Load Testing Suite
 * 
 * To run these tests:
 * 1. Start the application: npm run start:dev
 * 2. Run load tests: npm run test:load
 * 
 * Install dependencies:
 * npm install --save-dev autocannon
 */

const autocannon = require('autocannon');

const BASE_URL = 'http://localhost:3000';

/**
 * Health Check Load Test
 * Tests basic availability under load
 */
async function testHealthEndpoint() {
  console.log('\n🔍 Testing Health Endpoint...');
  
  const result = await autocannon({
    url: `${BASE_URL}/api/v1/health`,
    connections: 100, // Concurrent connections
    duration: 30,      // Duration in seconds
    pipelining: 1,
    title: 'Health Check Load Test',
  });

  printResults(result);
  return result;
}

/**
 * Authentication Load Test
 * Tests login endpoint under load
 */
async function testLoginEndpoint() {
  console.log('\n🔐 Testing Login Endpoint...');
  
  const result = await autocannon({
    url: `${BASE_URL}/api/v1/auth/login`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'Test123!@#',
    }),
    connections: 50,
    duration: 30,
    pipelining: 1,
    title: 'Login Load Test',
  });

  printResults(result);
  return result;
}

/**
 * Job Listing Load Test
 * Tests job retrieval endpoint under load
 */
async function testJobsEndpoint() {
  console.log('\n💼 Testing Jobs Listing Endpoint...');
  
  const result = await autocannon({
    url: `${BASE_URL}/api/v1/jobs?page=1&limit=10`,
    connections: 100,
    duration: 30,
    pipelining: 1,
    title: 'Jobs Listing Load Test',
  });

  printResults(result);
  return result;
}

/**
 * Authenticated Endpoint Load Test
 * Tests protected endpoints with JWT token
 */
async function testAuthenticatedEndpoint(token) {
  console.log('\n🔒 Testing Authenticated Endpoint...');
  
  const result = await autocannon({
    url: `${BASE_URL}/api/v1/users/profile`,
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    connections: 50,
    duration: 30,
    pipelining: 1,
    title: 'Authenticated Profile Load Test',
  });

  printResults(result);
  return result;
}

/**
 * Stress Test - Gradual Load Increase
 */
async function stressTest() {
  console.log('\n🔥 Running Stress Test...');
  
  const stages = [10, 50, 100, 200, 500];
  const results = [];

  for (const connections of stages) {
    console.log(`\nTesting with ${connections} connections...`);
    
    const result = await autocannon({
      url: `${BASE_URL}/api/v1/health`,
      connections: connections,
      duration: 10,
      pipelining: 1,
      title: `Stress Test - ${connections} connections`,
    });

    results.push({
      connections,
      latency: result.latency,
      requests: result.requests,
      throughput: result.throughput,
      errors: result.errors,
      timeouts: result.timeouts,
    });

    // Small delay between stages
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n📊 Stress Test Summary:');
  console.table(results);
  
  return results;
}

/**
 * Spike Test - Sudden Traffic Increase
 */
async function spikeTest() {
  console.log('\n⚡ Running Spike Test...');
  
  // Normal load
  console.log('Phase 1: Normal load (10 connections)');
  await autocannon({
    url: `${BASE_URL}/api/v1/health`,
    connections: 10,
    duration: 10,
    title: 'Spike Test - Normal Load',
  });

  // Sudden spike
  console.log('\nPhase 2: Sudden spike (500 connections)');
  const spikeResult = await autocannon({
    url: `${BASE_URL}/api/v1/health`,
    connections: 500,
    duration: 10,
    title: 'Spike Test - Traffic Spike',
  });

  // Recovery
  console.log('\nPhase 3: Recovery (10 connections)');
  await autocannon({
    url: `${BASE_URL}/api/v1/health`,
    connections: 10,
    duration: 10,
    title: 'Spike Test - Recovery',
  });

  printResults(spikeResult);
  return spikeResult;
}

/**
 * Database Query Performance Test
 */
async function testDatabasePerformance() {
  console.log('\n💾 Testing Database Query Performance...');
  
  const endpoints = [
    '/api/v1/jobs',
    '/api/v1/users/1',
    '/api/v1/job-applications',
  ];

  const results = [];

  for (const endpoint of endpoints) {
    console.log(`\nTesting ${endpoint}...`);
    
    const result = await autocannon({
      url: `${BASE_URL}${endpoint}`,
      connections: 50,
      duration: 15,
      pipelining: 1,
      title: `Database Test - ${endpoint}`,
    });

    results.push({
      endpoint,
      avgLatency: result.latency.mean,
      p99Latency: result.latency.p99,
      requestsPerSec: result.requests.mean,
      errors: result.errors,
    });
  }

  console.log('\n📊 Database Performance Summary:');
  console.table(results);
  
  return results;
}

/**
 * Helper function to print test results
 */
function printResults(result) {
  console.log('\n📈 Results:');
  console.log('─'.repeat(50));
  console.log(`  Requests:        ${result.requests.total} total`);
  console.log(`  Request/sec:     ${result.requests.mean.toFixed(2)} avg`);
  console.log(`  Latency (ms):`);
  console.log(`    - Average:     ${result.latency.mean.toFixed(2)}`);
  console.log(`    - p50:         ${result.latency.p50.toFixed(2)}`);
  console.log(`    - p95:         ${result.latency.p95.toFixed(2)}`);
  console.log(`    - p99:         ${result.latency.p99.toFixed(2)}`);
  console.log(`    - Max:         ${result.latency.max.toFixed(2)}`);
  console.log(`  Throughput:      ${(result.throughput.mean / 1024 / 1024).toFixed(2)} MB/s`);
  console.log(`  Errors:          ${result.errors}`);
  console.log(`  Timeouts:        ${result.timeouts}`);
  console.log('─'.repeat(50));

  // Performance checks
  const checks = {
    '✓ Average latency < 100ms': result.latency.mean < 100,
    '✓ P95 latency < 200ms': result.latency.p95 < 200,
    '✓ P99 latency < 500ms': result.latency.p99 < 500,
    '✓ No errors': result.errors === 0,
    '✓ No timeouts': result.timeouts === 0,
    '✓ Request rate > 100/s': result.requests.mean > 100,
  };

  console.log('\n✅ Performance Checks:');
  Object.entries(checks).forEach(([check, passed]) => {
    console.log(`  ${passed ? '✓' : '✗'} ${check.substring(2)}`);
  });
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Performance Test Suite');
  console.log('=' .repeat(50));

  try {
    // Basic load tests
    await testHealthEndpoint();
    await testJobsEndpoint();
    
    // Database performance
    await testDatabasePerformance();
    
    // Stress tests
    await stressTest();
    
    // Spike test
    await spikeTest();

    console.log('\n✅ All performance tests completed!');
  } catch (error) {
    console.error('\n❌ Performance test failed:', error);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testHealthEndpoint,
  testLoginEndpoint,
  testJobsEndpoint,
  testAuthenticatedEndpoint,
  stressTest,
  spikeTest,
  testDatabasePerformance,
};
