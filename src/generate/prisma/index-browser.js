
/* !!! This is code generated by Prisma. Do not edit directly. !!!
/* eslint-disable */

Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.10.1
 * Query Engine version: 9b628578b3b7cae625e8c927178f15a170e74a9c
 */
Prisma.prismaVersion = {
  client: "6.10.1",
  engine: "9b628578b3b7cae625e8c927178f15a170e74a9c"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.CampaignsScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  description: 'description',
  goal_amount: 'goal_amount',
  current_amount: 'current_amount',
  start_date: 'start_date',
  end_date: 'end_date',
  is_active: 'is_active',
  is_featured: 'is_featured',
  category: 'category',
  progress_bar_color: 'progress_bar_color',
  image_url: 'image_url',
  video_url: 'video_url',
  donor_count: 'donor_count',
  success_stories: 'success_stories',
  created_by: 'created_by',
  language: 'language',
  translation_group_id: 'translation_group_id',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.Contact_messagesScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  subject: 'subject',
  message: 'message',
  reason: 'reason',
  status: 'status',
  ip_address: 'ip_address',
  user_agent: 'user_agent',
  submitted_at: 'submitted_at',
  replied_at: 'replied_at'
};

exports.Prisma.DocumentsScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  category: 'category',
  file_url: 'file_url',
  file_size: 'file_size',
  file_type: 'file_type',
  uploaded_by: 'uploaded_by',
  language: 'language',
  translation_group_id: 'translation_group_id',
  is_public: 'is_public',
  download_count: 'download_count',
  uploaded_at: 'uploaded_at',
  updated_at: 'updated_at'
};

