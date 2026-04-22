/**
 * Seed the Course collection with 5 phases.
 * Run once: node seeds/seedCourses.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');

const PHASES = [
  {
    phaseNum: '01',
    title: 'The Foundation',
    topicsList: ['Forex Basics', 'Currency Pairs', 'Pips & Lots', 'Leverage', 'Platform Setup', 'Order Types'],
    videos: [
      { title: 'Welcome to Rajmudra', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', description: 'Introduction to the programme' },
      { title: 'What is Forex?', url: '', description: 'Understanding the forex market' },
      { title: 'Currency Pairs Explained', url: '', description: 'Major, minor, and exotic pairs' },
      { title: 'Pips, Lots & Leverage', url: '', description: 'Core trading concepts' },
      { title: 'MT5 Platform Setup', url: '', description: 'Installing and configuring MetaTrader 5' },
      { title: 'Order Types Deep Dive', url: '', description: 'Market, limit, stop — when to use each' },
    ],
    enrolled: 847,
    completionPct: '94%',
  },
  {
    phaseNum: '02',
    title: 'Technical Analysis',
    topicsList: ['Candlestick Patterns', 'Support & Resistance', 'Trendlines & Channels', 'Price Action', 'Moving Averages', 'RSI & MACD'],
    videos: [
      { title: 'Reading Candlesticks', url: '', description: 'Doji, hammer, engulfing patterns' },
      { title: 'Support & Resistance Zones', url: '', description: 'Finding key levels' },
      { title: 'Trendlines Masterclass', url: '', description: 'Drawing and validating trendlines' },
      { title: 'Price Action Trading', url: '', description: 'Trading without indicators' },
    ],
    enrolled: 762,
    completionPct: '88%',
  },
  {
    phaseNum: '03',
    title: 'Advanced Strategy',
    topicsList: ['Smart Money Concepts', 'Order Blocks', 'Institutional Flow', 'Liquidity Grabs', 'Break of Structure', 'ICT Strategies'],
    videos: [
      { title: 'Smart Money 101', url: '', description: 'Understanding institutional trading' },
      { title: 'Order Blocks Explained', url: '', description: 'Finding and trading order blocks' },
      { title: 'Liquidity Concepts', url: '', description: 'Where the big money flows' },
    ],
    enrolled: 614,
    completionPct: '71%',
  },
  {
    phaseNum: '04',
    title: 'Risk Management',
    topicsList: ['Position Sizing', 'Risk-to-Reward Ratios', 'Trade Psychology', 'Journal Keeping', 'Max Drawdown Rules'],
    videos: [
      { title: 'Position Sizing Calculator', url: '', description: 'How much to risk per trade' },
      { title: 'R:R — The Golden Ratio', url: '', description: 'Why 1:3 R:R changes everything' },
    ],
    enrolled: 489,
    completionPct: '56%',
  },
  {
    phaseNum: '05',
    title: 'Execution & Audit',
    topicsList: ['4 Days Live Trading', 'Entry & Exit Mastery', 'Real Trade Reviews', 'Performance Metrics', 'Certification'],
    videos: [
      { title: 'Day 1 — Live Market Entry', url: '', description: 'First live trading day' },
    ],
    enrolled: 312,
    completionPct: '36%',
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await Course.deleteMany({});
  console.log('Cleared old course data');

  // Insert
  await Course.insertMany(PHASES);
  console.log(`✅ Seeded ${PHASES.length} course phases`);

  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch(err => { console.error(err); process.exit(1); });
