/**
   * Concurrency-Safety & Least-Loaded Agent Assignment Integration Test
   * 
   * This script tests our locking mechanism (SELECT FOR UPDATE) under parallel load.
   * Scenario:
   * 1. Seeds 3 Sales Agents (A, B, C).
   * 2. Triggers 12 concurrent lead creations in parallel using Promise.all().
   * 3. Verifies that the leads are distributed evenly across the 3 agents (exactly 4 each).
   * 
   * Run with: npm run test:concurrency
   */

require('dotenv').config();
const { sequelize, User, Lead } = require('./src/models');
const LeadService = require('./src/services/LeadService');

async function runTest() {
  console.log('========================================================');
  console.log(' STARTING CONCURRENCY-SAFETY AUTO-ASSIGNMENT TEST');
  console.log('========================================================');

  try {
    // Authenticate and sync
    await sequelize.authenticate();
    await sequelize.sync({ force: false });

    // Clean up existing leads to ensure clean math
    console.log('Cleaning existing leads and logs...');
    await Lead.destroy({ where: {}, force: true });

    // Ensure we have a Manager who can create leads
    let manager = await User.findOne({ where: { role: 'MANAGER' } });
    if (!manager) {
      manager = await User.create({
        name: 'Test Manager',
        email: 'testmanager@waanee.ai',
        password: 'password123',
        role: 'MANAGER'
      });
    }

    // Seed 3 Agents
    console.log('Checking/Seeding 3 sales agents...');
    const agentsInfo = [
      { name: 'Agent Alpha', email: 'alpha@waanee.ai' },
      { name: 'Agent Beta', email: 'beta@waanee.ai' },
      { name: 'Agent Gamma', email: 'gamma@waanee.ai' }
    ];

    const agents = [];
    for (const info of agentsInfo) {
      let agent = await User.findOne({ where: { email: info.email } });
      if (agent) {
        // Soft delete restore if any
        await agent.restore();
      } else {
        agent = await User.create({
          name: info.name,
          email: info.email,
          password: 'password123',
          role: 'AGENT'
        });
      }
      agents.push(agent);
    }

    console.log(`Agents Seeded: ${agents.map(a => a.name).join(', ')}`);

    // Prepare 12 concurrent lead creation requests
    console.log('\nSpawning 12 concurrent lead creation requests in parallel...');
    
    const leadPromises = [];
    for (let i = 1; i <= 12; i++) {
      const leadData = {
        name: `Concurrent Lead #${i}`,
        email: `lead${i}@example.com`,
        phone: `555-000${i}`,
        source: 'Concurrency Testing'
      };
      
      // Push promise to array
      leadPromises.push(
        LeadService.createLead(leadData, manager.id)
          .then(lead => {
            console.log(`[Success] Lead ${lead.name} assigned to Agent ID: ${lead.assignedTo}`);
            return lead;
          })
          .catch(err => {
            console.error(`[Failure] Lead creation failed: ${err.message}`);
            throw err;
          })
      );
    }

    // Fire all 12 requests in parallel!
    const results = await Promise.all(leadPromises);
    console.log(`\nAll 12 leads processed. Analyzing distributions...`);

    // Count distributions
    const distribution = {};
    agents.forEach(a => {
      distribution[a.id] = { name: a.name, count: 0 };
    });

    results.forEach(lead => {
      if (lead.assignedTo && distribution[lead.assignedTo]) {
        distribution[lead.assignedTo].count++;
      }
    });

    console.log('\n========================================================');
    console.log(' CONCURRENCY TEST ANALYSIS RESULTS');
    console.log('========================================================');
    
    let isBalanced = true;
    for (const id in distribution) {
      const agent = distribution[id];
      console.log(` - ${agent.name}: assigned ${agent.count} active leads.`);
      if (agent.count !== 4) {
        isBalanced = false;
      }
    }

    if (isBalanced) {
      console.log('\nSUCCESS: Auto-assignment is perfectly balanced! (4 leads per agent)');
      console.log('VERDICT: Row locks (SELECT FOR UPDATE) serialized assignments correctly.');
    } else {
      console.log('\nWARNING: Leads are not perfectly balanced. Double check transaction locks.');
    }
    console.log('========================================================');

  } catch (error) {
    console.error('Concurrency test failed with error:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

runTest();
