// MongoDB Schema for Donation Website System

// 1. Ambassadors Collection
db.createCollection("ambassadors", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["firstName", "lastName", "donationGoal", "phoneNumber", "utm"],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        firstName: {
          bsonType: "string",
          description: "Ambassador's first name - required"
        },
        lastName: {
          bsonType: "string",
          description: "Ambassador's last name - required"
        },
        donationGoal: {
          bsonType: "number",
          minimum: 0,
          description: "Target donation amount - required"
        },
        phoneNumber: {
          bsonType: "string",
          pattern: "^[+]?[0-9\\s\\-\\(\\)]+$",
          description: "Phone number - required"
        },
        utm: {
          bsonType: "string",
          description: "Unique UTM code for tracking donations - required"
        },
        createdAt: {
          bsonType: "date",
          description: "Ambassador registration date"
        },
        updatedAt: {
          bsonType: "date",
          description: "Last update timestamp"
        },
        isActive: {
          bsonType: "bool",
          description: "Whether ambassador is currently active"
        }
      }
    }
  }
});

// 2. Partners (Donators) Collection
db.createCollection("partners", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["firstName", "lastName", "secretDonation"],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        firstName: {
          bsonType: "string",
          description: "Partner's first name - required"
        },
        lastName: {
          bsonType: "string",
          description: "Partner's last name - required"
        },
        secretDonation: {
          bsonType: "bool",
          description: "If true, name won't be shown in frontend - required"
        },
        totalDonationSum: {
          bsonType: "number",
          minimum: 0,
          description: "Sum of all donations made"
        },
        lastDonated: {
          bsonType: "date",
          description: "Date of last donation"
        },
        createdAt: {
          bsonType: "date",
          description: "Partner registration date"
        },
        updatedAt: {
          bsonType: "date",
          description: "Last update timestamp"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Partner's email address"
        },
        phoneNumber: {
          bsonType: "string",
          pattern: "^[+]?[0-9\\s\\-\\(\\)]+$",
          description: "Partner's phone number"
        }
      }
    }
  }
});

// 3. Donations Collection (to track individual donations)
db.createCollection("donations", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["partnerId", "ambassadorId", "amount", "donationDate"],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        partnerId: {
          bsonType: "objectId",
          description: "Reference to partner who made donation - required"
        },
        ambassadorId: {
          bsonType: "objectId",
          description: "Reference to ambassador who recruited donation - required"
        },
        amount: {
          bsonType: "number",
          minimum: 0.01,
          description: "Donation amount - required"
        },
        donationDate: {
          bsonType: "date",
          description: "When donation was made - required"
        },
        utm: {
          bsonType: "string",
          description: "UTM code used for this donation"
        },
        paymentMethod: {
          bsonType: "string",
          enum: ["credit_card", "bank_transfer", "cash", "check", "paypal", "other"],
          description: "How the donation was paid"
        },
        currency: {
          bsonType: "string",
          description: "Currency code (e.g., USD, ILS, EUR)"
        },
        notes: {
          bsonType: "string",
          description: "Optional notes about the donation"
        },
        isRecurring: {
          bsonType: "bool",
          description: "Whether this is a recurring donation"
        },
        status: {
          bsonType: "string",
          enum: ["pending", "completed", "failed", "refunded"],
          description: "Donation processing status"
        }
      }
    }
  }
});

// Create Indexes for Performance

// Ambassadors indexes
db.ambassadors.createIndex({ "utm": 1 }, { unique: true }); // UTM must be unique
db.ambassadors.createIndex({ "phoneNumber": 1 });
db.ambassadors.createIndex({ "lastName": 1, "firstName": 1 });
db.ambassadors.createIndex({ "createdAt": 1 });

// Partners indexes
db.partners.createIndex({ "lastName": 1, "firstName": 1 });
db.partners.createIndex({ "lastDonated": -1 }); // Most recent first
db.partners.createIndex({ "totalDonationSum": -1 }); // Highest donors first
db.partners.createIndex({ "secretDonation": 1 });
db.partners.createIndex({ "email": 1 }, { unique: true, sparse: true }); // Email unique if provided

// Donations indexes
db.donations.createIndex({ "partnerId": 1 });
db.donations.createIndex({ "ambassadorId": 1 });
db.donations.createIndex({ "donationDate": -1 }); // Most recent first
db.donations.createIndex({ "utm": 1 });
db.donations.createIndex({ "partnerId": 1, "donationDate": -1 }); // Compound index for partner's donation history
db.donations.createIndex({ "ambassadorId": 1, "donationDate": -1 }); // Compound index for ambassador's recruited donations

// Sample Data Insertion

// Insert sample ambassador
db.ambassadors.insertOne({
  firstName: "David",
  lastName: "Cohen",
  donationGoal: 50000,
  phoneNumber: "+972-50-123-4567",
  utm: "AMB_DCOHEN_2025",
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true
});

// Insert sample partner
db.partners.insertOne({
  firstName: "Sarah",
  lastName: "Levy",
  secretDonation: false,
  totalDonationSum: 1500,
  lastDonated: new Date("2025-08-15"),
  createdAt: new Date("2025-01-10"),
  updatedAt: new Date(),
  email: "sarah.levy@example.com",
  phoneNumber: "+972-50-987-6543"
});

// Insert sample secret donor
db.partners.insertOne({
  firstName: "Anonymous",
  lastName: "Donor",
  secretDonation: true,
  totalDonationSum: 5000,
  lastDonated: new Date("2025-09-01"),
  createdAt: new Date("2025-03-15"),
  updatedAt: new Date()
});

// Useful Aggregation Queries

// 1. Get ambassador performance with total donations recruited
const ambassadorPerformance = [
  {
    $lookup: {
      from: "donations",
      localField: "_id",
      foreignField: "ambassadorId",
      as: "recruitedDonations"
    }
  },
  {
    $addFields: {
      totalRecruited: { $sum: "$recruitedDonations.amount" },
      donationCount: { $size: "$recruitedDonations" },
      progressPercentage: {
        $multiply: [
          { $divide: [{ $sum: "$recruitedDonations.amount" }, "$donationGoal"] },
          100
        ]
      }
    }
  },
  {
    $project: {
      firstName: 1,
      lastName: 1,
      donationGoal: 1,
      utm: 1,
      totalRecruited: 1,
      donationCount: 1,
      progressPercentage: 1
    }
  }
];

// 2. Get top donors (excluding secret donations for public display)
const topDonors = [
  {
    $match: { secretDonation: false }
  },
  {
    $sort: { totalDonationSum: -1 }
  },
  {
    $limit: 10
  },
  {
    $project: {
      firstName: 1,
      lastName: 1,
      totalDonationSum: 1,
      lastDonated: 1
    }
  }
];

// 3. Monthly donation summary
const monthlyDonations = [
  {
    $group: {
      _id: {
        year: { $year: "$donationDate" },
        month: { $month: "$donationDate" }
      },
      totalAmount: { $sum: "$amount" },
      donationCount: { $sum: 1 },
      uniqueDonors: { $addToSet: "$partnerId" }
    }
  },
  {
    $addFields: {
      uniqueDonorCount: { $size: "$uniqueDonors" }
    }
  },
  {
    $sort: { "_id.year": -1, "_id.month": -1 }
  }
];

console.log("MongoDB Donation System Schema created successfully!");
console.log("Collections: ambassadors, partners, donations");
console.log("Sample aggregation pipelines included for reporting");