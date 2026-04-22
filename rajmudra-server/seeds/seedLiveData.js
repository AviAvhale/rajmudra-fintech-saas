/**
 * Seed LiveSession + DailyAnalysis collections.
 * Run: node seeds/seedLiveData.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const LiveSession = require('../models/LiveSession');
const DailyAnalysis = require('../models/DailyAnalysis');

const SESSIONS = [
  {
    topic: 'Smart Money Concepts',
    instructor: 'Vishal Tompe Patil',
    instructorAvatar: 'VTP',
    phase: 'Phase 3',
    roomCode: 'RM-7842',
    status: 'live',
    viewers: 28,
    batch: 'Batch A - Jan 2026',
    scheduledAt: new Date(),
  },
  {
    topic: 'Price Action Deep Dive',
    instructor: 'Nilesh Thore Patil',
    instructorAvatar: 'NTP',
    phase: 'Phase 2',
    roomCode: 'RM-3291',
    status: 'live',
    viewers: 14,
    batch: 'Batch A - Jan 2026',
    scheduledAt: new Date(),
  },
  {
    topic: 'Risk Management Fundamentals',
    instructor: 'Vishal Tompe Patil',
    instructorAvatar: 'VTP',
    phase: 'Phase 4',
    roomCode: 'RM-5518',
    status: 'upcoming',
    batch: 'Batch A - Jan 2026',
    scheduledAt: new Date(Date.now() + 3 * 3600000), // 3 hours from now
  },
  {
    topic: 'Trade Psychology Masterclass',
    instructor: 'Nilesh Thore Patil',
    instructorAvatar: 'NTP',
    phase: 'Phase 4',
    roomCode: 'RM-6472',
    status: 'upcoming',
    batch: 'Batch B - Feb 2026',
    scheduledAt: new Date(Date.now() + 5 * 3600000),
  },
  {
    topic: 'Live Trading — Day 1',
    instructor: 'Vishal Tompe Patil',
    instructorAvatar: 'VTP',
    phase: 'Phase 5',
    roomCode: 'RM-9103',
    status: 'upcoming',
    batch: 'Batch A - Jan 2026',
    scheduledAt: new Date(Date.now() + 3 * 86400000),
  },
  {
    topic: 'Live Trading — Day 2',
    instructor: 'Nilesh Thore Patil',
    instructorAvatar: 'NTP',
    phase: 'Phase 5',
    roomCode: 'RM-9104',
    status: 'upcoming',
    batch: 'Batch A - Jan 2026',
    scheduledAt: new Date(Date.now() + 4 * 86400000),
  },
  // Past/Ended sessions
  {
    topic: 'Order Block Analysis',
    instructor: 'Vishal Tompe Patil',
    instructorAvatar: 'VTP',
    phase: 'Phase 3',
    roomCode: 'RM-4210',
    status: 'ended',
    duration: '1h 24m',
    viewers: 34,
    batch: 'Batch A - Jan 2026',
    scheduledAt: new Date(Date.now() - 2 * 86400000),
  },
  {
    topic: 'Candlestick Patterns Deep Dive',
    instructor: 'Nilesh Thore Patil',
    instructorAvatar: 'NTP',
    phase: 'Phase 2',
    roomCode: 'RM-3812',
    status: 'ended',
    duration: '58m',
    viewers: 27,
    batch: 'Batch A - Jan 2026',
    scheduledAt: new Date(Date.now() - 4 * 86400000),
  },
  {
    topic: 'Fibonacci Retracement Masterclass',
    instructor: 'Vishal Tompe Patil',
    instructorAvatar: 'VTP',
    phase: 'Phase 2',
    roomCode: 'RM-2290',
    status: 'ended',
    duration: '1h 12m',
    viewers: 41,
    batch: 'Batch A - Jan 2026',
    scheduledAt: new Date(Date.now() - 6 * 86400000),
  },
  {
    topic: 'Support & Resistance Mastery',
    instructor: 'Nilesh Thore Patil',
    instructorAvatar: 'NTP',
    phase: 'Phase 2',
    roomCode: 'RM-1105',
    status: 'ended',
    duration: '45m',
    viewers: 22,
    batch: 'Batch A - Jan 2026',
    scheduledAt: new Date(Date.now() - 8 * 86400000),
  },
];

const ANALYSES = [
  {
    pair: 'XAU/USD',
    title: 'Gold Liquidity Grab Setup',
    author: 'Vishal Tompe Patil',
    body: 'Gold swept Asian session liquidity and tapped into the 4H bearish order block. Expecting a reaction down to 2340 before further continuation. Look for confirmation on 15m before entry. Key levels: 2358 resistance, 2340 support. Risk management: tight stop above the order block high.',
    images: ['https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80'],
    likes: 12,
  },
  {
    pair: 'GBP/USD',
    title: 'Post-NFP Reaction Analysis',
    author: 'Nilesh Thore Patil',
    body: 'NFP data pushed GBP/USD down into our daily demand zone at 1.2640. We are seeing strong rejection wicks forming. Wait for a break of structure on the 1H timeframe before taking any buys. Target: unchecked liquidity resting above 1.2720. RR: 1:3 minimum.',
    images: [],
    likes: 8,
  },
  {
    pair: 'EUR/USD',
    title: 'ECB Rate Decision Preview',
    author: 'Vishal Tompe Patil',
    body: 'EUR/USD consolidating ahead of the ECB rate decision tomorrow. The pair is trapped between 1.0820 support and 1.0900 resistance. Expect high volatility post-announcement. No new positions recommended until after the news. Key observation: the daily FVG at 1.0780 remains unfilled.',
    images: [],
    likes: 5,
  },
  {
    pair: 'USD/JPY',
    title: 'Yen Intervention Watch',
    author: 'Nilesh Thore Patil',
    body: 'USD/JPY approaching the 155.00 psychological level where Japan previously intervened. The ministry of finance has issued verbal warnings. If we see a sharp rejection from 155.00+, look for sell setups on lower timeframes with targets at 152.50. This is a high-risk, high-reward scenario.',
    images: [],
    likes: 15,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await LiveSession.deleteMany({});
  console.log('Cleared old live sessions');
  await LiveSession.insertMany(SESSIONS);
  console.log(`✅ Seeded ${SESSIONS.length} live sessions`);

  await DailyAnalysis.deleteMany({});
  console.log('Cleared old analyses');
  await DailyAnalysis.insertMany(ANALYSES);
  console.log(`✅ Seeded ${ANALYSES.length} daily analyses`);

  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch(err => { console.error(err); process.exit(1); });
