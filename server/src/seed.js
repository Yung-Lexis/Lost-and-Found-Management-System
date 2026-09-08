const dotenv = require('dotenv');
dotenv.config();

const { connectDB, disconnectDB } = require('./config/db');
const Item = require('./models/Item');
const User = require('./models/User');

const sampleItems = [
  {
    title: 'Black Leather Bifold Wallet',
    type: 'lost',
    category: 'Wallets & Purses',
    description: 'Black leather Fossil wallet containing student ID card, transit pass, and driver license.',
    location: 'Central Library, 2nd Floor Study Desk',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    status: 'lost',
    priority: 'high',
    tags: ['wallet', 'id card', 'license', 'urgent'],
    reporterName: 'Alex Morgan',
    reporterContact: 'alex.m@example.com / +1 (555) 234-5678',
    image: '',
    history: [
      {
        action: 'Reported',
        description: 'Reported as lost item by Alex Morgan',
        performedBy: 'Alex Morgan',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ],
    claimDetails: {
      claimedBy: '',
      claimantContact: '',
      notes: ''
    }
  },
  {
    title: 'Apple AirPods Pro (2nd Gen) in White Case',
    type: 'found',
    category: 'Electronics',
    description: 'Found on the bench near the water fountain. White charging case with a small sticker on back.',
    location: 'Student Cafeteria near Vending Machines',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    status: 'found',
    priority: 'high',
    tags: ['airpods', 'apple', 'headphones', 'bluetooth'],
    reporterName: 'David Chen',
    reporterContact: 'david.chen@example.com',
    image: '',
    history: [
      {
        action: 'Reported',
        description: 'Handed in as found item by David Chen',
        performedBy: 'David Chen',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ],
    claimDetails: {
      claimedBy: '',
      claimantContact: '',
      notes: ''
    }
  },
  {
    title: 'Silver Key Ring with Subaru Key Fob & Blue Lanyard',
    type: 'found',
    category: 'Keys',
    description: 'Set of 3 keys including a car fob and gym membership barcode tag.',
    location: 'North Parking Lot, Row C',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    status: 'found',
    priority: 'high',
    tags: ['subaru', 'car keys', 'lanyard', 'urgent'],
    reporterName: 'Campus Security Office',
    reporterContact: 'security-desk@campus.edu',
    image: '',
    history: [
      {
        action: 'Reported',
        description: 'Turned in to security desk by Campus Patrol',
        performedBy: 'Officer Davis',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ],
    claimDetails: {
      claimedBy: '',
      claimantContact: '',
      notes: ''
    }
  },
  {
    title: 'Space Gray MacBook Pro 14" Charger (67W)',
    type: 'lost',
    category: 'Electronics',
    description: 'Apple MagSafe 3 braided cable and USB-C power adapter left plugged into wall outlet.',
    location: 'Science Building Room 304',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    status: 'lost',
    priority: 'medium',
    tags: ['apple', 'charger', 'magsafe', 'macbook'],
    reporterName: 'Sarah Jenkins',
    reporterContact: 's.jenkins@example.org',
    image: '',
    history: [
      {
        action: 'Reported',
        description: 'Reported as lost item by Sarah Jenkins',
        performedBy: 'Sarah Jenkins',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      }
    ],
    claimDetails: {
      claimedBy: '',
      claimantContact: '',
      notes: ''
    }
  },
  {
    title: 'Hydro Flask Water Bottle (Cobalt Blue, 32oz)',
    type: 'found',
    category: 'Other',
    description: 'Cobalt blue insulated bottle with various national park stickers.',
    location: 'Gymnasium Bleachers Section 2',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'claimed',
    priority: 'low',
    tags: ['hydro flask', 'water bottle', 'blue', 'stickers'],
    reporterName: 'Coach Martinez',
    reporterContact: 'gym-staff@example.com',
    image: '',
    history: [
      {
        action: 'Reported',
        description: 'Found at gymnasium bleachers and turned in by Coach Martinez',
        performedBy: 'Coach Martinez',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        action: 'Claimed',
        description: 'Verified ownership via stickers and handed over to Jordan Reed',
        performedBy: 'Staff Desk',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ],
    claimDetails: {
      claimedBy: 'Jordan Reed',
      claimantContact: 'jordan.reed@example.com',
      claimedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      notes: 'Verified identity and confirmed stickers on bottle before handover.'
    }
  },
  {
    title: 'Ray-Ban Aviator Sunglasses in Brown Case',
    type: 'lost',
    category: 'Clothing & Accessories',
    description: 'Gold metal frame aviators with polarized green lenses in brown leather case.',
    location: 'Campus Courtyard Coffee Shop',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    status: 'lost',
    priority: 'medium',
    tags: ['ray-ban', 'sunglasses', 'gold', 'leather case'],
    reporterName: 'Emily Watson',
    reporterContact: '+1 (555) 987-6543',
    image: '',
    history: [
      {
        action: 'Reported',
        description: 'Reported lost by Emily Watson',
        performedBy: 'Emily Watson',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      }
    ],
    claimDetails: {
      claimedBy: '',
      claimantContact: '',
      notes: ''
    }
  },
  {
    title: 'Texas Instruments TI-84 Plus CE Graphing Calculator',
    type: 'found',
    category: 'Electronics',
    description: 'Black calculator with mint slide cover. Has initials "M.K." etched faintly inside battery cover.',
    location: 'Math Department Hallway Bench',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'found',
    priority: 'medium',
    tags: ['calculator', 'ti-84', 'math', 'mint'],
    reporterName: 'Prof. Miller',
    reporterContact: 'pmiller@math.edu',
    image: '',
    history: [
      {
        action: 'Reported',
        description: 'Found outside lecture hall by Prof. Miller',
        performedBy: 'Prof. Miller',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ],
    claimDetails: {
      claimedBy: '',
      claimantContact: '',
      notes: ''
    }
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log('Clearing existing items...');
    await Item.deleteMany({});
    console.log('Inserting sample seed items...');
    const inserted = await Item.insertMany(sampleItems);
    console.log(`✓ Seed successful! Inserted ${inserted.length} sample items.`);

    console.log('Clearing existing users...');
    await User.deleteMany({});
    console.log('Inserting default staff and admin users...');
    await User.create([
      {
        name: 'Sarah Connor (Admin)',
        email: 'admin@findnest.com',
        password: 'password123',
        role: 'admin'
      },
      {
        name: 'Officer Davis (Staff)',
        email: 'staff@findnest.com',
        password: 'password123',
        role: 'staff'
      }
    ]);
    console.log('✓ Default users created: admin@findnest.com / password123, staff@findnest.com / password123');
  } catch (err) {
    console.error('✗ Seed error:', err);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = seedDB;
