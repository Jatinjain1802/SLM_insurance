const bcrypt = require('bcryptjs')
const { sequelize, User, InsuranceCompany, Customer, Policy, Premium } = require('./models')

const seedDatabase = async () => {
  try {
    console.log('Connecting to database and dropping existing tables (sync({force: true}))...')
    await sequelize.sync({ force: true }) // Drop & re-create tables

    console.log('Inserting initial data...')

    // 1. Create Admin User
    const hashedPassword = await bcrypt.hash('password123', 10)
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@slm.com',
      password: hashedPassword,
      role: 'owner'
    })

    // 2. Create Insurance Companies
    const companies = await InsuranceCompany.bulkCreate([
      { name: 'LIC', code: 'LIC', type: 'Life', contactDetails: 'contact@lic.com | 18001234567' },
      { name: 'HDFC Life', code: 'HDFC', type: 'Health', contactDetails: 'info@hdfclife.com | 18002345678' },
      { name: 'Bajaj Allianz', code: 'BAJAJ', type: 'General', contactDetails: 'support@bajaj.com | 18003456789' },
    ])

    // 3. Create Customers
    const customers = await Customer.bulkCreate([
      { name: 'Rahul Sharma', mobile: '9876543210', email: 'rahul@email.com', address: 'Mumbai', dob: '1985-03-15', agentId: admin.id },
      { name: 'Priya Patel', mobile: '9123456780', email: 'priya@email.com', address: 'Pune', dob: '1990-07-22', agentId: admin.id },
      { name: 'Amit Verma', mobile: '9988776655', email: 'amit@email.com', address: 'Delhi', dob: '1978-11-05', agentId: admin.id },
    ])

    // 4. Create Policies
    const today = new Date()
    
    // Policy 1: Active, Expires next month
    const expiry1 = new Date()
    expiry1.setDate(today.getDate() + 20) // Expires in 20 days
    const policy1 = await Policy.create({
      policyNumber: 'LIC-2024-001',
      customerId: customers[0].id,
      companyId: companies[0].id,
      agentId: admin.id,
      policyType: 'Life',
      premiumAmount: 5000,
      frequency: 'yearly',
      startDate: new Date('2024-01-01'),
      expiryDate: expiry1,
      status: 'active'
    })

    // Policy 2: Expired
    const policy2 = await Policy.create({
      policyNumber: 'HDR-2025-042',
      customerId: customers[1].id,
      companyId: companies[1].id,
      agentId: admin.id,
      policyType: 'Health',
      premiumAmount: 3500,
      frequency: 'monthly',
      startDate: new Date('2023-01-01'),
      expiryDate: new Date('2024-01-01'),
      status: 'expired'
    })

    // Policy 3: Active
    const policy3 = await Policy.create({
      policyNumber: 'BAJ-2023-118',
      customerId: customers[2].id,
      companyId: companies[2].id,
      agentId: admin.id,
      policyType: 'Vehicle',
      premiumAmount: 2200,
      frequency: 'yearly',
      startDate: new Date('2025-09-01'),
      expiryDate: new Date('2026-09-01'),
      status: 'active'
    })

    // 5. Create Premiums
    await Premium.bulkCreate([
      {
        policyId: policy1.id,
        amount: 5000,
        dueDate: expiry1,
        status: 'upcoming'
      },
      {
        policyId: policy2.id,
        amount: 3500,
        dueDate: new Date('2023-12-01'),
        status: 'overdue' // Past due
      },
      {
        policyId: policy3.id,
        amount: 2200,
        dueDate: new Date('2025-09-01'),
        status: 'paid',
        paidDate: new Date()
      }
    ])

    console.log('Database seeded successfully! 🎉')
    console.log('Login credentials -> Email: admin@slm.com | Password: password123')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
