const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

// Database configuration
const dbConfig = {
  uri: process.env.DATABASE_URL,
};

async function createTables() {
  try {
    // Create connection
    const connection = await mysql.createConnection(dbConfig.uri);
    console.log("Connected to database successfully");

    // Users table (base table for foreign keys)
    const createUsersTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20),
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'volunteer', 'donor', 'editor') NOT NULL,
        profile_image_url VARCHAR(512),
        language_preference ENUM('en', 'am') DEFAULT 'en',
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB;
    `;
    await connection.execute(createUsersTableSQL);
    console.log("Users table created successfully");

    // Volunteer profiles table
    const createVolunteerProfilesSQL = `
      CREATE TABLE IF NOT EXISTS volunteer_profiles (
        user_id BIGINT UNSIGNED PRIMARY KEY,
        area_of_expertise VARCHAR(100),
        location VARCHAR(255),
        availability JSON,
        motivation TEXT,
        total_hours INT UNSIGNED DEFAULT 0,
        certificate_url VARCHAR(512),
        registered_events_count INT UNSIGNED DEFAULT 0,
        training_completed BOOLEAN DEFAULT FALSE,
        background_check_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        emergency_contact_name VARCHAR(100),
        emergency_contact_phone VARCHAR(20),
        rating DECIMAL(3,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_location (location),
        INDEX idx_background_check (background_check_status)
      ) ENGINE=InnoDB;
    `;
    await connection.execute(createVolunteerProfilesSQL);
    console.log("Volunteer profiles table created successfully");

    // Donor profiles table
    const createDonorProfilesSQL = `
      CREATE TABLE IF NOT EXISTS donor_profiles (
        user_id BIGINT UNSIGNED PRIMARY KEY,
        is_recurring_donor BOOLEAN DEFAULT FALSE,
        preferred_payment_method VARCHAR(50),
        total_donated DECIMAL(15,2) DEFAULT 0.00,
        donation_frequency ENUM('monthly', 'quarterly', 'yearly'),
        tax_receipt_email VARCHAR(255),
        is_anonymous BOOLEAN DEFAULT FALSE,
        last_donation_date TIMESTAMP NULL,
        donation_tier ENUM('bronze', 'silver', 'gold', 'platinum'),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_donation_tier (donation_tier),
        INDEX idx_recurring_donor (is_recurring_donor)
      ) ENGINE=InnoDB;
    `;
    await connection.execute(createDonorProfilesSQL);
    console.log("Donor profiles table created successfully");

    // Campaigns table
    const createCampaignsSQL = `
      CREATE TABLE IF NOT EXISTS campaigns (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        goal_amount DECIMAL(15,2) NOT NULL,
        current_amount DECIMAL(15,2) DEFAULT 0.00,
        start_date DATE NOT NULL,
        end_date DATE,
        is_active BOOLEAN DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE,
        category VARCHAR(50),
        progress_bar_color VARCHAR(20),
        image_url VARCHAR(512),
        video_url VARCHAR(512),
        donor_count INT UNSIGNED DEFAULT 0,
        success_stories JSON,
        created_by BIGINT UNSIGNED,
        language ENUM('en', 'am') DEFAULT 'en',
        translation_group_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (created_by) REFERENCES users(id),
        INDEX idx_slug (slug),
        INDEX idx_category (category),
        INDEX idx_active_featured (is_active, is_featured),
        INDEX idx_language (language),
        INDEX idx_translation_group (translation_group_id)
      ) ENGINE=InnoDB;
    `;
    await connection.execute(createCampaignsSQL);
    console.log("Campaigns table created successfully");

    // Donations table
    const createDonationsSQL = `
      CREATE TABLE IF NOT EXISTS donations (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        donor_id BIGINT UNSIGNED NOT NULL,
        campaign_id BIGINT UNSIGNED NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        donation_type ENUM('one_time', 'recurring', 'in_kind') NOT NULL,
        payment_method VARCHAR(50),
        payment_status ENUM('pending', 'completed', 'failed') NOT NULL,
        transaction_id VARCHAR(100) UNIQUE,
        receipt_url VARCHAR(512),
        is_acknowledged BOOLEAN DEFAULT FALSE,
        is_tax_deductible BOOLEAN DEFAULT TRUE,
        is_anonymous BOOLEAN DEFAULT FALSE,
        notes TEXT,
        donated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (donor_id) REFERENCES donor_profiles(user_id),
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
        INDEX idx_donation_date (donated_at),
        INDEX idx_payment_status (payment_status)
      ) ENGINE=InnoDB;
    `;
    await connection.execute(createDonationsSQL);
    console.log("Donations table created successfully");

    // Events table
    const createEventsSQL = `
      CREATE TABLE IF NOT EXISTS events (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        event_date DATE NOT NULL,
        event_time TIME NOT NULL,
        timezone VARCHAR(50) DEFAULT 'UTC',
        location VARCHAR(255),
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        category VARCHAR(50),
        capacity INT UNSIGNED,
        registered_count INT UNSIGNED DEFAULT 0,
        status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
        registration_deadline TIMESTAMP,
        registration_link VARCHAR(512),
        map_embed_url VARCHAR(512),
        agenda TEXT,
        speaker_info JSON,
        requirements TEXT,
        ticket_price DECIMAL(10,2),
        ticket_link VARCHAR(512),
        is_featured BOOLEAN DEFAULT FALSE,
        created_by BIGINT UNSIGNED,
        language ENUM('en', 'am') DEFAULT 'en',
        translation_group_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (created_by) REFERENCES users(id),
        INDEX idx_slug (slug),
        INDEX idx_event_date (event_date),
        INDEX idx_status (status),
        INDEX idx_language (language),
        INDEX idx_translation_group (translation_group_id),
        INDEX idx_location_coords (latitude, longitude)
      ) ENGINE=InnoDB;
    `;
    await connection.execute(createEventsSQL);
    console.log("Events table created successfully");

    // Event participants table
    const createEventParticipantsSQL = `
      CREATE TABLE IF NOT EXISTS event_participants (
        event_id BIGINT UNSIGNED,
        user_id BIGINT UNSIGNED,
        role ENUM('volunteer', 'attendee', 'organizer') NOT NULL,
        status ENUM('registered', 'confirmed', 'attended', 'no_show') DEFAULT 'registered',
        hours_contributed DECIMAL(5,2),
        feedback TEXT,
        rating TINYINT UNSIGNED CHECK (rating BETWEEN 1 AND 5),
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        attended_at TIMESTAMP NULL,
        PRIMARY KEY (event_id, user_id),
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_status (status)
      ) ENGINE=InnoDB;
    `;
    await connection.execute(createEventParticipantsSQL);
    console.log("Event participants table created successfully");

    // Programs table
    const createProgramsSQL = `
      CREATE TABLE IF NOT EXISTS programs (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category ENUM('medical_outreach', 'mental_health', 'youth_development', 'disease_prevention'),
        description TEXT,
        start_date DATE,
        end_date DATE,
        location VARCHAR(255),
        impact_stats JSON,
        is_featured BOOLEAN DEFAULT FALSE,
        created_by BIGINT UNSIGNED,
        language ENUM('en', 'am') DEFAULT 'en',
        translation_group_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (created_by) REFERENCES users(id),
        INDEX idx_category (category),
        INDEX idx_date_range (start_date, end_date),
        INDEX idx_language (language),
        INDEX idx_translation_group (translation_group_id)
      ) ENGINE=InnoDB;
    `;
    await connection.execute(createProgramsSQL);
    console.log("Programs table created successfully");

    // Posts table
    const createPostsSQL = `
      CREATE TABLE IF NOT EXISTS posts (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        content TEXT,
        post_type ENUM('blog', 'news', 'press_release') NOT NULL,
        author_id BIGINT UNSIGNED,
        feature_image VARCHAR(512),
        language ENUM('en', 'am') DEFAULT 'en',
        translation_group_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id),
        INDEX idx_slug (slug),
        INDEX idx_post_type (post_type),
        INDEX idx_language (language),
        INDEX idx_translation_group (translation_group_id),
        FULLTEXT INDEX idx_content (title, content)
      ) ENGINE=InnoDB;
    `;
    await connection.execute(createPostsSQL);
    console.log("Posts table created successfully");

    // Media table
    const createMediaSQL = `
      CREATE TABLE IF NOT EXISTS media (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        media_type ENUM('image', 'video', 'pdf') NOT NULL,
        title VARCHAR(255),
        description TEXT,
        file_url VARCHAR(512) NOT NULL,
        related_event_id BIGINT UNSIGNED,
        related_program_id BIGINT UNSIGNED,
        uploaded_by BIGINT UNSIGNED,
        language ENUM('en', 'am') DEFAULT 'en',
        translation_group_id VARCHAR(36),
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (related_event_id) REFERENCES events(id) ON DELETE SET NULL,
        FOREIGN KEY (related_program_id) REFERENCES programs(id) ON DELETE SET NULL,
        FOREIGN KEY (uploaded_by) REFERENCES users(id),
        INDEX idx_media_type (media_type),
        INDEX idx_language (language),
        INDEX idx_translation_group (translation_group_id)
      ) ENGINE=InnoDB;
    `;
    await connection.execute(createMediaSQL);
    console.log("Media table created successfully");

    // Testimonials table
    const createTestimonialsSQL = `
      CREATE TABLE IF NOT EXISTS testimonials (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(100),
        message TEXT NOT NULL,
        image_url VARCHAR(512),
        type ENUM('volunteer', 'beneficiary', 'partner') NOT NULL,
        language ENUM('en', 'am') DEFAULT 'en',
        translation_group_id VARCHAR(36),
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_type (type),
        INDEX idx_language (language),
        INDEX idx_translation_group (translation_group_id),
        INDEX idx_featured (is_featured)
      ) ENGINE=InnoDB;
    `;
    await connection.execute(createTestimonialsSQL);
    console.log("Testimonials table created successfully");

    // FAQ table
    const createFaqsSQL = `
      CREATE TABLE IF NOT EXISTS faqs (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category VARCHAR(50),
        language ENUM('en', 'am') DEFAULT 'en',
        translation_group_id VARCHAR(36),
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT UNSIGNED DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_language (language),
        INDEX idx_translation_group (translation_group_id),
        INDEX idx_active_order (is_active, sort_order)
      ) ENGINE=InnoDB;
    `;
    await connection.execute(createFaqsSQL);
    console.log("FAQs table created successfully");

    // Partners table
    const createPartnersSQL = `
      CREATE TABLE IF NOT EXISTS partners (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        logo_url VARCHAR(512),
        type ENUM('ngo', 'corporate', 'government', 'diaspora') NOT NULL,
        website VARCHAR(512),
        contact_email VARCHAR(255),
        quote TEXT,
        language ENUM('en', 'am') DEFAULT 'en',
        translation_group_id VARCHAR(36),
        is_active BOOLEAN DEFAULT TRUE,
        partnership_start_date DATE,
        partnership_end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_type (type),
        INDEX idx_language (language),
        INDEX idx_translation_group (translation_group_id),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB;
    `;
    await connection.execute(createPartnersSQL);
    console.log("Partners table created successfully");

    // Contact messages table
    const createContactMessagesSQL = `
      CREATE TABLE IF NOT EXISTS contact_messages (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        reason ENUM('general', 'volunteering', 'media', 'donations') NOT NULL,
        status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new',
        ip_address VARCHAR(45),
        user_agent TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        replied_at TIMESTAMP NULL,
        INDEX idx_status (status),
        INDEX idx_reason (reason),
        INDEX idx_submitted_at (submitted_at)
      ) ENGINE=InnoDB;
    `;
    await connection.execute(createContactMessagesSQL);
    console.log("Contact messages table created successfully");

    // Documents table
    const createDocumentsSQL = `
      CREATE TABLE IF NOT EXISTS documents (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50),
        file_url VARCHAR(512) NOT NULL,
        file_size BIGINT UNSIGNED,
        file_type VARCHAR(50),
        uploaded_by BIGINT UNSIGNED,
        language ENUM('en', 'am') DEFAULT 'en',
        translation_group_id VARCHAR(36),
        is_public BOOLEAN DEFAULT FALSE,
        download_count INT UNSIGNED DEFAULT 0,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users(id),
        INDEX idx_category (category),
        INDEX idx_language (language),
        INDEX idx_translation_group (translation_group_id),
        INDEX idx_public (is_public)
      ) ENGINE=InnoDB;
    `;
    await connection.execute(createDocumentsSQL);
    console.log("Documents table created successfully");

    // Newsletter subscribers table
    const createNewsletterSubscribersSQL = `
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        language_preference ENUM('en', 'am') DEFAULT 'en',
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        unsubscribed_at TIMESTAMP NULL,
        INDEX idx_email (email),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB;
    `;
    await connection.execute(createNewsletterSubscribersSQL);
    console.log("Newsletter subscribers table created successfully");

    // Role permissions table
    const createRolePermissionsSQL = `
      CREATE TABLE IF NOT EXISTS role_permissions (
        role ENUM('admin', 'editor', 'volunteer_manager') NOT NULL,
        permission VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (role, permission),
        INDEX idx_role (role),
        INDEX idx_permission (permission)
      ) ENGINE=InnoDB;
    `;
    await connection.execute(createRolePermissionsSQL);
    console.log("Role permissions table created successfully");

    // Email logs table
    const createEmailLogsSQL = `
      CREATE TABLE IF NOT EXISTS email_logs (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        recipient VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        template_used VARCHAR(100),
        content TEXT,
        status ENUM('sent', 'failed', 'bounced', 'opened', 'clicked') NOT NULL,
        error_message TEXT,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        opened_at TIMESTAMP NULL,
        clicked_at TIMESTAMP NULL,
        INDEX idx_recipient (recipient),
        INDEX idx_status (status),
        INDEX idx_sent_at (sent_at),
        INDEX idx_template (template_used)
      ) ENGINE=InnoDB;
    `;
    await connection.execute(createEmailLogsSQL);
    console.log("Email logs table created successfully");

    // Site interactions table
    const createSiteInteractionsSQL = `
      CREATE TABLE IF NOT EXISTS site_interactions (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED,
        session_id VARCHAR(100),
        page VARCHAR(255),
        action VARCHAR(100),
        metadata JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_session_id (session_id),
        INDEX idx_page (page),
        INDEX idx_action (action),
        INDEX idx_occurred_at (occurred_at)
      ) ENGINE=InnoDB;
    `;
    await connection.execute(createSiteInteractionsSQL);
    console.log("Site interactions table created successfully");

    // Skills table
    const createSkillsSQL = `
      CREATE TABLE IF NOT EXISTS skills (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        category VARCHAR(50),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_category (category)
      ) ENGINE=InnoDB;
    `;
    await connection.execute(createSkillsSQL);
    console.log("Skills table created successfully");

    // Volunteer skills table
    const createVolunteerSkillsSQL = `
      CREATE TABLE IF NOT EXISTS volunteer_skills (
        volunteer_id BIGINT UNSIGNED,
        skill_id BIGINT UNSIGNED,
        proficiency_level ENUM('beginner', 'intermediate', 'expert') NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (volunteer_id, skill_id),
        FOREIGN KEY (volunteer_id) REFERENCES volunteer_profiles(user_id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
        INDEX idx_proficiency (proficiency_level)
      ) ENGINE=InnoDB;
    `;
    await connection.execute(createVolunteerSkillsSQL);
    console.log("Volunteer skills table created successfully");

    // Create default admin user
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash("admin123", salt);

    const insertAdminSQL = `
      INSERT INTO users (full_name, email, password_hash, role, email_verified)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE email = email;
    `;

    await connection.execute(insertAdminSQL, [
      "Admin User",
      "admin@example.com",
      adminPasswordHash,
      "admin",
      true,
    ]);
    console.log("Default admin user created successfully");

    // Close the connection
    await connection.end();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

// Execute the function
createTables();
