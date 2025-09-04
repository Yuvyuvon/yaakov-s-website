# 🏛️ MongoDB Donation System Schema

> **Database schema for the Yaakov Memorial Donation Website System**

---

## 📋 Collections Overview

| Collection | Purpose | Key Features |
|------------|---------|--------------|
| `ambassadors` | Donation campaign managers | UTM tracking, goals, performance metrics |
| `partners` | Donors/Contributors | Privacy controls, donation history |
| `donations` | Individual donation records | Payment tracking, attribution |

---

## 👥 Ambassadors Collection

**Purpose**: Track individuals who run donation campaigns for the memorial center

```javascript
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
```

---

## 🤝 Partners (Donors) Collection

**Purpose**: Store information about individuals and organizations who donate to the memorial center

```javascript
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
```

---

## 💰 Donations Collection

**Purpose**: Track individual donation transactions and link them to donors and ambassadors

```javascript
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
```

---

## 🚀 Database Indexes

**Performance optimization through strategic indexing**

### 👥 Ambassadors Indexes
```javascript
// UTM codes must be unique across all ambassadors
db.ambassadors.createIndex({ "utm": 1 }, { unique: true });

// Search by contact information
db.ambassadors.createIndex({ "phoneNumber": 1 });
db.ambassadors.createIndex({ "lastName": 1, "firstName": 1 });

// Time-based queries
db.ambassadors.createIndex({ "createdAt": 1 });
```

### 🤝 Partners Indexes
```javascript
// Name-based searches
db.partners.createIndex({ "lastName": 1, "firstName": 1 });

// Donation activity tracking
db.partners.createIndex({ "lastDonated": -1 }); // Most recent first
db.partners.createIndex({ "totalDonationSum": -1 }); // Highest donors first

// Privacy filtering
db.partners.createIndex({ "secretDonation": 1 });

// Email must be unique when provided
db.partners.createIndex({ "email": 1 }, { unique: true, sparse: true });
```

### 💰 Donations Indexes
```javascript
// Relationship queries
db.donations.createIndex({ "partnerId": 1 });
db.donations.createIndex({ "ambassadorId": 1 });

// Time-based sorting
db.donations.createIndex({ "donationDate": -1 }); // Most recent first

// UTM tracking
db.donations.createIndex({ "utm": 1 });

// Compound indexes for common query patterns
db.donations.createIndex({ "partnerId": 1, "donationDate": -1 });
db.donations.createIndex({ "ambassadorId": 1, "donationDate": -1 });
```

---

## 🗃️ Sample Data

**Example records for testing and development**

### 👨‍💼 Sample Ambassador
```javascript
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
```

### 👤 Sample Public Donor
```javascript
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
```

### 🕶️ Sample Anonymous Donor
```javascript
db.partners.insertOne({
  firstName: "Anonymous",
  lastName: "Donor",
  secretDonation: true,
  totalDonationSum: 5000,
  lastDonated: new Date("2025-09-01"),
  createdAt: new Date("2025-03-15"),
  updatedAt: new Date()
});
```

---

## 📊 Aggregation Queries

**Powerful MongoDB queries for analytics and reporting**

### 🏆 Ambassador Performance Report
```javascript
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

// Usage: db.ambassadors.aggregate(ambassadorPerformance);
```

### 🥇 Top Donors (Public Display)
```javascript
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

// Usage: db.partners.aggregate(topDonors);
```

### 📈 Monthly Donation Summary
```javascript
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

// Usage: db.donations.aggregate(monthlyDonations);
```

---

## ✅ Setup Complete

**Your MongoDB donation system is ready!**

**Collections Created:** `ambassadors`, `partners`, `donations`  
**Indexes Applied:** Performance optimized for common queries  
**Sample Data:** Ready for testing  
**Analytics:** Aggregation pipelines included for reporting

> 🎯 **Next Steps**: Connect your application using MongoDB driver and start tracking donations for the Yaakov Memorial Center!