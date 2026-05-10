import mongoose from 'mongoose';

// 1. Manually set your MongoDB URI here
const MONGODB_URI="mongodb+srv://admin:admin123@safetysaas-demo.k0ighdu.mongodb.net/safety_db?retryWrites=true&w=majority"

// 2. Define the Schemas directly in this script to avoid import errors
const CompanySchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true }
});

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: { type: String },
  role: { type: String },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
});

const Company = mongoose.models.Company || mongoose.model('Company', CompanySchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB...");

    // Create Company
    const company = await Company.findOneAndUpdate(
      { slug: 'mueller' },
      { name: 'Mueller Middle East', slug: 'mueller' },
      { upsert: true, new: true }
    );
    console.log("Company ready.");

    // Create Admin
    const admin = await User.findOneAndUpdate(
      { username: 'admin123' },
      { 
        username: 'admin123', 
        password: 'Password@123', 
        role: 'Admin', 
        companyId: company._id 
      },
      { upsert: true, new: true }
    );

    console.log("--------------------------------------");
    console.log("SUCCESS: Admin account is ready!");
    console.log("Username: admin123");
    console.log("Password: Password@123");
    console.log("--------------------------------------");

    process.exit(0);
  } catch (err) {
    console.error("ERROR:", err);
    process.exit(1);
  }
}

run();