const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting campaigns seeding...');

  try {
    // Insert campaigns (do not clear existing data)
    console.log('🎯 Inserting campaigns...');
    const campaigns = await Promise.all([
      prisma.campaigns.create({
        data: {
          title: 'Clean Water for All',
          slug: 'clean-water-for-all',
          description: 'Providing access to clean and safe drinking water in rural communities.',
          goal_amount: 20000.00,
          current_amount: 0.00,
          start_date: new Date('2024-07-01'),
          end_date: new Date('2024-12-31'),
          is_active: true,
          is_featured: true,
          category: 'Water',
          progress_bar_color: '#3498db',
          image_url: 'https://images.pexels.com/photos/6301075/pexels-photo-6301075.jpeg?auto=compress&cs=tinysrgb&w=600',
          donor_count: 0,
          created_by: 5,
          language: 'en'
        }
      }),
      prisma.campaigns.create({
        data: {
          title: 'Back to School Supplies',
          slug: 'back-to-school-supplies',
          description: 'Supplying essential school materials to children in need.',
          goal_amount: 10000.00,
          current_amount: 0.00,
          start_date: new Date('2024-08-01'),
          end_date: new Date('2024-09-30'),
          is_active: true,
          is_featured: false,
          category: 'Education',
          progress_bar_color: '#e67e22',
          image_url: 'https://images.pexels.com/photos/6301075/pexels-photo-6301075.jpeg?auto=compress&cs=tinysrgb&w=600',
          donor_count: 0,
          created_by: 5,
          language: 'en'
        }
      }),
      prisma.campaigns.create({
        data: {
          title: 'Healthcare for Mothers',
          slug: 'healthcare-for-mothers',
          description: 'Supporting maternal health and safe childbirth.',
          goal_amount: 30000.00,
          current_amount: 0.00,
          start_date: new Date('2024-07-15'),
          end_date: new Date('2024-11-30'),
          is_active: true,
          is_featured: true,
          category: 'Healthcare',
          progress_bar_color: '#e74c3c',
          image_url: 'https://images.pexels.com/photos/6301075/pexels-photo-6301075.jpeg?auto=compress&cs=tinysrgb&w=600',
          donor_count: 0,
          created_by: 5,
          language: 'en'
        }
      }),
      prisma.campaigns.create({
        data: {
          title: 'Youth Empowerment',
          slug: 'youth-empowerment',
          description: 'Empowering youth through skills training and mentorship.',
          goal_amount: 15000.00,
          current_amount: 0.00,
          start_date: new Date('2024-09-01'),
          end_date: new Date('2024-12-01'),
          is_active: true,
          is_featured: false,
          category: 'Youth',
          progress_bar_color: '#2ecc71',
          image_url: 'https://images.pexels.com/photos/6301075/pexels-photo-6301075.jpeg?auto=compress&cs=tinysrgb&w=600',
          donor_count: 0,
          created_by: 5,
          language: 'en'
        }
      }),
      prisma.campaigns.create({
        data: {
          title: 'Feed the Hungry',
          slug: 'feed-the-hungry',
          description: 'Providing food aid to families facing hunger.',
          goal_amount: 25000.00,
          current_amount: 0.00,
          start_date: new Date('2024-07-10'),
          end_date: new Date('2024-10-31'),
          is_active: true,
          is_featured: false,
          category: 'Food',
          progress_bar_color: '#f1c40f',
          image_url: 'https://images.pexels.com/photos/6301075/pexels-photo-6301075.jpeg?auto=compress&cs=tinysrgb&w=600',
          donor_count: 0,
          created_by: 5,
          language: 'en'
        }
      }),
      prisma.campaigns.create({
        data: {
          title: 'Disaster Relief Fund',
          slug: 'disaster-relief-fund',
          description: 'Supporting communities affected by natural disasters.',
          goal_amount: 40000.00,
          current_amount: 0.00,
          start_date: new Date('2024-06-15'),
          end_date: new Date('2024-12-31'),
          is_active: true,
          is_featured: false,
          category: 'Relief',
          progress_bar_color: '#9b59b6',
          image_url: 'https://images.pexels.com/photos/6301075/pexels-photo-6301075.jpeg?auto=compress&cs=tinysrgb&w=600',
          donor_count: 0,
          created_by: 5,
          language: 'en'
        }
      }),
      prisma.campaigns.create({
        data: {
          title: 'Women in Tech',
          slug: 'women-in-tech',
          description: 'Promoting technology education for women and girls.',
          goal_amount: 18000.00,
          current_amount: 0.00,
          start_date: new Date('2024-08-15'),
          end_date: new Date('2024-11-15'),
          is_active: true,
          is_featured: false,
          category: 'Technology',
          progress_bar_color: '#16a085',
          image_url: 'https://images.pexels.com/photos/6301075/pexels-photo-6301075.jpeg?auto=compress&cs=tinysrgb&w=600',
          donor_count: 0,
          created_by: 5,
          language: 'en'
        }
      }),
      prisma.campaigns.create({
        data: {
          title: 'Tree Planting Initiative',
          slug: 'tree-planting-initiative',
          description: 'Planting trees to combat deforestation and climate change.',
          goal_amount: 12000.00,
          current_amount: 0.00,
          start_date: new Date('2024-07-20'),
          end_date: new Date('2024-10-20'),
          is_active: true,
          is_featured: true,
          category: 'Environment',
          progress_bar_color: '#27ae60',
          image_url: 'https://images.pexels.com/photos/6301075/pexels-photo-6301075.jpeg?auto=compress&cs=tinysrgb&w=600',
          donor_count: 0,
          created_by: 5,
          language: 'en'
        }
      }),
      prisma.campaigns.create({
        data: {
          title: 'Support for Orphans',
          slug: 'support-for-orphans',
          description: 'Providing shelter, education, and care for orphans.',
          goal_amount: 22000.00,
          current_amount: 0.00,
          start_date: new Date('2024-09-10'),
          end_date: new Date('2024-12-31'),
          is_active: true,
          is_featured: false,
          category: 'Children',
          progress_bar_color: '#2980b9',
          image_url: 'https://images.pexels.com/photos/6301075/pexels-photo-6301075.jpeg?auto=compress&cs=tinysrgb&w=600',
          donor_count: 0,
          created_by: 5,
          language: 'en'
        }
      }),
      prisma.campaigns.create({
        data: {
          title: 'Accessible Education for All',
          slug: 'accessible-education-for-all',
          description: 'Making education accessible to children with disabilities.',
          goal_amount: 16000.00,
          current_amount: 0.00,
          start_date: new Date('2024-08-20'),
          end_date: new Date('2024-12-20'),
          is_active: true,
          is_featured: false,
          category: 'Education',
          progress_bar_color: '#8e44ad',
          image_url: 'https://images.pexels.com/photos/6301075/pexels-photo-6301075.jpeg?auto=compress&cs=tinysrgb&w=600',
          donor_count: 0,
          created_by: 5,
          language: 'en'
        }
      })
    ]);

    console.log(`✅ Inserted ${campaigns.length} campaigns`);

    // Add 50 more campaigns
    const moreCampaigns = [];
    const categories = [
      'Healthcare', 'Education', 'Environment', 'Food', 'Water', 'Youth', 'Children', 'Technology', 'Relief', 'Community'
    ];
    const colors = [
      '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#f39c12',
      '#d35400', '#c0392b', '#7f8c8d', '#e67e22', '#e74c3c', '#f1c40f', '#95a5a6', '#bdc3c7', '#ff5733', '#6c3483'
    ];
    for (let i = 1; i <= 50; i++) {
      const idx = i % categories.length;
      moreCampaigns.push(
        prisma.campaigns.create({
          data: {
            title: `Campaign Example ${i}`,
            slug: `campaign-example-${i}`,
            description: `This is a sample description for campaign number ${i}. Supporting the cause of ${categories[idx]}.`,
            goal_amount: 10000 + i * 100,
            current_amount: 0.00,
            start_date: new Date(`2024-09-${(i % 28) + 1}`),
            end_date: new Date(`2024-12-${(i % 28) + 1}`),
            is_active: true,
            is_featured: false,
            category: categories[idx],
            progress_bar_color: colors[idx],
            image_url: 'https://images.pexels.com/photos/6301075/pexels-photo-6301075.jpeg?auto=compress&cs=tinysrgb&w=600',
            donor_count: 0,
            created_by: 5,
            language: 'en'
          }
        })
      );
    }
    // Mark every 10th campaign as featured (in addition to the original 3)
    for (let i = 9; i < 50; i += 10) {
      moreCampaigns[i] = prisma.campaigns.create({
        data: {
          title: `Campaign Example ${i + 1}`,
          slug: `campaign-example-${i + 1}`,
          description: `This is a sample description for campaign number ${i + 1}. Supporting the cause of ${categories[(i + 1) % categories.length]}.`,
          goal_amount: 10000 + (i + 1) * 100,
          current_amount: 0.00,
          start_date: new Date(`2024-09-${((i + 1) % 28) + 1}`),
          end_date: new Date(`2024-12-${((i + 1) % 28) + 1}`),
          is_active: true,
          is_featured: true,
          category: categories[(i + 1) % categories.length],
          progress_bar_color: colors[(i + 1) % colors.length],
          image_url: 'https://images.pexels.com/photos/6301075/pexels-photo-6301075.jpeg?auto=compress&cs=tinysrgb&w=600',
          donor_count: 0,
          created_by: 5,
          language: 'en'
        }
      });
    }
    const moreResults = await Promise.all(moreCampaigns);
    console.log(`✅ Inserted ${moreResults.length} additional campaigns`);
  } catch (error) {
    console.error('❌ Error during campaigns seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(async () => {
    console.log('✅ Campaigns seeding completed');
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('❌ Campaigns seeding failed:', e);
    process.exit(1);
  }); 