exports.Prisma.DonationsScalarFieldEnum = {
  id: 'id',
  donor_id: 'donor_id',
  campaign_id: 'campaign_id',
  amount: 'amount',
  currency: 'currency',
  donation_type: 'donation_type',
  payment_method: 'payment_method',
  payment_status: 'payment_status',
  transaction_id: 'transaction_id',
  receipt_url: 'receipt_url',
  is_acknowledged: 'is_acknowledged',
  is_tax_deductible: 'is_tax_deductible',
  is_anonymous: 'is_anonymous',
  notes: 'notes',
  donated_at: 'donated_at',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.Donor_profilesScalarFieldEnum = {
  user_id: 'user_id',
  is_recurring_donor: 'is_recurring_donor',
  preferred_payment_method: 'preferred_payment_method',
  total_donated: 'total_donated',
  donation_frequency: 'donation_frequency',
  tax_receipt_email: 'tax_receipt_email',
  is_anonymous: 'is_anonymous',
  last_donation_date: 'last_donation_date',
  donation_tier: 'donation_tier',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.Email_logsScalarFieldEnum = {
  id: 'id',
  recipient: 'recipient',
  subject: 'subject',
  template_used: 'template_used',
  content: 'content',
  status: 'status',
  error_message: 'error_message',
  sent_at: 'sent_at',
  opened_at: 'opened_at',
  clicked_at: 'clicked_at'
};

exports.Prisma.Event_participantsScalarFieldEnum = {
  event_id: 'event_id',
  user_id: 'user_id',
  role: 'role',
  status: 'status',
  hours_contributed: 'hours_contributed',
  feedback: 'feedback',
  rating: 'rating',
  registered_at: 'registered_at',
  attended_at: 'attended_at'
};

exports.Prisma.EventsScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  description: 'description',
  event_date: 'event_date',
  event_time: 'event_time',
  timezone: 'timezone',
  location: 'location',
  latitude: 'latitude',
  longitude: 'longitude',
  category: 'category',
  capacity: 'capacity',
  registered_count: 'registered_count',
  status: 'status',
  registration_deadline: 'registration_deadline',
  registration_link: 'registration_link',
  map_embed_url: 'map_embed_url',
  agenda: 'agenda',
  speaker_info: 'speaker_info',
  requirements: 'requirements',
  ticket_price: 'ticket_price',
  ticket_link: 'ticket_link',
  is_featured: 'is_featured',
  created_by: 'created_by',
  language: 'language',
  translation_group_id: 'translation_group_id',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.FaqsScalarFieldEnum = {
  id: 'id',
  question: 'question',
  answer: 'answer',
  category: 'category',
  language: 'language',
  translation_group_id: 'translation_group_id',
  is_active: 'is_active',
  sort_order: 'sort_order',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.MediaScalarFieldEnum = {
  id: 'id',
  media_type: 'media_type',
  title: 'title',
  description: 'description',
  file_url: 'file_url',
  related_event_id: 'related_event_id',
  related_program_id: 'related_program_id',
  uploaded_by: 'uploaded_by',
  language: 'language',
  translation_group_id: 'translation_group_id',
  uploaded_at: 'uploaded_at'
};

exports.Prisma.Newsletter_subscribersScalarFieldEnum = {
  id: 'id',
  email: 'email',
  first_name: 'first_name',
  last_name: 'last_name',
  is_active: 'is_active',
  language_preference: 'language_preference',
  subscribed_at: 'subscribed_at',
  unsubscribed_at: 'unsubscribed_at'
};

exports.Prisma.PartnersScalarFieldEnum = {
  id: 'id',
  name: 'name',
  logo_url: 'logo_url',
  type: 'type',
  website: 'website',
  contact_email: 'contact_email',
  quote: 'quote',
  language: 'language',
  translation_group_id: 'translation_group_id',
  is_active: 'is_active',
  partnership_start_date: 'partnership_start_date',
  partnership_end_date: 'partnership_end_date',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PostsScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  content: 'content',
  post_type: 'post_type',
  author_id: 'author_id',
  feature_image: 'feature_image',
  language: 'language',
  translation_group_id: 'translation_group_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ProgramsScalarFieldEnum = {
  id: 'id',
  title: 'title',
  category: 'category',
  description: 'description',
  start_date: 'start_date',
  end_date: 'end_date',
  location: 'location',
  impact_stats: 'impact_stats',
  is_featured: 'is_featured',
  created_by: 'created_by',
  language: 'language',
  translation_group_id: 'translation_group_id',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.Role_permissionsScalarFieldEnum = {
  role: 'role',
  permission: 'permission',
  created_at: 'created_at'
};

exports.Prisma.Site_interactionsScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  session_id: 'session_id',
  page: 'page',
  action: 'action',
  metadata: 'metadata',
  ip_address: 'ip_address',
  user_agent: 'user_agent',
  occurred_at: 'occurred_at'
};

exports.Prisma.SkillsScalarFieldEnum = {
  id: 'id',
  name: 'name',
  category: 'category',
  description: 'description',
  created_at: 'created_at'
};

exports.Prisma.TestimonialsScalarFieldEnum = {
  id: 'id',
  name: 'name',
  role: 'role',
  message: 'message',
  image_url: 'image_url',
  type: 'type',
  language: 'language',
  translation_group_id: 'translation_group_id',
  is_featured: 'is_featured',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.UsersScalarFieldEnum = {
  id: 'id',
  full_name: 'full_name',
  email: 'email',
  phone: 'phone',
  password_hash: 'password_hash',
  role: 'role',
  profile_image_url: 'profile_image_url',
  language_preference: 'language_preference',
  email_verified: 'email_verified',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.Volunteer_profilesScalarFieldEnum = {
  user_id: 'user_id',
  area_of_expertise: 'area_of_expertise',
  location: 'location',
  availability: 'availability',
  motivation: 'motivation',
  total_hours: 'total_hours',
  certificate_url: 'certificate_url',
  registered_events_count: 'registered_events_count',
  training_completed: 'training_completed',
  background_check_status: 'background_check_status',
  emergency_contact_name: 'emergency_contact_name',
  emergency_contact_phone: 'emergency_contact_phone',
  rating: 'rating',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.Volunteer_skillsScalarFieldEnum = {
  volunteer_id: 'volunteer_id',
  skill_id: 'skill_id',
  proficiency_level: 'proficiency_level',
  is_verified: 'is_verified',
  created_at: 'created_at'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.campaignsOrderByRelevanceFieldEnum = {
  title: 'title',
  slug: 'slug',
  description: 'description',
  category: 'category',
  progress_bar_color: 'progress_bar_color',
  image_url: 'image_url',
  video_url: 'video_url',
  success_stories: 'success_stories',
  translation_group_id: 'translation_group_id'
};

exports.Prisma.contact_messagesOrderByRelevanceFieldEnum = {
  name: 'name',
  email: 'email',
  subject: 'subject',
  message: 'message',
  ip_address: 'ip_address',
  user_agent: 'user_agent'
};

exports.Prisma.documentsOrderByRelevanceFieldEnum = {
  title: 'title',
  description: 'description',
  category: 'category',
  file_url: 'file_url',
  file_type: 'file_type',
  translation_group_id: 'translation_group_id'
};

exports.Prisma.donationsOrderByRelevanceFieldEnum = {
  currency: 'currency',
  payment_method: 'payment_method',
  transaction_id: 'transaction_id',
  receipt_url: 'receipt_url',
  notes: 'notes'
};

exports.Prisma.donor_profilesOrderByRelevanceFieldEnum = {
  preferred_payment_method: 'preferred_payment_method',
  tax_receipt_email: 'tax_receipt_email'
};

exports.Prisma.email_logsOrderByRelevanceFieldEnum = {
  recipient: 'recipient',
  subject: 'subject',
  template_used: 'template_used',
  content: 'content',
  error_message: 'error_message'
};

exports.Prisma.event_participantsOrderByRelevanceFieldEnum = {
  feedback: 'feedback'
};

exports.Prisma.eventsOrderByRelevanceFieldEnum = {
  title: 'title',
  slug: 'slug',
  description: 'description',
  timezone: 'timezone',
  location: 'location',
  category: 'category',
  registration_link: 'registration_link',
  map_embed_url: 'map_embed_url',
  agenda: 'agenda',
  speaker_info: 'speaker_info',
  requirements: 'requirements',
  ticket_link: 'ticket_link',
  translation_group_id: 'translation_group_id'
};

exports.Prisma.faqsOrderByRelevanceFieldEnum = {
  question: 'question',
  answer: 'answer',
  category: 'category',
  translation_group_id: 'translation_group_id'
};

exports.Prisma.mediaOrderByRelevanceFieldEnum = {
  title: 'title',
  description: 'description',
  file_url: 'file_url',
  translation_group_id: 'translation_group_id'
};

exports.Prisma.newsletter_subscribersOrderByRelevanceFieldEnum = {
  email: 'email',
  first_name: 'first_name',
  last_name: 'last_name'
};

exports.Prisma.partnersOrderByRelevanceFieldEnum = {
  name: 'name',
  logo_url: 'logo_url',
  website: 'website',
  contact_email: 'contact_email',
  quote: 'quote',
  translation_group_id: 'translation_group_id'
};

exports.Prisma.postsOrderByRelevanceFieldEnum = {
  title: 'title',
  slug: 'slug',
  content: 'content',
  feature_image: 'feature_image',
  translation_group_id: 'translation_group_id'
};

exports.Prisma.programsOrderByRelevanceFieldEnum = {
  title: 'title',
  description: 'description',
  location: 'location',
  impact_stats: 'impact_stats',
  translation_group_id: 'translation_group_id'
};

exports.Prisma.role_permissionsOrderByRelevanceFieldEnum = {
  permission: 'permission'
};

exports.Prisma.site_interactionsOrderByRelevanceFieldEnum = {
  session_id: 'session_id',
  page: 'page',
  action: 'action',
  metadata: 'metadata',
  ip_address: 'ip_address',
  user_agent: 'user_agent'
};

exports.Prisma.skillsOrderByRelevanceFieldEnum = {
  name: 'name',
  category: 'category',
  description: 'description'
};

exports.Prisma.testimonialsOrderByRelevanceFieldEnum = {
  name: 'name',
  role: 'role',
  message: 'message',
  image_url: 'image_url',
  translation_group_id: 'translation_group_id'
};

exports.Prisma.usersOrderByRelevanceFieldEnum = {
  full_name: 'full_name',
  email: 'email',
  phone: 'phone',
  password_hash: 'password_hash',
  profile_image_url: 'profile_image_url'
};

exports.Prisma.volunteer_profilesOrderByRelevanceFieldEnum = {
  area_of_expertise: 'area_of_expertise',
  location: 'location',
  availability: 'availability',
  motivation: 'motivation',
  certificate_url: 'certificate_url',
  emergency_contact_name: 'emergency_contact_name',
  emergency_contact_phone: 'emergency_contact_phone'
};
exports.campaigns_language = exports.$Enums.campaigns_language = {
  en: 'en',
  am: 'am'
};

exports.contact_messages_reason = exports.$Enums.contact_messages_reason = {
  general: 'general',
  volunteering: 'volunteering',
  media: 'media',
  donations: 'donations'
};

exports.contact_messages_status = exports.$Enums.contact_messages_status = {
  new: 'new',
  read: 'read',
  replied: 'replied',
  closed: 'closed'
};

exports.documents_language = exports.$Enums.documents_language = {
  en: 'en',
  am: 'am'
};

exports.donations_donation_type = exports.$Enums.donations_donation_type = {
  one_time: 'one_time',
  recurring: 'recurring',
  in_kind: 'in_kind'
};

exports.donations_payment_status = exports.$Enums.donations_payment_status = {
  pending: 'pending',
  completed: 'completed',
  failed: 'failed'
};

exports.donor_profiles_donation_frequency = exports.$Enums.donor_profiles_donation_frequency = {
  monthly: 'monthly',
  quarterly: 'quarterly',
  yearly: 'yearly'
};

exports.donor_profiles_donation_tier = exports.$Enums.donor_profiles_donation_tier = {
  bronze: 'bronze',
  silver: 'silver',
  gold: 'gold',
  platinum: 'platinum'
};

exports.email_logs_status = exports.$Enums.email_logs_status = {
  sent: 'sent',
  failed: 'failed',
  bounced: 'bounced',
  opened: 'opened',
  clicked: 'clicked'
};

exports.event_participants_role = exports.$Enums.event_participants_role = {
  volunteer: 'volunteer',
  attendee: 'attendee',
  organizer: 'organizer'
};

exports.event_participants_status = exports.$Enums.event_participants_status = {
  registered: 'registered',
  confirmed: 'confirmed',
  attended: 'attended',
  no_show: 'no_show'
};

exports.events_status = exports.$Enums.events_status = {
  upcoming: 'upcoming',
  ongoing: 'ongoing',
  completed: 'completed',
  cancelled: 'cancelled'
};

exports.events_language = exports.$Enums.events_language = {
  en: 'en',
  am: 'am'
};

exports.faqs_language = exports.$Enums.faqs_language = {
  en: 'en',
  am: 'am'
};

exports.media_media_type = exports.$Enums.media_media_type = {
  image: 'image',
  video: 'video',
  pdf: 'pdf'
};

exports.media_language = exports.$Enums.media_language = {
  en: 'en',
  am: 'am'
};

exports.newsletter_subscribers_language_preference = exports.$Enums.newsletter_subscribers_language_preference = {
  en: 'en',
  am: 'am'
};

exports.partners_type = exports.$Enums.partners_type = {
  ngo: 'ngo',
  corporate: 'corporate',
  government: 'government',
  diaspora: 'diaspora'
};

exports.partners_language = exports.$Enums.partners_language = {
  en: 'en',
  am: 'am'
};

exports.posts_post_type = exports.$Enums.posts_post_type = {
  blog: 'blog',
  news: 'news',
  press_release: 'press_release'
};

exports.posts_language = exports.$Enums.posts_language = {
  en: 'en',
  am: 'am'
};

exports.programs_category = exports.$Enums.programs_category = {
  medical_outreach: 'medical_outreach',
  mental_health: 'mental_health',
  youth_development: 'youth_development',
  disease_prevention: 'disease_prevention'
};

exports.programs_language = exports.$Enums.programs_language = {
  en: 'en',
  am: 'am'
};

exports.role_permissions_role = exports.$Enums.role_permissions_role = {
  admin: 'admin',
  editor: 'editor',
  volunteer_manager: 'volunteer_manager'
};

exports.testimonials_type = exports.$Enums.testimonials_type = {
  volunteer: 'volunteer',
  beneficiary: 'beneficiary',
  partner: 'partner'
};

exports.testimonials_language = exports.$Enums.testimonials_language = {
  en: 'en',
  am: 'am'
};

exports.users_role = exports.$Enums.users_role = {
  admin: 'admin',
  volunteer: 'volunteer',
  donor: 'donor',
  editor: 'editor'
};

exports.users_language_preference = exports.$Enums.users_language_preference = {
  en: 'en',
  am: 'am'
};

exports.volunteer_profiles_background_check_status = exports.$Enums.volunteer_profiles_background_check_status = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected'
};

exports.volunteer_skills_proficiency_level = exports.$Enums.volunteer_skills_proficiency_level = {
  beginner: 'beginner',
  intermediate: 'intermediate',
  expert: 'expert'
};

exports.Prisma.ModelName = {
  campaigns: 'campaigns',
  contact_messages: 'contact_messages',
  documents: 'documents',
  donations: 'donations',
  donor_profiles: 'donor_profiles',
  email_logs: 'email_logs',
  event_participants: 'event_participants',
  events: 'events',
  faqs: 'faqs',
  media: 'media',
  newsletter_subscribers: 'newsletter_subscribers',
  partners: 'partners',
  posts: 'posts',
  programs: 'programs',
  role_permissions: 'role_permissions',
  site_interactions: 'site_interactions',
  skills: 'skills',
  testimonials: 'testimonials',
  users: 'users',
  volunteer_profiles: 'volunteer_profiles',
  volunteer_skills: 'volunteer_skills'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
