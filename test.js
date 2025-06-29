const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedUsers() {
  try {
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        fullName: "Haylemesk",
        email: "haylemesk@gmail.com",
        phone: "+1234567890",
        passwordHash:
          "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu9.m", // "admin123"
        role: "admin",
        profileImageUrl: "https://example.com/admin.jpg",
        languagePreference: "en",
        emailVerified: true,
      },
    });

    // Create volunteer user with volunteer profile
    const volunteer = await prisma.user.create({
      data: {
        fullName: "John Volunteer",
        email: "volunteer@example.com",
        phone: "+1234567891",
        passwordHash:
          "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu9.m", // "volunteer123"
        role: "volunteer",
        profileImageUrl: "https://example.com/volunteer.jpg",
        languagePreference: "en",
        emailVerified: true,
        volunteerProfile: {
          create: {
            areaOfExpertise: "Healthcare",
            location: "New York",
            availability: {
              weekdays: true,
              weekends: false,
            },
            motivation: "I want to help people in need",
            backgroundCheckStatus: "approved",
            emergencyContactName: "Jane Doe",
            emergencyContactPhone: "+1234567892",
          },
        },
      },
    });

    // Create donor user with donor profile
    const donor = await prisma.user.create({
      data: {
        fullName: "Sarah Donor",
        email: "donor@example.com",
        phone: "+1234567893",
        passwordHash:
          "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu9.m", // "donor123"
        role: "donor",
        profileImageUrl: "https://example.com/donor.jpg",
        languagePreference: "en",
        emailVerified: true,
        donorProfile: {
          create: {
            isRecurringDonor: true,
            preferredPaymentMethod: "credit_card",
            donationFrequency: "monthly",
            taxReceiptEmail: "donor@example.com",
            donationTier: "gold",
          },
        },
      },
    });

    // Create editor user
    const editor = await prisma.user.create({
      data: {
        fullName: "Mike Editor",
        email: "editor@example.com",
        phone: "+1234567894",
        passwordHash:
          "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu9.m", // "editor123"
        role: "editor",
        profileImageUrl: "https://example.com/editor.jpg",
        languagePreference: "en",
        emailVerified: true,
      },
    });

    console.log("Users created successfully:", {
      admin: admin.id,
      volunteer: volunteer.id,
      donor: donor.id,
      editor: editor.id,
    });
  } catch (error) {
    console.error("Error seeding users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedUsers();
