require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Announcement = require('./models/Announcement');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Announcement.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // ── Seed Users ────────────────────────────────────────────────────────────
    const usersData = [
      { name: 'Super Admin',        email: 'superadmin@rajmudra.com', password: 'admin123', role: 'superadmin', avatar: 'SA',  phone: '+91 99999 00000', city: 'Mumbai', hasPaid: true },
      { name: 'Vishal Tompe Patil', email: 'vishal@rajmudra.com',     password: 'admin123', role: 'admin',      avatar: 'VTP', phone: '+91 98765 43210', city: 'Pune',   batch: 'Batch A - Jan 2026', hasPaid: true },
      { name: 'Nilesh Thore Patil', email: 'nilesh@rajmudra.com',     password: 'admin123', role: 'admin',      avatar: 'NTP', phone: '+91 91234 56789', city: 'Nashik', batch: 'Batch B - Feb 2026', hasPaid: true },
      { name: 'Rahul Sharma',       email: 'trader@example.com',      password: 'user12345', role: 'user',      avatar: 'RS',  phone: '+91 87654 32109', city: 'Delhi',  batch: 'Batch A - Jan 2026', hasPaid: true },
      { name: 'Priya Patel',        email: 'priya@example.com',       password: 'user12345', role: 'user',      avatar: 'PP',  phone: '+91 76543 21098', city: 'Ahmedabad', batch: 'Batch B - Feb 2026', hasPaid: false },
      { name: 'Arjun Mehta',        email: 'arjun@example.com',       password: 'user12345', role: 'user',      avatar: 'AM',  phone: '+91 65432 10987', city: 'Bangalore', batch: 'Batch C - Mar 2026', hasPaid: true },
    ];

    // Use create() one-by-one so bcrypt pre-save hook fires for each user
    const users = [];
    for (const u of usersData) {
      users.push(await User.create(u));
    }

    console.log(`👥 Seeded ${users.length} users`);

    // ── Seed Announcements ────────────────────────────────────────────────────
    const superAdmin = users.find((u) => u.role === 'superadmin');

    await Announcement.insertMany([
      {
        title: '🚀 Welcome to Rajmudra Fintech!',
        body: 'We are thrilled to have you onboard. Your SMC trading journey begins today. Please check your batch schedule and join the live sessions on time.',
        priority: 'high',
        postedBy: superAdmin._id,
        visibleTo: ['all'],
      },
      {
        title: '📅 Batch A — Live Session This Weekend',
        body: 'Batch A members: Your next live trading session is scheduled for Saturday at 10:00 AM IST. Join early for Q&A.',
        priority: 'medium',
        postedBy: superAdmin._id,
        visibleTo: ['user', 'admin'],
      },
      {
        title: '🔧 Platform Maintenance Notice',
        body: 'Scheduled maintenance on Sunday 2:00 AM – 4:00 AM IST. The platform will be temporarily unavailable during this window.',
        priority: 'low',
        postedBy: superAdmin._id,
        visibleTo: ['all'],
      },
    ]);

    console.log('📣 Seeded 3 announcements');
    console.log('\n✅ Seeding complete! Demo accounts:');
    console.log('   SuperAdmin : superadmin@rajmudra.com / admin123');
    console.log('   Admin      : vishal@rajmudra.com / admin123');
    console.log('   Admin      : nilesh@rajmudra.com / admin123');
    console.log('   User/Trader: trader@example.com / user12345');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
