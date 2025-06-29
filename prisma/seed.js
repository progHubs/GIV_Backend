const { PrismaClient } = require('../src/generated/prisma');
const { hashPassword } = require('../src/utils/password.util');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await prisma.volunteer_skills.deleteMany();
    await prisma.event_participants.deleteMany();
    await prisma.posts.deleteMany();
    await prisma.events.deleteMany();
    await prisma.skills.deleteMany();
    await prisma.volunteer_profiles.deleteMany();
    await prisma.donor_profiles.deleteMany();
    await prisma.users.deleteMany();

    console.log('✅ Existing data cleared');

    // Create users
    console.log('👥 Creating users...');
    const users = await Promise.all([
      prisma.users.create({
        data: {
          full_name: 'Admin User',
          email: 'admin@givsociety.org',
          phone: '+251911234567',
          password_hash: await hashPassword('Admin123!'),
          role: 'admin',
          profile_image_url: 'https://example.com/admin.jpg',
          language_preference: 'en',
          email_verified: true
        }
      }),
      prisma.users.create({
        data: {
          full_name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+251922345678',
          password_hash: await hashPassword('Volunteer123!'),
          role: 'volunteer',
          profile_image_url: 'https://example.com/john.jpg',
          language_preference: 'en',
          email_verified: true
        }
      }),
      prisma.users.create({
        data: {
          full_name: 'Sarah Smith',
          email: 'sarah.smith@example.com',
          phone: '+251933456789',
          password_hash: await hashPassword('Donor123!'),
          role: 'donor',
          profile_image_url: 'https://example.com/sarah.jpg',
          language_preference: 'en',
          email_verified: true
        }
      }),
      prisma.users.create({
        data: {
          full_name: 'Editor User',
          email: 'editor@givsociety.org',
          phone: '+251944567890',
          password_hash: await hashPassword('Editor123!'),
          role: 'editor',
          profile_image_url: 'https://example.com/editor.jpg',
          language_preference: 'en',
          email_verified: true
        }
      }),
      prisma.users.create({
        data: {
          full_name: 'ተደማሪ አበበ',
          email: 'tadesse.abebe@example.com',
          phone: '+251955678901',
          password_hash: await hashPassword('Amharic123!'),
          role: 'volunteer',
          profile_image_url: 'https://example.com/tadesse.jpg',
          language_preference: 'am',
          email_verified: true
        }
      })
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create skills
    console.log('🛠️ Creating skills...');
    const skills = await Promise.all([
      prisma.skills.create({
        data: {
          name: 'Medical Care',
          category: 'Healthcare',
          description: 'Basic medical care and first aid skills'
        }
      }),
      prisma.skills.create({
        data: {
          name: 'Teaching',
          category: 'Education',
          description: 'Teaching and educational support skills'
        }
      }),
      prisma.skills.create({
        data: {
          name: 'Event Planning',
          category: 'Management',
          description: 'Event planning and coordination skills'
        }
      }),
      prisma.skills.create({
        data: {
          name: 'Translation',
          category: 'Language',
          description: 'Amharic-English translation skills'
        }
      }),
      prisma.skills.create({
        data: {
          name: 'Photography',
          category: 'Media',
          description: 'Photography and documentation skills'
        }
      }),
      prisma.skills.create({
        data: {
          name: 'Fundraising',
          category: 'Finance',
          description: 'Fundraising and donor relations skills'
        }
      }),
      prisma.skills.create({
        data: {
          name: 'Counseling',
          category: 'Mental Health',
          description: 'Mental health counseling and support skills'
        }
      }),
      prisma.skills.create({
        data: {
          name: 'Youth Mentoring',
          category: 'Youth Development',
          description: 'Youth mentoring and guidance skills'
        }
      })
    ]);

    console.log(`✅ Created ${skills.length} skills`);

    // Create events
    console.log('📅 Creating events...');
    const events = await Promise.all([
      prisma.events.create({
        data: {
          title: 'Medical Outreach Program',
          slug: 'medical-outreach-2024',
          description: 'Free medical checkup and consultation for underserved communities',
          event_date: new Date('2024-07-15'),
          event_time: new Date('2024-07-15T09:00:00'),
          timezone: 'Africa/Addis_Ababa',
          location: 'Addis Ababa Community Center',
          latitude: 9.0320,
          longitude: 38.7636,
          category: 'Healthcare',
          capacity: 100,
          registered_count: 0,
          status: 'upcoming',
          registration_deadline: new Date('2024-07-10'),
          registration_link: 'https://forms.example.com/medical-outreach',
          agenda: '9:00 AM - Registration\n10:00 AM - Medical Checkups\n2:00 PM - Health Education\n4:00 PM - Closing',
          speaker_info: JSON.stringify([
            { name: 'Dr. Alemayehu Bekele', specialty: 'General Medicine' },
            { name: 'Dr. Bethlehem Tadesse', specialty: 'Pediatrics' }
          ]),
          requirements: 'Volunteers should have basic medical training or be willing to assist with registration and logistics',
          ticket_price: 0.00,
          is_featured: true,
          created_by: users[0].id, // Admin user
          language: 'en'
        }
      }),
      prisma.events.create({
        data: {
          title: 'Youth Leadership Workshop',
          slug: 'youth-leadership-workshop-2024',
          description: 'Empowering young leaders with essential leadership and communication skills',
          event_date: new Date('2024-08-20'),
          event_time: new Date('2024-08-20T14:00:00'),
          timezone: 'Africa/Addis_Ababa',
          location: 'Youth Center, Addis Ababa',
          latitude: 9.0320,
          longitude: 38.7636,
          category: 'Youth Development',
          capacity: 50,
          registered_count: 0,
          status: 'upcoming',
          registration_deadline: new Date('2024-08-15'),
          registration_link: 'https://forms.example.com/youth-leadership',
          agenda: '2:00 PM - Welcome and Introduction\n3:00 PM - Leadership Skills Session\n4:30 PM - Group Activities\n6:00 PM - Networking',
          speaker_info: JSON.stringify([
            { name: 'Ato Yohannes Haile', expertise: 'Leadership Development' },
            { name: 'W/ro Kidist Mamo', expertise: 'Youth Empowerment' }
          ]),
          requirements: 'Open to youth aged 18-25. No prior experience required.',
          ticket_price: 0.00,
          is_featured: false,
          created_by: users[3].id, // Editor user
          language: 'en'
        }
      }),
      prisma.events.create({
        data: {
          title: 'Mental Health Awareness Seminar',
          slug: 'mental-health-awareness-2024',
          description: 'Raising awareness about mental health and providing support resources',
          event_date: new Date('2024-09-10'),
          event_time: new Date('2024-09-10T10:00:00'),
          timezone: 'Africa/Addis_Ababa',
          location: 'Mental Health Center, Addis Ababa',
          latitude: 9.0320,
          longitude: 38.7636,
          category: 'Mental Health',
          capacity: 75,
          registered_count: 0,
          status: 'upcoming',
          registration_deadline: new Date('2024-09-05'),
          registration_link: 'https://forms.example.com/mental-health',
          agenda: '10:00 AM - Introduction to Mental Health\n11:30 AM - Common Mental Health Issues\n1:00 PM - Lunch Break\n2:00 PM - Support Resources\n3:30 PM - Q&A Session',
          speaker_info: JSON.stringify([
            { name: 'Dr. Selamawit Gebre', specialty: 'Psychiatry' },
            { name: 'Ato Dawit Mengistu', specialty: 'Clinical Psychology' }
          ]),
          requirements: 'Open to all. Mental health professionals and community members welcome.',
          ticket_price: 0.00,
          is_featured: true,
          created_by: users[1].id, // John Doe (volunteer)
          language: 'en'
        }
      }),
      prisma.events.create({
        data: {
          title: 'የጤና አገልግሎት ፕሮግራም',
          slug: 'health-service-program-amharic',
          description: 'የጤና አገልግሎት እና የመጀመሪያ ደረጃ ድጋፍ ለማህበረሰቡ',
          event_date: new Date('2024-07-25'),
          event_time: new Date('2024-07-25T08:00:00'),
          timezone: 'Africa/Addis_Ababa',
          location: 'የማህበረሰብ ማዕከል, አዲስ አበባ',
          latitude: 9.0320,
          longitude: 38.7636,
          category: 'Healthcare',
          capacity: 80,
          registered_count: 0,
          status: 'upcoming',
          registration_deadline: new Date('2024-07-20'),
          registration_link: 'https://forms.example.com/health-amharic',
          agenda: '8:00 ጥዋት - ምዝገባ\n9:00 ጥዋት - የጤና ምርመራ\n12:00 ቀን - የጤና ትምህርት\n2:00 ቀን - መደምደሚያ',
          speaker_info: JSON.stringify([
            { name: 'ዶ/ር አለማየሁ በቀለ', specialty: 'አጠቃላይ ሐኪም' },
            { name: 'ዶ/ር ቤተልሄም ታደሰ', specialty: 'የህፃናት ሐኪም' }
          ]),
          requirements: 'የጤና ሰጪዎች መሰረታዊ የጤና ስልጠና ሊኖራቸው ይገባል',
          ticket_price: 0.00,
          is_featured: false,
          created_by: users[4].id, // Tadesse Abebe (Amharic user)
          language: 'am'
        }
      })
    ]);

    console.log(`✅ Created ${events.length} events`);

    // Create posts
    console.log('📝 Creating posts...');
    const posts = await Promise.all([
      prisma.posts.create({
        data: {
          title: 'GIV Society Launches New Medical Outreach Program',
          slug: 'giv-society-medical-outreach-launch',
          content: `GIV Society is excited to announce the launch of our comprehensive medical outreach program aimed at serving underserved communities in Ethiopia.

Our new initiative will provide:
- Free medical checkups
- Health education workshops
- Access to basic medications
- Referrals to specialized care

The program will begin in July 2024 and will initially focus on communities in Addis Ababa, with plans to expand to other regions.

"We believe that access to quality healthcare is a fundamental human right," says Dr. Alemayehu Bekele, our medical director. "This program represents our commitment to making healthcare accessible to all Ethiopians."

To volunteer or support this program, please contact us at volunteer@givsociety.org or make a donation through our website.`,
          post_type: 'news',
          author_id: users[0].id, // Admin user
          feature_image: 'https://example.com/medical-outreach.jpg',
          language: 'en'
        }
      }),
      prisma.posts.create({
        data: {
          title: 'The Impact of Mental Health Support in Our Community',
          slug: 'mental-health-support-impact',
          content: `Mental health is a critical component of overall well-being, yet it remains one of the most overlooked aspects of healthcare in many communities.

At GIV Society, we've seen firsthand the transformative impact that mental health support can have on individuals and families. Our recent mental health awareness programs have reached over 500 people, providing them with:

- Information about common mental health conditions
- Coping strategies and self-care techniques
- Access to professional counseling services
- Support group connections

The stigma surrounding mental health is slowly being reduced as more people become aware of the importance of mental well-being. Our volunteers have reported significant improvements in the communities they serve.

"Mental health support isn't just about treating conditions," explains our mental health coordinator, Dr. Selamawit Gebre. "It's about creating a supportive environment where people feel safe to seek help and support each other."

We encourage everyone to participate in our upcoming mental health awareness seminar on September 10th, 2024.`,
          post_type: 'blog',
          author_id: users[1].id, // John Doe (volunteer)
          feature_image: 'https://example.com/mental-health.jpg',
          language: 'en'
        }
      }),
      prisma.posts.create({
        data: {
          title: 'Youth Empowerment: Building Tomorrow\'s Leaders',
          slug: 'youth-empowerment-leadership',
          content: `Investing in youth is investing in the future. Our youth development programs focus on empowering young people with the skills, confidence, and opportunities they need to become effective leaders.

Through our various initiatives, we've helped hundreds of young people develop:

- Leadership and communication skills
- Critical thinking and problem-solving abilities
- Community engagement and social responsibility
- Professional development and career guidance

Our youth leadership workshop, scheduled for August 20th, 2024, will bring together young leaders from across Ethiopia to share experiences and learn from each other.

"The energy and enthusiasm of our young participants is truly inspiring," says Ato Yohannes Haile, our youth programs coordinator. "They are not just the leaders of tomorrow; they are making a difference today."

We believe that every young person has the potential to be a leader. Our programs provide the platform and support they need to realize that potential.`,
          post_type: 'blog',
          author_id: users[3].id, // Editor user
          feature_image: 'https://example.com/youth-leadership.jpg',
          language: 'en'
        }
      }),
      prisma.posts.create({
        data: {
          title: 'የጤና አገልግሎት ፕሮግራም መጀመሪያ',
          slug: 'health-service-program-amharic-post',
          content: `GIV Society አዲስ የጤና አገልግሎት ፕሮግራም እንደጀመረ ለማህበረሰቡ ማስታወቂያ እንደሰጠ እናውቃለን።

ይህ ፕሮግራም የሚከተሉትን ያካትታል:
- ነፃ የጤና ምርመራ
- የጤና ትምህርት ስልጠናዎች
- መሰረታዊ መድሃኒቶች ማግኘት
- ለስፔሻሊስት እርዳታ ማጣቀሻ

ፕሮግራሙ በጁላይ 2024 ይጀምራል እና መጀመሪያ ላይ በአዲስ አበባ ማህበረሰቦች ላይ ያተኩራል።

"የጥራት ያለው የጤና አገልግሎት መድረስ መሰረታዊ የሰው ሰው መብት ነው ብለን እናምናለን" የሚለው ዶ/ር አለማየሁ በቀለ፣ የእኛ የጤና ዳይሬክተር።

ይህን ፕሮግራም ለመደገፍ ወይም ለመስራት እባክዎ እኛን ያግኙ።`,
          post_type: 'news',
          author_id: users[4].id, // Tadesse Abebe (Amharic user)
          feature_image: 'https://example.com/health-amharic.jpg',
          language: 'am'
        }
      })
    ]);

    console.log(`✅ Created ${posts.length} posts`);

    // Create volunteer profiles for volunteer users
    console.log('👨‍⚕️ Creating volunteer profiles...');
    const volunteerProfiles = await Promise.all([
      prisma.volunteer_profiles.create({
        data: {
          user_id: users[1].id, // John Doe
          area_of_expertise: 'Healthcare',
          location: 'Addis Ababa',
          availability: JSON.stringify({
            weekdays: ['Monday', 'Wednesday', 'Friday'],
            weekends: ['Saturday'],
            hours: '9:00 AM - 5:00 PM'
          }),
          motivation: 'I want to help improve healthcare access for underserved communities in Ethiopia.',
          total_hours: 120,
          certificate_url: 'https://example.com/certificates/john-doe.pdf',
          registered_events_count: 5,
          training_completed: true,
          background_check_status: 'approved',
          emergency_contact_name: 'Jane Doe',
          emergency_contact_phone: '+251911234568',
          rating: 4.8
        }
      }),
      prisma.volunteer_profiles.create({
        data: {
          user_id: users[4].id, // Tadesse Abebe
          area_of_expertise: 'Translation',
          location: 'Addis Ababa',
          availability: JSON.stringify({
            weekdays: ['Tuesday', 'Thursday'],
            weekends: ['Sunday'],
            hours: '10:00 AM - 6:00 PM'
          }),
          motivation: 'I want to help bridge the language gap and make services accessible to Amharic speakers.',
          total_hours: 80,
          certificate_url: 'https://example.com/certificates/tadesse-abebe.pdf',
          registered_events_count: 3,
          training_completed: true,
          background_check_status: 'approved',
          emergency_contact_name: 'ሰናይት አበበ',
          emergency_contact_phone: '+251922345679',
          rating: 4.9
        }
      })
    ]);

    console.log(`✅ Created ${volunteerProfiles.length} volunteer profiles`);

    // Create donor profiles for donor users
    console.log('💰 Creating donor profiles...');
    const donorProfiles = await Promise.all([
      prisma.donor_profiles.create({
        data: {
          user_id: users[2].id, // Sarah Smith
          is_recurring_donor: true,
          preferred_payment_method: 'Credit Card',
          total_donated: 2500.00,
          donation_frequency: 'monthly',
          tax_receipt_email: 'sarah.smith@example.com',
          is_anonymous: false,
          last_donation_date: new Date('2024-06-15'),
          donation_tier: 'gold'
        }
      })
    ]);

    console.log(`✅ Created ${donorProfiles.length} donor profiles`);

    // Create volunteer skills relationships
    console.log('🔗 Creating volunteer skills...');
    const volunteerSkills = await Promise.all([
      prisma.volunteer_skills.create({
        data: {
          volunteer_id: users[1].id, // John Doe
          skill_id: skills[0].id, // Medical Care
          proficiency_level: 'expert',
          is_verified: true
        }
      }),
      prisma.volunteer_skills.create({
        data: {
          volunteer_id: users[1].id, // John Doe
          skill_id: skills[2].id, // Event Planning
          proficiency_level: 'intermediate',
          is_verified: true
        }
      }),
      prisma.volunteer_skills.create({
        data: {
          volunteer_id: users[4].id, // Tadesse Abebe
          skill_id: skills[3].id, // Translation
          proficiency_level: 'expert',
          is_verified: true
        }
      }),
      prisma.volunteer_skills.create({
        data: {
          volunteer_id: users[4].id, // Tadesse Abebe
          skill_id: skills[1].id, // Teaching
          proficiency_level: 'intermediate',
          is_verified: true
        }
      })
    ]);

    console.log(`✅ Created ${volunteerSkills.length} volunteer skills`);

    // Create event participants
    console.log('📋 Creating event participants...');
    const eventParticipants = await Promise.all([
      prisma.event_participants.create({
        data: {
          event_id: events[0].id, // Medical Outreach Program
          user_id: users[1].id, // John Doe
          role: 'volunteer',
          status: 'confirmed'
        }
      }),
      prisma.event_participants.create({
        data: {
          event_id: events[0].id, // Medical Outreach Program
          user_id: users[4].id, // Tadesse Abebe
          role: 'volunteer',
          status: 'confirmed'
        }
      }),
      prisma.event_participants.create({
        data: {
          event_id: events[1].id, // Youth Leadership Workshop
          user_id: users[1].id, // John Doe
          role: 'attendee',
          status: 'registered'
        }
      }),
      prisma.event_participants.create({
        data: {
          event_id: events[2].id, // Mental Health Awareness Seminar
          user_id: users[2].id, // Sarah Smith
          role: 'attendee',
          status: 'registered'
        }
      })
    ]);

    console.log(`✅ Created ${eventParticipants.length} event participants`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${users.length} users created`);
    console.log(`- ${skills.length} skills created`);
    console.log(`- ${events.length} events created`);
    console.log(`- ${posts.length} posts created`);
    console.log(`- ${volunteerProfiles.length} volunteer profiles created`);
    console.log(`- ${donorProfiles.length} donor profiles created`);
    console.log(`- ${volunteerSkills.length} volunteer skills created`);
    console.log(`- ${eventParticipants.length} event participants created`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(async () => {
    console.log('✅ Seeding completed');
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  });
