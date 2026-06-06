/**
 * Run this script once to insert a test user into MongoDB.
 * Usage: node --import tsx scripts/createTestUser.ts
 */
import mongoose from 'mongoose';
import { config } from '../config/environment.js';
import { UserModel } from '../models/user/user.model.js';

async function createTestUser() {
  await mongoose.connect(config.MONGO_URI);
  console.log('Connected to MongoDB');

  // Remove any existing test user so the script is safely re-runnable
  await UserModel.deleteOne({ email: 'admin@test.com' });

  // Password will be auto-hashed by the pre-save hook in user.model.ts
  const user = await UserModel.create({
    firstName: 'Test',
    lastName: 'Admin',
    email: 'admin@test.com',
    password: 'password123',   // plain text — hook will bcrypt this
    role: 'admin',
    isActive: true,
    isDeleted: false,
  });

  console.log('✅ Test user created:');
  console.log(`   Email    : ${user.email}`);
  console.log(`   Password : password123`);
  console.log(`   Role     : ${user.role}`);
  console.log(`   ID       : ${user._id}`);

  await mongoose.disconnect();
  console.log('Done.');
}

createTestUser().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
