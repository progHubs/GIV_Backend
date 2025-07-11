-- Users table
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    is_donor BOOLEAN NOT NULL DEFAULT FALSE,
    is_volunteer BOOLEAN NOT NULL DEFAULT FALSE,
    profile_image_url VARCHAR(512),
    language_preference ENUM('en', 'am') DEFAULT 'en',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB;

-- Volunteer profiles table
CREATE TABLE volunteer_profiles (
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

-- Donor profiles table
CREATE TABLE donor_profiles (
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

-- Campaigns table
CREATE TABLE campaigns (
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
    is_completed BOOLEAN DEFAULT FALSE COMMENT 'Automatically set to TRUE when current_amount >= goal_amount',
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
    INDEX idx_completed (is_completed),
    INDEX idx_language (language),
    INDEX idx_translation_group (translation_group_id)
) ENGINE=InnoDB;

-- Donations table
CREATE TABLE donations (
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

-- Events table
CREATE TABLE events (
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

-- Event participants table
CREATE TABLE event_participants (
    event_id BIGINT UNSIGNED,
    user_id BIGINT UNSIGNED,
    role ENUM('volunteer', 'attendee', 'organizer') NOT NULL,
    status ENUM('registered', 'confirmed', 'reminded', 'attended', 'no_show') DEFAULT 'registered',
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

-- Programs table
CREATE TABLE programs (
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

-- Posts table
CREATE TABLE posts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT,
    post_type ENUM('blog', 'news', 'press_release') NOT NULL,
    author_id BIGINT UNSIGNED,
    feature_image VARCHAR(512),
    views INT UNSIGNED DEFAULT 0,
    likes INT UNSIGNED DEFAULT 0,
    comments_count INT UNSIGNED DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    tags TEXT,
    language ENUM('en', 'am') DEFAULT 'en',
    translation_group_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id),
    INDEX idx_slug (slug),
    INDEX idx_post_type (post_type),
    INDEX idx_language (language),
    INDEX idx_translation_group (translation_group_id),
    INDEX idx_featured (is_featured),
    INDEX idx_views (views),
    INDEX idx_likes (likes),
    INDEX idx_created_at (created_at),
    FULLTEXT INDEX idx_content (title, content),
    FULLTEXT INDEX idx_tags (tags)
) ENGINE=InnoDB;

-- Comments table
CREATE TABLE comments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    content TEXT NOT NULL,
    parent_id BIGINT UNSIGNED NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_approved (is_approved),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Media table
CREATE TABLE media (
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

-- Testimonials table
CREATE TABLE testimonials (
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

-- FAQ table
CREATE TABLE faqs (
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

-- Partners table
CREATE TABLE partners (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(512),
    type ENUM('ngo', 'corporate', 'government', 'diaspora') NOT NULL,
    category VARCHAR(50),
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
    INDEX idx_category (category),
    INDEX idx_language (language),
    INDEX idx_translation_group (translation_group_id),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- Contact messages table
CREATE TABLE contact_messages (
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

-- Documents table
CREATE TABLE documents (
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

-- Newsletter subscribers table
CREATE TABLE newsletter_subscribers (
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

-- Email logs table
CREATE TABLE email_logs (
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

-- Site interactions table
CREATE TABLE site_interactions (
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

-- Skills table
CREATE TABLE skills (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category)
) ENGINE=InnoDB;

-- Volunteer skills table
CREATE TABLE volunteer_skills (
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

-- Revoked tokens table for JWT blacklist
CREATE TABLE revoked_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    token_hash VARCHAR(128) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB;

-- Add triggers for comment count management
DELIMITER //

CREATE TRIGGER after_insert_comment
AFTER INSERT ON comments
FOR EACH ROW
BEGIN
  UPDATE posts SET comments_count = comments_count + 1
  WHERE id = NEW.post_id;
END//

CREATE TRIGGER after_delete_comment
AFTER DELETE ON comments
FOR EACH ROW
BEGIN
  UPDATE posts SET comments_count = comments_count - 1
  WHERE id = OLD.post_id;
END//

CREATE TRIGGER after_update_comment
AFTER UPDATE ON comments
FOR EACH ROW
BEGIN
  -- Handle soft delete (when deleted_at is set)
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    UPDATE posts SET comments_count = comments_count - 1
    WHERE id = NEW.post_id;
  END IF;

  -- Handle restore from soft delete (when deleted_at is cleared)
  IF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
    UPDATE posts SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
  END IF;
END//

-- Add triggers for UUID generation (if needed for translation_group_id)

CREATE TRIGGER before_insert_campaigns
BEFORE INSERT ON campaigns
FOR EACH ROW
BEGIN
    IF NEW.translation_group_id IS NULL THEN
        SET NEW.translation_group_id = UUID();
    END IF;
END//

CREATE TRIGGER before_insert_events
BEFORE INSERT ON events
FOR EACH ROW
BEGIN
    IF NEW.translation_group_id IS NULL THEN
        SET NEW.translation_group_id = UUID();
    END IF;
END//

CREATE TRIGGER before_insert_programs
BEFORE INSERT ON programs
FOR EACH ROW
BEGIN
    IF NEW.translation_group_id IS NULL THEN
        SET NEW.translation_group_id = UUID();
    END IF;
END//

CREATE TRIGGER before_insert_posts
BEFORE INSERT ON posts
FOR EACH ROW
BEGIN
    IF NEW.translation_group_id IS NULL THEN
        SET NEW.translation_group_id = UUID();
    END IF;
END//

CREATE TRIGGER before_insert_media
BEFORE INSERT ON media
FOR EACH ROW
BEGIN
    IF NEW.translation_group_id IS NULL THEN
        SET NEW.translation_group_id = UUID();
    END IF;
END//

CREATE TRIGGER before_insert_testimonials
BEFORE INSERT ON testimonials
FOR EACH ROW
BEGIN
    IF NEW.translation_group_id IS NULL THEN
        SET NEW.translation_group_id = UUID();
    END IF;
END//

CREATE TRIGGER before_insert_faqs
BEFORE INSERT ON faqs
FOR EACH ROW
BEGIN
    IF NEW.translation_group_id IS NULL THEN
        SET NEW.translation_group_id = UUID();
    END IF;
END//

CREATE TRIGGER before_insert_partners
BEFORE INSERT ON partners
FOR EACH ROW
BEGIN
    IF NEW.translation_group_id IS NULL THEN
        SET NEW.translation_group_id = UUID();
    END IF;
END//

CREATE TRIGGER before_insert_documents
BEFORE INSERT ON documents
FOR EACH ROW
BEGIN
    IF NEW.translation_group_id IS NULL THEN
        SET NEW.translation_group_id = UUID();
    END IF;
END//

DELIMITER ;
