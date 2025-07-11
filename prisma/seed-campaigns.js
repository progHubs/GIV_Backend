const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

// Allowed categories from validator (must match validator exactly)
const categories = [
  'medical_outreach',
  'mental_health',
  'youth_development',
  'disease_prevention',
  'education',
  'emergency_relief',
  'community_development',
  'environmental',
  'other',
];

// Some sample campaign titles
const sampleTitles = [
  'Clean Water for All',
  'Mental Health Awareness Drive',
  'Youth Empowerment Program',
  'Disease Prevention Initiative',
  'Education for Every Child',
  'Emergency Relief Fund',
  'Community Development Project',
  'Environmental Protection Campaign',
  'Medical Outreach Mission',
  'Support for Orphans',
  'Women in Tech',
  'Food for the Hungry',
  'Solar Power for Schools',
  'Tree Planting Marathon',
  'Disaster Response Team',
  'Mobile Health Clinics',
  'Scholarships for Girls',
  'Clean Energy for Villages',
  'Vaccination Awareness',
  'Safe Motherhood Initiative',
  'Literacy for Adults',
  'Sports for Peace',
  'Hygiene Education',
  'Flood Relief',
  'Cancer Screening Camps',
  'Tech for Good',
  'Feeding the Homeless',
  'Green Schools Project',
  'Childhood Nutrition',
  'Water Wells Construction',
  'Disability Inclusion',
  'Refugee Support',
  'Elderly Care',
  'Animal Welfare',
  'Clean Streets Movement',
  'COVID-19 Response',
  'Blood Donation Drive',
  'School Supplies for Kids',
  'Safe Playgrounds',
  'HIV/AIDS Awareness',
  'Malaria Eradication',
  'Youth Leadership Training',
  'Job Skills for Youth',
  'Community Libraries',
  'Waste Management',
  'Renewable Energy Awareness',
  'Safe Drinking Water',
  'Support for Farmers',
  'Disaster Preparedness',
  'Women Health Camps',
  'Child Protection',
];

// Some sample hex colors
const colors = [
  '#3B82F6', '#10B981', '#F59E42', '#EF4444', '#6366F1', '#FBBF24', '#22D3EE', '#A21CAF', '#84CC16', '#F472B6'
];

// Some sample images
const images = [
  'https://images.pexels.com/photos/6301075/pexels-photo-6301075.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1133957/pexels-photo-1133957.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3184419/pexels-photo-3184419.jpeg?auto=compress&cs=tinysrgb&w=600',
];

// Some sample video URLs
const videos = [
  'https://www.youtube.com/watch?v=ysz5S6PUM-U',
  'https://www.youtube.com/watch?v=ScMzIvxBSi4',
  '',
];

// Helper to generate a slug from a title
function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim('-');
}

// Helper to generate a random date in the future (returns full ISO string)
function randomFutureDateTime(daysFromNow = 1, maxDays = 365) {
  const now = new Date();
  const days = daysFromNow + Math.floor(Math.random() * (maxDays - daysFromNow));
  const date = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return date.toISOString(); // full ISO string
}

// Helper to generate a random success story
function randomSuccessStory(i) {
  return {
    title: `Success Story ${i + 1}`,
    description: `This is a description for success story ${i + 1}. The campaign made a significant impact in the community.`,
    image_url: images[Math.floor(Math.random() * images.length)],
    date: randomFutureDateTime(-365, 365), // full ISO string
  };
}

async function main() {
  const campaigns = [];
  const usedSlugs = new Set();
  for (let i = 0; i < 50; i++) {
    // Pick a unique title
    let title = sampleTitles[i % sampleTitles.length] + (i >= sampleTitles.length ? ` ${i + 1}` : '');
    let slug = slugify(title);
    // Ensure slug is unique
    let origSlug = slug;
    let slugCounter = 1;
    while (usedSlugs.has(slug)) {
      slug = `${origSlug}-${slugCounter++}`;
    }
    usedSlugs.add(slug);

    // Random goal and current amount
    const goal_amount = 1000 + Math.floor(Math.random() * 100000);
    const current_amount = Math.floor(Math.random() * goal_amount);

    // Dates (full ISO-8601 DateTime)
    const start_date = randomFutureDateTime(1, 180);
    const end_date = randomFutureDateTime(181, 365);

    // Category (from validator)
    const category = categories[i % categories.length];

    // Colors, images, videos
    const progress_bar_color = colors[i % colors.length];
    const image_url = images[i % images.length];
    const video_url = videos[i % videos.length];

    // Success stories
    const numStories = 1 + Math.floor(Math.random() * 3);
    const success_stories = [];
    for (let j = 0; j < numStories; j++) {
      success_stories.push(randomSuccessStory(j));
    }

    // Language
    const language = i % 5 === 0 ? 'am' : 'en';

    // is_featured and is_active
    const is_featured = i < 6;
    const is_active = i < 2 ? false : true;

    // translation_group_id
    const translation_group_id = uuidv4();

    campaigns.push({
      title,
      slug,
      description: `This is a detailed description for the campaign: ${title}. It aims to make a positive impact in the community through various activities and initiatives.`,
      goal_amount,
      current_amount,
      start_date,
      end_date,
      is_active,
      is_featured,
      category,
      progress_bar_color,
      image_url,
      video_url,
      donor_count: Math.floor(Math.random() * 1000),
      success_stories: JSON.stringify(success_stories),
      created_by: 5,
      language,
      translation_group_id,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    });
  }

  // Insert campaigns one by one to handle unique constraints and JSON fields
  let inserted = 0;
  for (const campaign of campaigns) {
    try {
      await prisma.campaigns.create({ data: campaign });
      inserted++;
    } catch (err) {
      console.error('Failed to insert campaign:', campaign.title, err.message);
    }
  }
  console.log(`Inserted ${inserted} campaigns.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
