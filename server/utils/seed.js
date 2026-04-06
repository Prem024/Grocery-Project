require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Supplier = require('../models/supplierModel');
const Product = require('../models/productModel');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Supplier.deleteMany();
    await Product.deleteMany();

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@grocery.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('✅ Admin user created: admin@grocery.com / admin123');

    // Create categories
    const categories = await Category.insertMany([
      { name: 'Dairy & Eggs', description: 'Milk, cheese, butter, eggs', createdBy: admin._id },
      { name: 'Fruits & Vegetables', description: 'Fresh produce', createdBy: admin._id },
      { name: 'Beverages', description: 'Water, juices, soft drinks', createdBy: admin._id },
      { name: 'Snacks', description: 'Chips, biscuits, crackers', createdBy: admin._id },
      { name: 'Grains & Pulses', description: 'Rice, wheat, lentils', createdBy: admin._id },
      { name: 'Cleaning', description: 'Household cleaning products', createdBy: admin._id },
    ]);
    console.log('✅ Categories seeded');

    // Create suppliers
    const suppliers = await Supplier.insertMany([
      { name: 'FreshFarm Suppliers', contact: 'John Doe', email: 'john@freshfarm.com', phone: '9876543210', address: '123 Farm Lane, City', createdBy: admin._id },
      { name: 'Global Grocers Ltd', contact: 'Jane Smith', email: 'jane@globalgrocers.com', phone: '9123456789', address: '456 Market St, Town', createdBy: admin._id },
      { name: 'Premium Beverages Co', contact: 'Ali Khan', email: 'ali@premiumbev.com', phone: '9000000000', address: '789 Drink Ave, Village', createdBy: admin._id },
    ]);
    console.log('✅ Suppliers seeded');

    // Create products
    await Product.insertMany([
      { name: 'Full Cream Milk (1L)', sku: 'MILK-001', category: categories[0]._id, supplier: suppliers[0]._id, price: 55, quantity: 200, minStock: 50, unit: 'pcs', createdBy: admin._id },
      { name: 'Farm Fresh Eggs (12 pcs)', sku: 'EGG-001', category: categories[0]._id, supplier: suppliers[0]._id, price: 90, quantity: 8, minStock: 20, unit: 'pack', createdBy: admin._id },
      { name: 'Cheddar Cheese (200g)', sku: 'CHE-001', category: categories[0]._id, supplier: suppliers[1]._id, price: 150, quantity: 35, minStock: 20, unit: 'pcs', createdBy: admin._id },
      { name: 'Bananas (1 dozen)', sku: 'BAN-001', category: categories[1]._id, supplier: suppliers[0]._id, price: 40, quantity: 100, minStock: 30, unit: 'dozen', createdBy: admin._id },
      { name: 'Tomatoes (1kg)', sku: 'TOM-001', category: categories[1]._id, supplier: suppliers[0]._id, price: 30, quantity: 5, minStock: 25, unit: 'kg', createdBy: admin._id },
      { name: 'Orange Juice (1L)', sku: 'OJ-001', category: categories[2]._id, supplier: suppliers[2]._id, price: 120, quantity: 60, minStock: 20, unit: 'bottle', createdBy: admin._id },
      { name: 'Mineral Water (500ml)', sku: 'WAT-001', category: categories[2]._id, supplier: suppliers[2]._id, price: 20, quantity: 500, minStock: 100, unit: 'bottle', createdBy: admin._id },
      { name: 'Potato Chips (100g)', sku: 'CHIP-001', category: categories[3]._id, supplier: suppliers[1]._id, price: 35, quantity: 150, minStock: 50, unit: 'pcs', createdBy: admin._id },
      { name: 'Basmati Rice (5kg)', sku: 'RICE-001', category: categories[4]._id, supplier: suppliers[1]._id, price: 350, quantity: 80, minStock: 20, unit: 'bag', createdBy: admin._id },
      { name: 'Red Lentils (1kg)', sku: 'LEN-001', category: categories[4]._id, supplier: suppliers[1]._id, price: 75, quantity: 3, minStock: 15, unit: 'kg', createdBy: admin._id },
      { name: 'Dishwash Liquid (500ml)', sku: 'DISH-001', category: categories[5]._id, supplier: suppliers[1]._id, price: 85, quantity: 70, minStock: 25, unit: 'bottle', createdBy: admin._id },
    ]);
    console.log('✅ Products seeded (including low-stock items)');

    console.log('\n🎉 Database seeded successfully!');
    console.log('👉 Login: admin@grocery.com / admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seed();
