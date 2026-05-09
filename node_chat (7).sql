-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 09, 2026 at 10:55 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `node_chat`
--

-- --------------------------------------------------------

--
-- Table structure for table `active_calls`
--

CREATE TABLE `active_calls` (
  `id` int(11) NOT NULL,
  `room_id` varchar(80) NOT NULL,
  `call_type` varchar(10) DEFAULT 'audio',
  `is_group` tinyint(1) DEFAULT 0,
  `group_id` varchar(80) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NOT NULL DEFAULT (current_timestamp() + interval 4 hour)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `active_calls`
--

INSERT INTO `active_calls` (`id`, `room_id`, `call_type`, `is_group`, `group_id`, `created_at`, `expires_at`) VALUES
(22, 'mowqnru0tyl75', 'video', 0, NULL, '2026-05-08 09:54:44', '2026-05-08 13:54:44');

-- --------------------------------------------------------

--
-- Table structure for table `active_call_members`
--

CREATE TABLE `active_call_members` (
  `id` int(11) NOT NULL,
  `room_id` varchar(80) NOT NULL,
  `user_id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `active_call_members`
--

INSERT INTO `active_call_members` (`id`, `room_id`, `user_id`, `username`, `joined_at`) VALUES
(2, 'mnh6enpfnhbe4', 1, 'ajay', '2026-04-02 07:51:37'),
(4, 'mnhbv3qyqvrc5', 6, 'Mansi', '2026-04-02 10:24:23'),
(5, 'mnkb4dyejx46o', 9, 'Sanket K', '2026-04-04 12:26:52'),
(6, 'mnkb4dyejx46o', 1, 'ajay', '2026-04-04 12:27:00'),
(7, 'mnkb8rpisrmpp', 1, 'ajay', '2026-04-04 12:30:13'),
(8, 'mnkb939o61y2f', 1, 'ajay', '2026-04-04 12:30:28'),
(9, 'mnkb939o61y2f', 9, 'Sanket K', '2026-04-04 12:30:31'),
(10, 'mnoh0vxz48c16', 1, 'ajay', '2026-04-07 10:23:08'),
(11, 'mnoh0vxz48c16', 6, 'Mansi', '2026-04-07 10:23:10'),
(13, 'mnoh1k638sb01', 1, 'ajay', '2026-04-07 10:23:43'),
(15, 'mnoh2vybiesye', 1, 'ajay', '2026-04-07 10:24:45'),
(16, 'mnoh62ss30ugp', 6, 'Mansi', '2026-04-07 10:27:10'),
(17, 'mnoh62ss30ugp', 1, 'ajay', '2026-04-07 10:27:12'),
(18, 'mnoh7cq0visf9', 2, 'sonu', '2026-04-07 10:28:11'),
(19, 'mnoh7cq0visf9', 1, 'ajay', '2026-04-07 10:28:14'),
(21, 'mnoh7zhzenoz8', 2, 'sonu', '2026-04-07 10:28:40'),
(22, 'mnohdhm2iiwtl', 2, 'sonu', '2026-04-07 10:32:58'),
(23, 'mnohdhm2iiwtl', 1, 'ajay', '2026-04-07 10:33:02'),
(24, 'mnohdyisx3hoi', 1, 'ajay', '2026-04-07 10:33:17'),
(25, 'mnohdyisx3hoi', 2, 'sonu', '2026-04-07 10:33:21'),
(27, 'mnohge8lkpmo9', 1, 'ajay', '2026-04-07 10:35:17'),
(30, 'mnoj6sp7n9ty9', 1, 'ajay', '2026-04-07 11:23:43'),
(31, 'mnoj6sp7n9ty9', 2, 'sonu', '2026-04-07 11:23:47'),
(33, 'mnojahwg8aw3n', 2, 'sonu', '2026-04-07 11:26:40'),
(34, 'mnojf6q20zg12', 1, 'ajay', '2026-04-07 11:30:14'),
(36, 'mnojfmiq2mn8r', 1, 'ajay', '2026-04-07 11:30:39'),
(38, 'moo81uzpiwwl5', 2, 'sonu', '2026-05-02 10:51:49'),
(39, 'moqutshtpqehc', 1, 'ajay', '2026-05-04 07:04:46'),
(41, 'mowqnru0tyl75', 1, 'ajay', '2026-05-08 09:54:44');

-- --------------------------------------------------------

--
-- Table structure for table `admin_activity_log`
--

CREATE TABLE `admin_activity_log` (
  `id` bigint(20) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `target_type` varchar(50) DEFAULT NULL,
  `target_id` varchar(100) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_activity_log`
--

INSERT INTO `admin_activity_log` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `ip_address`, `created_at`) VALUES
(1, 1, 'ban_user', 'user', '1', '{\"reason\":\"\",\"banType\":\"temporary\"}', '::1', '2026-05-04 06:17:07'),
(2, 1, 'unban_user', 'user', '1', '{}', '::1', '2026-05-04 06:18:27'),
(3, 1, 'ban_user', 'user', '1', '{\"reason\":\"\",\"banType\":\"temporary\"}', '::1', '2026-05-04 06:19:32'),
(4, 1, 'unban_user', 'user', '1', '{}', '::1', '2026-05-04 06:20:17'),
(5, 1, 'create_api_key', 'api_key', '1', '{\"keyName\":\"My New App\",\"ownerEmail\":\"ravi@gmail.com\"}', '::1', '2026-05-04 06:44:11'),
(6, 1, 'create_ad', 'ad', '1', '{\"title\":\"Summer Sale\"}', '::1', '2026-05-04 06:47:24'),
(7, 1, 'ban_user', 'user', '1', '{\"reason\":\"\",\"banType\":\"temporary\"}', '::1', '2026-05-04 07:01:43'),
(8, 1, 'unban_user', 'user', '1', '{}', '::1', '2026-05-04 07:04:12'),
(9, 1, 'ban_user', 'user', '2', '{\"reason\":\"\",\"banType\":\"permanent\"}', '::1', '2026-05-04 07:49:58'),
(10, 1, 'unban_user', 'user', '2', '{}', '::1', '2026-05-04 07:50:22'),
(11, 1, 'ban_user', 'user', '1', '{\"reason\":\"\",\"banType\":\"temporary\"}', '::1', '2026-05-04 07:50:42'),
(12, 1, 'unban_user', 'user', '1', '{}', '::1', '2026-05-04 07:51:00'),
(13, 1, 'ban_user', 'user', '1', '{\"reason\":\"\",\"banType\":\"permanent\"}', '::1', '2026-05-08 09:52:50'),
(14, 1, 'approve_unban', 'unban_request', '1', '{\"reviewNote\":\"\"}', '::1', '2026-05-08 09:54:08');

-- --------------------------------------------------------

--
-- Table structure for table `admin_roles`
--

CREATE TABLE `admin_roles` (
  `id` int(11) NOT NULL,
  `role_name` varchar(100) NOT NULL,
  `display_name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`permissions`)),
  `color` varchar(20) DEFAULT '#00bfa5',
  `is_system` tinyint(1) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_roles`
--

INSERT INTO `admin_roles` (`id`, `role_name`, `display_name`, `description`, `permissions`, `color`, `is_system`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'superadmin', 'Super Admin', 'Full system access', '{\"manage_users\": true, \"manage_ads\": true, \"manage_roles\": true, \"view_reports\": true, \"manage_api_keys\": true, \"manage_settings\": true, \"delete_users\": true, \"ban_users\": true}', '#e53e3e', 1, NULL, '2026-05-02 11:58:17', '2026-05-02 11:58:17'),
(2, 'admin', 'Admin', 'General admin access', '{\"manage_users\": true, \"manage_ads\": true, \"view_reports\": true, \"ban_users\": true}', '#f6ad55', 1, NULL, '2026-05-02 11:58:17', '2026-05-02 11:58:17'),
(3, 'moderator', 'Moderator', 'Content moderation', '{\"manage_users\": true, \"view_reports\": true, \"ban_users\": false}', '#00bfa5', 1, NULL, '2026-05-02 11:58:17', '2026-05-02 11:58:17');

-- --------------------------------------------------------

--
-- Stand-in structure for view `admin_stats`
-- (See below for the actual view)
--
CREATE TABLE `admin_stats` (
`total_users` bigint(21)
,`active_users` bigint(21)
,`banned_users` bigint(21)
,`online_users` bigint(21)
,`new_users_today` bigint(21)
,`messages_today` bigint(21)
,`total_messages` bigint(21)
,`total_groups` bigint(21)
,`active_ads` bigint(21)
,`active_api_keys` bigint(21)
,`pending_unban_requests` bigint(21)
);

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('superadmin','admin','moderator') DEFAULT 'admin',
  `avatar_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `email`, `password_hash`, `role`, `avatar_url`, `is_active`, `last_login`, `permissions`, `created_at`, `updated_at`) VALUES
(1, 'superadmin', 'admin@chatapp.com', '$2a$12$zpotu2hYK2eUzWJn7lmNx.b1fKcmqbL0JHOGRbckSzYtU1fpUHtKm', 'superadmin', NULL, 1, '2026-05-08 09:47:44', '{\"manage_users\": true, \"manage_ads\": true, \"manage_roles\": true, \"view_reports\": true, \"manage_api_keys\": true, \"manage_settings\": true}', '2026-05-02 11:58:16', '2026-05-08 09:47:44');

-- --------------------------------------------------------

--
-- Table structure for table `ads`
--

CREATE TABLE `ads` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `ad_type` enum('banner','interstitial','status','story','chat','notification','popup') DEFAULT 'banner',
  `media_url` varchar(500) DEFAULT NULL,
  `media_type` enum('image','video','gif','html') DEFAULT 'image',
  `cta_text` varchar(100) DEFAULT 'Learn More',
  `cta_url` varchar(500) DEFAULT NULL,
  `target_url` varchar(500) DEFAULT NULL,
  `placement_status` tinyint(1) DEFAULT 1 COMMENT 'Show in status section',
  `placement_chat` tinyint(1) DEFAULT 0 COMMENT 'Show in chat list',
  `placement_calls` tinyint(1) DEFAULT 0 COMMENT 'Show in calls section',
  `placement_home` tinyint(1) DEFAULT 0 COMMENT 'Show on home screen',
  `budget` decimal(10,2) DEFAULT 0.00,
  `daily_budget` decimal(10,2) DEFAULT 0.00,
  `cost_per_click` decimal(10,4) DEFAULT 0.0000,
  `cost_per_impression` decimal(10,4) DEFAULT 0.0000,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `target_gender` enum('all','male','female') DEFAULT 'all',
  `target_age_min` int(11) DEFAULT 13,
  `target_age_max` int(11) DEFAULT 65,
  `target_location` varchar(500) DEFAULT NULL,
  `target_interests` text DEFAULT NULL,
  `bg_color` varchar(20) DEFAULT '#1a2433',
  `text_color` varchar(20) DEFAULT '#ffffff',
  `border_color` varchar(20) DEFAULT '#00bfa5',
  `advertiser_name` varchar(200) DEFAULT NULL,
  `advertiser_logo` varchar(500) DEFAULT NULL,
  `advertiser_email` varchar(255) DEFAULT NULL,
  `impressions` bigint(20) DEFAULT 0,
  `clicks` bigint(20) DEFAULT 0,
  `spend` decimal(10,2) DEFAULT 0.00,
  `status` enum('active','paused','ended','draft','pending_review') DEFAULT 'draft',
  `priority` int(11) DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ads`
--

INSERT INTO `ads` (`id`, `title`, `description`, `ad_type`, `media_url`, `media_type`, `cta_text`, `cta_url`, `target_url`, `placement_status`, `placement_chat`, `placement_calls`, `placement_home`, `budget`, `daily_budget`, `cost_per_click`, `cost_per_impression`, `start_date`, `end_date`, `target_gender`, `target_age_min`, `target_age_max`, `target_location`, `target_interests`, `bg_color`, `text_color`, `border_color`, `advertiser_name`, `advertiser_logo`, `advertiser_email`, `impressions`, `clicks`, `spend`, `status`, `priority`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'Summer Sale', '', 'banner', '/uploads/admin-1778233748005-24fe5d0a.jpg', 'image', 'Learn More', '', NULL, 1, 0, 1, 0, 1000.00, 100.00, 1.0000, 9.9999, '2026-05-08', '2026-05-30', 'all', 13, 65, '', '', '#1a2433', '#ffffff', '#00bfa5', '', NULL, '', 0, 0, 0.00, 'active', 1, 1, '2026-05-04 06:47:24', '2026-05-08 09:49:14');

-- --------------------------------------------------------

--
-- Table structure for table `ad_balance`
--

CREATE TABLE `ad_balance` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `balance` decimal(10,2) DEFAULT 0.00,
  `total_added` decimal(10,2) DEFAULT 0.00,
  `total_spent` decimal(10,2) DEFAULT 0.00,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ad_events`
--

CREATE TABLE `ad_events` (
  `id` bigint(20) NOT NULL,
  `ad_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `event_type` enum('impression','click','dismiss') DEFAULT 'impression',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `placement` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `api_keys`
--

CREATE TABLE `api_keys` (
  `id` int(11) NOT NULL,
  `key_name` varchar(200) NOT NULL,
  `api_key` varchar(64) NOT NULL,
  `api_secret` varchar(128) NOT NULL,
  `owner_name` varchar(200) NOT NULL,
  `owner_email` varchar(255) NOT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `max_users` int(11) DEFAULT 100,
  `current_users` int(11) DEFAULT 0,
  `rate_limit_per_min` int(11) DEFAULT 60,
  `rate_limit_per_day` int(11) DEFAULT 10000,
  `total_requests` bigint(20) DEFAULT 0,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `status` enum('active','suspended','expired','revoked') DEFAULT 'active',
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `api_keys`
--

INSERT INTO `api_keys` (`id`, `key_name`, `api_key`, `api_secret`, `owner_name`, `owner_email`, `permissions`, `max_users`, `current_users`, `rate_limit_per_min`, `rate_limit_per_day`, `total_requests`, `last_used_at`, `status`, `expires_at`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'My New App', 'ck_c15eb7c8d09c870ecb8adea5107bf58635869f45ff1757cd', 'sk_9476ab1ebe89a8a74876f950e519380154ff8b978b1fb47ec4fcf514781c51f9', 'Ravi Kumar', 'ravi@gmail.com', '{\"messaging\":true,\"calls\":true,\"groups\":true,\"status\":true,\"files\":true}', 100, 0, 60, 10000, 0, NULL, 'active', '2028-10-17 18:30:00', 1, '2026-05-04 06:44:11', '2026-05-04 06:44:11');

-- --------------------------------------------------------

--
-- Table structure for table `api_request_logs`
--

CREATE TABLE `api_request_logs` (
  `id` bigint(20) NOT NULL,
  `api_key_id` int(11) NOT NULL,
  `endpoint` varchar(200) DEFAULT NULL,
  `method` varchar(10) DEFAULT NULL,
  `status_code` int(11) DEFAULT NULL,
  `response_time_ms` int(11) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `app_settings`
--

CREATE TABLE `app_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` varchar(500) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `app_settings`
--

INSERT INTO `app_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `updated_by`, `updated_at`) VALUES
(1, 'app_name', 'ChatApp', 'string', 'Application name', 1, '2026-05-08 10:51:39'),
(2, 'max_file_size_mb', '50', 'number', 'Max file upload size in MB', 1, '2026-05-08 10:51:39'),
(3, 'registration_enabled', 'true', 'boolean', 'Allow new user registrations', 1, '2026-05-08 10:51:39'),
(4, 'ads_enabled', 'false', 'boolean', 'Enable ads system', 1, '2026-05-08 11:12:56'),
(5, 'maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', 1, '2026-05-08 10:51:39'),
(6, 'default_message_retention_days', '365', 'number', 'Days to keep messages', 1, '2026-05-08 10:51:39'),
(7, 'max_group_members', '256', 'number', 'Max members per group', 1, '2026-05-08 10:51:39');

-- --------------------------------------------------------

--
-- Table structure for table `blocked_users`
--

CREATE TABLE `blocked_users` (
  `user_id` int(11) NOT NULL,
  `blocked_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `call_history`
--

CREATE TABLE `call_history` (
  `id` varchar(30) NOT NULL,
  `caller_id` int(11) NOT NULL,
  `callee_id` int(11) DEFAULT NULL,
  `group_id` varchar(30) DEFAULT NULL,
  `call_type` enum('audio','video') NOT NULL DEFAULT 'audio',
  `status` enum('completed','missed','rejected','ongoing','cancelled') NOT NULL DEFAULT 'ongoing',
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ended_at` timestamp NULL DEFAULT NULL,
  `duration` int(11) NOT NULL DEFAULT 0,
  `is_group` tinyint(1) DEFAULT 0,
  `duration_s` int(11) DEFAULT 0,
  `deleted_for` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`deleted_for`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `call_history`
--

INSERT INTO `call_history` (`id`, `caller_id`, `callee_id`, `group_id`, `call_type`, `status`, `started_at`, `ended_at`, `duration`, `is_group`, `duration_s`, `deleted_for`) VALUES
('mncx4i3cfbe6a3a394', 7, 1, NULL, 'audio', '', '2026-03-30 08:20:39', '2026-03-30 08:20:41', 0, 0, 1, NULL),
('mncx4p716fbbef5d6d', 7, 1, NULL, 'video', '', '2026-03-30 08:20:49', NULL, 0, 0, 0, NULL),
('mncx52wxc0bf5497f4', 7, 1, NULL, 'video', '', '2026-03-30 08:21:06', NULL, 0, 0, 0, NULL),
('mncx5fole666b93ac6', 1, 7, NULL, 'video', '', '2026-03-30 08:21:23', '2026-03-30 08:21:48', 0, 0, 25, NULL),
('mncx64csba77c6f3bf', 7, 1, NULL, 'video', '', '2026-03-30 08:21:53', NULL, 0, 0, 0, NULL),
('mndgxv8t4f334ad5ef', 1, 2, NULL, 'video', '', '2026-03-30 17:35:22', NULL, 0, 0, 0, NULL),
('mndgy84de1187b0747', 1, 2, NULL, 'video', '', '2026-03-30 17:35:38', NULL, 0, 0, 0, NULL),
('mndh1tpo557d62903b', 2, 1, NULL, 'video', 'missed', '2026-03-30 17:38:22', NULL, 0, 0, 0, NULL),
('mndh22f69a7eb7f2b3', 2, 1, NULL, 'video', 'missed', '2026-03-30 17:38:34', NULL, 0, 0, 0, NULL),
('mndh2n0u3f11217c3f', 1, 2, NULL, 'video', '', '2026-03-30 17:39:04', NULL, 0, 0, 0, NULL),
('mndh4m667c1acfd0ea', 1, 2, NULL, 'video', '', '2026-03-30 17:40:35', NULL, 0, 0, 0, NULL),
('mndh53yg6b93477ab2', 1, 2, NULL, 'audio', '', '2026-03-30 17:40:58', NULL, 0, 0, 0, NULL),
('mndh5dnfbe218d7520', 2, 1, NULL, 'audio', 'missed', '2026-03-30 17:41:08', NULL, 0, 0, 0, NULL),
('mndh6hdn38dd4ece0f', 1, 2, NULL, 'video', 'missed', '2026-03-30 17:42:00', NULL, 0, 0, 0, NULL),
('mndh6u4y15d1c834d2', 1, 2, NULL, 'video', 'missed', '2026-03-30 17:42:16', NULL, 0, 0, 0, NULL),
('mndi68qqb5c83c0118', 2, 1, NULL, 'video', 'completed', '2026-03-30 18:09:54', '2026-03-30 18:15:58', 0, 0, 259, NULL),
('mndiea2t21b18c2a67', 2, 1, NULL, 'video', '', '2026-03-30 18:16:07', NULL, 0, 0, 0, NULL),
('mndin2mi4be741bde3', 1, 2, NULL, 'video', 'completed', '2026-03-30 18:23:02', '2026-03-30 18:25:05', 0, 0, 123, NULL),
('mndj2x315e00237db1', 1, 8, NULL, 'video', '', '2026-03-30 18:35:21', NULL, 0, 0, 0, NULL),
('mne8xl2na2782da105', 1, 7, NULL, 'video', '', '2026-03-31 06:38:59', NULL, 0, 0, 0, NULL),
('mne8ycit162ce02af9', 1, 6, NULL, 'video', 'completed', '2026-03-31 06:39:58', '2026-03-31 06:41:49', 0, 0, 111, NULL),
('mne91u4t387efec415', 2, 1, NULL, 'video', '', '2026-03-31 06:42:15', NULL, 0, 0, 0, NULL),
('mned3bn29399c1c526', 1, 7, NULL, 'video', 'missed', '2026-03-31 08:35:20', NULL, 0, 0, 0, NULL),
('mned3v9be3abe4c8de', 1, 9, NULL, 'video', 'completed', '2026-03-31 08:35:49', '2026-03-31 08:36:11', 0, 0, 21, NULL),
('mned4ihgb43eb119ad', 1, 6, NULL, 'video', 'completed', '2026-03-31 08:36:20', '2026-03-31 08:36:34', 0, 0, 13, NULL),
('mned51vy9ff8fa4577', 1, 9, NULL, 'video', 'completed', '2026-03-31 08:36:50', '2026-03-31 08:37:12', 0, 0, 21, NULL),
('mned5stjedbc949111', 6, 5, NULL, 'video', 'missed', '2026-03-31 08:37:15', NULL, 0, 0, 0, NULL),
('mned5u7o8b8ad3373a', 1, 9, NULL, 'video', 'completed', '2026-03-31 08:37:22', '2026-03-31 08:38:30', 0, 0, 67, NULL),
('mned6ugne8b9890b7d', 6, 9, NULL, 'video', 'completed', '2026-03-31 08:38:14', '2026-03-31 08:38:35', 0, 0, 21, NULL),
('mnfq94m05a09d43c08', 2, 1, NULL, 'video', 'missed', '2026-04-01 07:31:32', NULL, 0, 0, 0, NULL),
('mnfq94oef72d26a3c9', 2, 1, NULL, 'audio', 'rejected', '2026-04-01 07:31:32', '2026-04-01 07:31:37', 0, 0, 0, NULL),
('mnfq9iij358f45a061', 1, 2, NULL, 'video', '', '2026-04-01 07:31:53', NULL, 0, 0, 0, NULL),
('mnfswnf9895e345af5', 1, 2, NULL, 'video', '', '2026-04-01 08:45:57', NULL, 0, 0, 0, NULL),
('mnfsxfc2840451da21', 2, 1, NULL, 'video', 'completed', '2026-04-01 08:46:29', '2026-04-01 08:46:39', 0, 0, 10, NULL),
('mnfsz46b16a07726ab', 2, 1, NULL, 'video', '', '2026-04-01 08:47:48', NULL, 0, 0, 0, NULL),
('mnft0ci7796586cca4', 1, 2, NULL, 'audio', 'completed', '2026-04-01 08:48:43', '2026-04-01 08:49:02', 0, 0, 18, NULL),
('mnft0umg4f05991392', 1, 2, NULL, 'audio', 'completed', '2026-04-01 08:49:09', '2026-04-01 08:49:15', 0, 0, 5, NULL),
('mnft221380f59ca0f7', 2, 1, NULL, 'video', 'completed', '2026-04-01 08:50:05', '2026-04-01 08:50:16', 0, 0, 11, NULL),
('mnft6k1ef2823e3e99', 2, 1, NULL, 'video', 'completed', '2026-04-01 08:53:35', '2026-04-01 08:53:54', 0, 0, 19, NULL),
('mnftd1xr836bf6f099', 2, 1, NULL, 'video', 'missed', '2026-04-01 08:58:34', NULL, 0, 0, 0, NULL),
('mnftdhmn7ee1cf8dba', 1, 2, NULL, 'video', 'completed', '2026-04-01 08:58:57', '2026-04-01 09:01:13', 0, 0, 136, NULL),
('mnftfyos925321b5e8', 6, 1, NULL, 'audio', 'rejected', '2026-04-01 09:00:50', '2026-04-01 09:00:58', 0, 0, 0, NULL),
('mnftgdsd641487953d', 6, 1, NULL, 'video', 'completed', '2026-04-01 09:01:15', '2026-04-01 09:02:21', 0, 0, 65, NULL),
('mnfti3on798ee4761a', 6, 1, NULL, 'video', '', '2026-04-01 09:02:33', NULL, 0, 0, 0, NULL),
('mnftikf887202a7323', 2, 1, NULL, 'video', 'completed', '2026-04-01 09:02:53', '2026-04-01 09:03:00', 0, 0, 7, NULL),
('mnftivlnaad40ef5c4', 2, 1, NULL, 'video', 'completed', '2026-04-01 09:03:07', '2026-04-01 09:03:10', 0, 0, 2, NULL),
('mnftj2dh5623397528', 6, 1, NULL, 'video', 'completed', '2026-04-01 09:03:18', '2026-04-01 09:03:34', 0, 0, 16, NULL),
('mnftjutv8bd6c0ee4a', 6, 1, NULL, 'video', '', '2026-04-01 09:03:57', NULL, 0, 0, 0, NULL),
('mnfw2zxye98eb7628c', 1, 6, NULL, 'video', 'completed', '2026-04-01 10:14:57', '2026-04-01 10:15:02', 0, 0, 5, NULL),
('mnfw3k1be605c691de', 1, 6, NULL, 'video', 'completed', '2026-04-01 10:15:13', '2026-04-01 10:17:44', 0, 0, 151, NULL),
('mnfw69n20ce5f0da9a', 5, 6, NULL, 'video', 'completed', '2026-04-01 10:17:26', '2026-04-01 10:17:36', 0, 0, 9, NULL),
('mnfw6y9med620f7759', 5, 6, NULL, 'video', 'completed', '2026-04-01 10:17:52', '2026-04-01 10:18:00', 0, 0, 7, NULL),
('mnfwfi4t3c3ab0a647', 5, 6, NULL, 'video', '', '2026-04-01 10:24:31', NULL, 0, 0, 0, NULL),
('mnfx61efd4d1387dd3', 6, 1, NULL, 'video', '', '2026-04-01 10:45:12', NULL, 0, 0, 0, NULL),
('mnfx6ddwc5bbe275ec', 1, 6, NULL, 'video', 'completed', '2026-04-01 10:45:25', '2026-04-01 10:50:36', 0, 0, 311, NULL),
('mnfxft2e40548b5236', 6, 1, NULL, 'video', 'completed', '2026-04-01 10:52:46', '2026-04-01 10:53:08', 0, 0, 22, NULL),
('mnfxkvpvce459f3a28', 6, 1, NULL, 'video', 'completed', '2026-04-01 10:56:40', '2026-04-01 10:56:52', 0, 0, 11, NULL),
('mnfxlg3a95d4b57a41', 1, 6, NULL, 'video', 'completed', '2026-04-01 10:57:11', '2026-04-01 10:59:42', 0, 0, 150, NULL),
('mnfxoz8b445b25f135', 1, 6, NULL, 'video', 'completed', '2026-04-01 10:59:52', '2026-04-01 11:00:04', 0, 0, 11, NULL),
('mnfxpcrw1f0a69463c', 1, 6, NULL, 'video', 'completed', '2026-04-01 11:00:10', '2026-04-01 11:04:18', 0, 0, 247, NULL),
('mnfxx7l211f3c7f5d3', 1, 6, NULL, 'video', 'completed', '2026-04-01 11:06:20', '2026-04-01 11:06:29', 0, 0, 8, NULL),
('mnfxxmdr72a6caf736', 1, 6, NULL, 'video', 'completed', '2026-04-01 11:06:35', '2026-04-01 11:08:01', 0, 0, 85, NULL),
('mnfxzogr6ab9106382', 1, 6, NULL, 'video', 'missed', '2026-04-01 11:08:08', NULL, 0, 0, 0, NULL),
('mnfxzujcc805fb862b', 1, 6, NULL, 'video', 'completed', '2026-04-01 11:08:22', '2026-04-01 11:09:12', 0, 0, 50, NULL),
('mng0fnz13655479239', 1, 6, NULL, 'video', '', '2026-04-01 12:16:47', NULL, 0, 0, 0, NULL),
('mng0g83i0bea4df1e4', 1, 6, NULL, 'video', 'completed', '2026-04-01 12:17:03', '2026-04-01 12:17:24', 0, 0, 21, NULL),
('mng0gwnu52bd880a4f', 6, 1, NULL, 'video', '', '2026-04-01 12:17:37', NULL, 0, 0, 0, NULL),
('mnh6epql8906cc90cc', 2, 1, NULL, 'video', '', '2026-04-02 07:51:37', NULL, 0, 0, 0, NULL),
('mnhbv4wmbf0603856e', 1, 6, NULL, 'video', '', '2026-04-02 10:24:23', NULL, 0, 0, 0, NULL),
('mnkb4he9409b2a75fe', 9, 1, NULL, 'video', '', '2026-04-04 12:27:00', NULL, 0, 0, 0, NULL),
('mnkb8sqhe341e7ddf1', 1, 9, NULL, 'video', 'missed', '2026-04-04 12:30:13', NULL, 0, 0, 0, NULL),
('mnkb943i2fa7305e67', 1, 9, NULL, 'video', '', '2026-04-04 12:30:31', NULL, 0, 0, 0, NULL),
('mnoh0wzpcb55fd8f74', 1, 6, NULL, 'video', '', '2026-04-07 10:23:10', NULL, 0, 0, 0, NULL),
('mnoh1lhu447d473bb1', 6, 1, NULL, 'video', 'completed', '2026-04-07 10:23:43', '2026-04-07 10:24:38', 0, 0, 54, NULL),
('mnoh2x7nd4638dc80d', 6, 1, NULL, 'video', 'completed', '2026-04-07 10:24:45', '2026-04-07 10:24:51', 0, 0, 5, NULL),
('mnoh63zv2630bf1fa1', 6, 1, NULL, 'audio', '', '2026-04-07 10:27:13', NULL, 0, 0, 0, NULL),
('mnoh7f7z2111648a30', 2, 1, NULL, 'video', '', '2026-04-07 10:28:14', NULL, 0, 0, 0, NULL),
('mnoh804vb01b626d49', 1, 2, NULL, 'video', 'completed', '2026-04-07 10:28:40', '2026-04-07 10:28:46', 0, 0, 5, NULL),
('mnohdk91cd24140417', 2, 1, NULL, 'video', '', '2026-04-07 10:33:02', NULL, 0, 0, 0, NULL),
('mnohdzcqfff266d702', 1, 2, NULL, 'video', '', '2026-04-07 10:33:21', NULL, 0, 0, 0, NULL),
('mnohggic0bb531b68e', 2, 1, NULL, 'video', 'completed', '2026-04-07 10:35:17', '2026-04-07 10:45:22', 0, 0, 605, NULL),
('mnoj1i8p7cd53132ef', 2, 1, NULL, 'video', 'completed', '2026-04-07 11:19:38', '2026-04-07 11:23:24', 0, 0, 225, NULL),
('mnoj6tla66710e9463', 1, 2, NULL, 'video', '', '2026-04-07 11:23:47', NULL, 0, 0, 0, NULL),
('mnojaiy67da523cd71', 1, 2, NULL, 'video', 'completed', '2026-04-07 11:26:40', '2026-04-07 11:28:17', 0, 0, 97, NULL),
('mnojf7h7c9754c485e', 1, 2, NULL, 'video', 'missed', '2026-04-07 11:30:14', NULL, 0, 0, 0, NULL),
('mnojfnpu3f10431553', 2, 1, NULL, 'video', 'completed', '2026-04-07 11:30:39', '2026-04-07 11:35:34', 0, 0, 295, NULL),
('moo81yqkd8d4cbbfa2', 1, 2, NULL, 'video', 'completed', '2026-05-02 10:51:49', '2026-05-02 10:52:14', 0, 0, 25, NULL),
('moquttls19de5fc030', 1, 2, NULL, 'video', 'completed', '2026-05-04 07:04:50', '2026-05-04 07:06:38', 0, 0, 107, NULL),
('mowqnt4u62226cca02', 1, 2, NULL, 'video', 'completed', '2026-05-08 09:54:49', '2026-05-08 09:55:13', 0, 0, 24, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `chat_groups`
--

CREATE TABLE `chat_groups` (
  `id` varchar(40) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(300) DEFAULT NULL,
  `group_pic` varchar(500) DEFAULT NULL,
  `admin_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`admin_ids`)),
  `created_by` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chat_groups`
--

INSERT INTO `chat_groups` (`id`, `name`, `description`, `group_pic`, `admin_ids`, `created_by`, `created_at`) VALUES
('mncsruxw8120k', 'mas', NULL, NULL, NULL, 6, '2026-03-30 11:48:48'),
('mned8a762x38c', 'video', NULL, NULL, NULL, 1, '2026-03-31 14:09:11');

-- --------------------------------------------------------

--
-- Table structure for table `chat_settings`
--

CREATE TABLE `chat_settings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `chat_key` varchar(64) NOT NULL,
  `disappearing_msgs` enum('off','24h','7d','30d') DEFAULT 'off',
  `theme` varchar(30) DEFAULT 'default',
  `wallpaper` varchar(500) DEFAULT NULL,
  `is_locked` tinyint(1) DEFAULT 0,
  `lock_pin_hash` varchar(255) DEFAULT NULL,
  `is_archived` tinyint(1) DEFAULT 0,
  `is_muted` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chat_settings`
--

INSERT INTO `chat_settings` (`id`, `user_id`, `chat_key`, `disappearing_msgs`, `theme`, `wallpaper`, `is_locked`, `lock_pin_hash`, `is_archived`, `is_muted`, `created_at`, `updated_at`) VALUES
(1, 1, 'p:sonu', 'off', 'default', NULL, 1, '$2a$10$d3cymsn.3wHFCGlLtdmJUO5oloid3TqAoyBSTFW4OXLSMvP93J80C', 0, 0, '2026-03-30 22:39:16', '2026-04-02 13:41:11'),
(5, 1, 'p:Sanket New', 'off', 'default', NULL, 0, '$2a$10$j4fHna2lkBDFK7UPQiqAVePP9TgJmD1ZdAL2zzcGP4EaUIco39FgS', 0, 0, '2026-03-30 22:56:43', '2026-04-01 17:44:41'),
(10, 6, 'p:ajay', 'off', 'default', NULL, 1, '$2a$10$8Iy1sGZz5.rOEA5/GHogGumyTbSXlHgWN3kZdf3lUD/WC93s.A5f6', 0, 0, '2026-03-31 12:17:25', '2026-03-31 12:22:51'),
(11, 7, 'p:sonu', 'off', 'rose', NULL, 0, NULL, 0, 0, '2026-03-31 12:17:26', '2026-03-31 12:17:31'),
(38, 1, 'g:mned8a762x38c', 'off', 'sunset', NULL, 0, NULL, 0, 0, '2026-04-01 17:44:06', '2026-04-01 17:44:08');

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `contact_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `user_id`, `contact_id`, `created_at`) VALUES
(1, 1, 7, '2026-03-30 08:17:49'),
(2, 7, 1, '2026-03-30 08:17:49'),
(5, 2, 1, '2026-03-30 11:21:05'),
(6, 1, 2, '2026-03-30 11:21:05'),
(9, 2, 7, '2026-03-30 12:47:34'),
(10, 7, 2, '2026-03-30 12:47:34'),
(31, 1, 8, '2026-03-30 18:35:05'),
(32, 8, 1, '2026-03-30 18:35:05'),
(33, 8, 2, '2026-03-30 18:36:49'),
(34, 2, 8, '2026-03-30 18:36:49'),
(35, 6, 1, '2026-03-31 06:37:09'),
(36, 1, 6, '2026-03-31 06:37:09'),
(59, 6, 5, '2026-03-31 06:57:24'),
(60, 5, 6, '2026-03-31 06:57:24'),
(63, 1, 9, '2026-03-31 08:35:41'),
(64, 9, 1, '2026-03-31 08:35:41'),
(65, 6, 9, '2026-03-31 08:37:53'),
(66, 9, 6, '2026-03-31 08:37:53');

-- --------------------------------------------------------

--
-- Table structure for table `group_members`
--

CREATE TABLE `group_members` (
  `id` int(11) NOT NULL,
  `group_id` varchar(40) NOT NULL,
  `user_id` int(11) NOT NULL,
  `joined_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `group_members`
--

INSERT INTO `group_members` (`id`, `group_id`, `user_id`, `joined_at`) VALUES
(1, 'mncsruxw8120k', 6, '2026-03-30 11:48:48'),
(2, 'mncsruxw8120k', 1, '2026-03-30 11:48:48'),
(3, 'mncsruxw8120k', 5, '2026-03-30 11:48:48'),
(4, 'mned8a762x38c', 1, '2026-03-31 14:09:11'),
(5, 'mned8a762x38c', 6, '2026-03-31 14:09:11'),
(6, 'mned8a762x38c', 9, '2026-03-31 14:09:11');

-- --------------------------------------------------------

--
-- Table structure for table `live_locations`
--

CREATE TABLE `live_locations` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `chat_user_id` int(11) DEFAULT NULL,
  `group_id` varchar(30) DEFAULT NULL,
  `message_id` varchar(30) DEFAULT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `session_id` varchar(40) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` varchar(40) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) DEFAULT NULL,
  `group_id` varchar(40) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `content_iv` varchar(64) DEFAULT NULL,
  `msg_type` enum('text','image','file','audio','video','call','location','contact','voice_note','video_note') DEFAULT 'text',
  `file_path` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `is_edited` tinyint(1) DEFAULT 0,
  `deleted_both` tinyint(1) DEFAULT 0,
  `deleted_for` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`deleted_for`)),
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `disappears_at` datetime DEFAULT NULL,
  `reply_to_id` varchar(40) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `group_id`, `content`, `content_iv`, `msg_type`, `file_path`, `file_name`, `file_size`, `file_type`, `is_edited`, `deleted_both`, `deleted_for`, `created_at`, `updated_at`, `disappears_at`, `reply_to_id`) VALUES
('mn8tnsd82licf', 1, 2, NULL, 'b04f31fe02b37609182ef1d9833f0b75', '467d72c339d0f72a63c9d41cb720aafa', 'text', NULL, NULL, NULL, NULL, 0, 0, '[1, 1]', '2026-03-27 17:15:19', '2026-04-02 13:40:49', NULL, NULL),
('mn8u4rkp3nmbt', 1, 2, NULL, 'aec48180687d709f33ce727da67622d2', '89590a50b6e22b854532bc23ae583725', 'text', NULL, NULL, NULL, NULL, 0, 0, '[1, 1]', '2026-03-27 17:15:44', '2026-04-02 13:40:49', NULL, NULL),
('mn8u54ibh0ld4', 2, 1, NULL, 'f898af769741aa43172b16251644b18c', '6bcf9146a3f9a67431e14d4729b11925', 'text', NULL, NULL, NULL, NULL, 1, 1, '[1, 1]', '2026-03-27 17:16:00', '2026-04-02 13:40:49', NULL, NULL),
('mn8u5chv85els', 1, 2, NULL, 'ede8e2af8679b70279991cd536084062', '08788ebe91e8534b86de792009e21992', 'text', NULL, NULL, NULL, NULL, 0, 0, '[1, 1]', '2026-03-27 17:16:11', '2026-04-02 13:40:49', NULL, NULL),
('mn8u6k7or0q4d', 2, 1, NULL, NULL, NULL, 'image', '/uploads/1774612027838-0a37e19c84b6.png', 'icons8-plus-100 (1).png', 1358, 'image/png', 0, 0, '[1, 1]', '2026-03-27 17:17:07', '2026-04-02 13:40:49', NULL, NULL),
('mn8uq6xvd9jxt', 3, 4, NULL, '071ce180c823e9ce8a38df6ee7183071', '9532d28c67b7afd9d7547243ac3fd886', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-27 17:32:25', '2026-03-27 17:32:25', NULL, NULL),
('mn8v7svhj56jj', 1, 4, NULL, '6b89ca61da87b289f0fd81c3072f2254', 'f437158df139be79841098ef11ab5e78', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-27 17:46:05', '2026-03-27 17:46:05', NULL, NULL),
('mn8vdsmda54j2', 1, 4, NULL, NULL, NULL, 'file', '/uploads/1774614044931-862d89a94788.pdf', 'GURUWA SINGH MUNDA  ADCA C Bundu.pdf', 555081, 'application/pdf', 0, 1, NULL, '2026-03-27 17:50:44', '2026-03-27 17:50:51', NULL, NULL),
('mncry5sgjewdo', 5, 2, NULL, '5a89475f74c39fd49999d9d2746b805e', 'f305594c9a777dc70ad2c7e12273dff8', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-30 11:25:43', '2026-03-30 11:25:43', NULL, NULL),
('mncrygl1o5gyk', 5, 2, NULL, '173b77f1ccffeecb433c53b9e745e105', '89a696543a2eecb66d15fe25b691240a', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-30 11:25:57', '2026-03-30 11:25:57', NULL, NULL),
('mncrz0bhmrxhn', 5, 2, NULL, '7fbe9396fdfd03f6eee942b3973d308b', 'ac45bce40ad6a66d363e99329a93b4d3', 'text', NULL, NULL, NULL, NULL, 0, 1, NULL, '2026-03-30 11:26:23', '2026-03-30 11:27:38', NULL, NULL),
('mncs0ewwfxp1b', 5, 3, NULL, '1371fbe6f077eaa61bddfea02ac74434', '151c5f873659ca8941c52d3348cc5d84', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-30 11:27:28', '2026-03-30 11:27:28', NULL, NULL),
('mncs1dumhijxl', 5, 2, NULL, NULL, NULL, 'file', '/uploads/1774850293561-d4ef650c483a.pdf', '1690288584_PT06 protocol.pdf', 174520, 'application/pdf', 0, 0, NULL, '2026-03-30 11:28:13', '2026-03-30 11:28:13', NULL, NULL),
('mncs84fu0y7su', 2, 1, NULL, '638f7a0f1f6d41d6dbcab12b27812e2c', '3a8d28ec73853c1a6c0f3a8b6210fd59', 'text', NULL, NULL, NULL, NULL, 0, 0, '[1, 1]', '2026-03-30 11:33:26', '2026-04-02 13:40:49', NULL, NULL),
('mncsqsio8r1uj', 6, 1, NULL, '31b591fc45568bd59a6f7a8d43d38329', '168a685f891346f739c388e66cb4716e', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-30 11:47:58', '2026-03-30 11:47:58', NULL, NULL),
('mncsqxf8urxtw', 5, 6, NULL, '80714299a17a0c3b0e8ec28d6ed02a06', '0012fbf66be7da365dd1cd8f8a58aa04', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-30 11:48:05', '2026-03-30 11:48:05', NULL, NULL),
('mncsr1fbdfmzk', 5, 6, NULL, '8950dedbae01895f73d24cb8139e7693', 'f9df90eb411e2fd12c492e24782e823b', 'text', NULL, NULL, NULL, NULL, 0, 1, NULL, '2026-03-30 11:48:10', '2026-03-30 11:48:19', NULL, NULL),
('mncsr8t0ar3u8', 6, 5, NULL, '6c304380f63fa374bc81872869795f16', 'e620270f45dbbb878d2bbbbdd447cc18', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-30 11:48:20', '2026-03-30 11:48:20', NULL, NULL),
('mncsrzed15g0c', 6, NULL, 'mncsruxw8120k', '363ff1fee4677278e51460747414efc4', '8c0b4ad80ded85ebd926167c2f730a10', 'text', NULL, NULL, NULL, NULL, 1, 0, NULL, '2026-03-30 11:48:54', '2026-03-30 11:49:21', NULL, NULL),
('mncss4uct1wro', 5, NULL, 'mncsruxw8120k', '7b0b3c1ae7c6669544fb1cf79270c7b6', 'd6d5f47a405a039fb20be5c24264c670', 'text', NULL, NULL, NULL, NULL, 1, 0, NULL, '2026-03-30 11:49:01', '2026-03-30 11:49:18', NULL, NULL),
('mncx301uadsmx', 1, 7, NULL, '28ffc91e7ac6fe1991bd44b88dc3e158a34616f0e50514d13a47a99fb5afc05cd36ca80d92f69cbc446dea53dbf1722bc5ff47ff50e8b1cedf5af9bebe904f25', 'c125feb8351d888c8fc535776c678c45', '', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-30 13:49:55', '2026-03-30 13:49:55', NULL, NULL),
('mnd3kq9qhpe0w', 2, 1, NULL, '675ff50ba214daf937d5fc8362d2a07f', '65be5a80cd1ae5be06dfcc78a70b6187', 'text', NULL, NULL, NULL, NULL, 0, 0, '[1, 1]', '2026-03-30 16:51:10', '2026-04-02 13:40:49', NULL, NULL),
('mnd6qe9vp42vc', 2, 7, NULL, 'edf11970b52a4dee00b0a3b1a2201fc4', '9ced73f4cd8c1e464d5e7702b68f0587', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-30 18:19:33', '2026-03-30 18:19:33', NULL, NULL),
('mndfym3zoxxwn', 1, 2, NULL, 'b1a84bb52aa2589e8c13c4d3f100e2c7f7f3536246bc26e771c328d0991a2f87589a344264da8b107042f8ea9a7f977d346dcb9121672eef5a247bad1e02f614d2c8ef681ba51ed68c7ccdc9bc047149', '9c1cb3d79df5290697aeeba5b8b9dac9', '', NULL, NULL, NULL, NULL, 0, 0, '[1, 1]', '2026-03-30 22:37:53', '2026-04-02 13:40:49', NULL, NULL),
('mndgpkp8bt4ok', 1, 2, NULL, 'cda9cb56e7c49b58a17f2a99e00aaa89', '2d2b3c0c24593a5f5ce22920a410db88', 'text', NULL, NULL, NULL, NULL, 0, 0, '[1, 1]', '2026-03-30 22:58:51', '2026-04-02 13:40:49', NULL, NULL),
('mndgxolzqbwat', 1, 2, NULL, '053686e8721f12a268192f7048231541', '4b2d32c0a34d3404959f0012247c2c16', 'text', NULL, NULL, NULL, NULL, 0, 0, '[1, 1]', '2026-03-30 23:05:09', '2026-04-02 13:40:49', NULL, NULL),
('mndh3ohpaf8jq', 1, 2, NULL, '2d3d7472d389bd94401fa3651ed10477c1bfe5c6541a651147ed1e8b13f6e3980a1ec482dd359031e7f71dca92489295f332426a0ff320694d1c13ab890f5778cca2964e6afd1159be9c274e236c6176621706fc5ea5f4692a8c0ff38d87fc40', 'cdbfb2cc1a38ab9c0ae9789857a651a3', '', NULL, NULL, NULL, NULL, 0, 0, '[1, 1]', '2026-03-30 23:09:49', '2026-04-02 13:40:49', NULL, NULL),
('mnditt299ni9f', 1, 2, NULL, '310b0fa70182e1096eb137ac78d0440e', '648c184d413ab86109f44eb0bfaf3e8d', 'text', NULL, NULL, NULL, NULL, 0, 0, '[1, 1]', '2026-03-30 23:58:07', '2026-04-02 13:40:49', NULL, NULL),
('mne8vi8jhy23j', 6, 1, NULL, 'e836fff7f98aade35f80f01937e9e2ed', '37ccfa76e21dc086773102fe6f554964', 'text', NULL, NULL, NULL, NULL, 1, 1, NULL, '2026-03-31 12:07:18', '2026-03-31 12:07:46', NULL, NULL),
('mne8wtwp3ipv0', 6, 1, NULL, 'b9fcdf3c6dabbbc09d09954579b9fce2cfa7ddcbf178099f0fc256a3d17c68e37870b9860741df0178da69ca93696458b3047e8151ec9083fcfe4bd874b469f9765c1e5b9612c780905b6f73cf7f96ed0bb6b9e324a020a9103cd0d9ea01565f', 'd19c645a9c378d649b3b081ef93b9ed9', '', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-31 12:08:20', '2026-03-31 12:08:20', NULL, NULL),
('mne8y0x6k6sov', 7, 1, NULL, '88290641033c77231f5862cbe3febca2', '609416965a490cde99af6f94ab4af00d', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-31 12:09:15', '2026-03-31 12:09:15', NULL, NULL),
('mne9bmomr0xi1', 6, 1, NULL, 'a2803e84a276b935f588213c4dd7aeb5', '51d0ed2339d557b7d1bdb5780ebc6d45', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-31 12:19:50', '2026-03-31 12:19:50', NULL, NULL),
('mne9chw96cteq', 6, 1, NULL, 'f549825f32e0cf81005472c11cf5efd5', '0672c2ef2c07ce93c83e94f3da44369a', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-31 12:20:31', '2026-03-31 12:20:31', NULL, NULL),
('mne9cjnkhbh56', 6, 1, NULL, '0b7294f84bc43b02fe63682bdb70cd76', '9cc9d582a07aeddb58792172bbc35244', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-31 12:20:33', '2026-03-31 12:20:33', NULL, NULL),
('mne9cql5nujy0', 1, 6, NULL, '4c3ba1da5e0b957b69575aaedc26cfae', '49665bc04355ee0a684a06b2f90b0e1f', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-31 12:20:41', '2026-03-31 12:20:41', NULL, NULL),
('mne9crpv7xg45', 1, 6, NULL, '48a06c3dce6235f7b9f7496a4e9fb574', '4a031be15bc340397485555f164aae9a', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-31 12:20:42', '2026-03-31 12:20:42', NULL, NULL),
('mne9csnu9qx25', 1, 6, NULL, '093f9ed3e0f4750508000d56ffeadf5c', '1fdbb62e44e52d84c3d0bfd9a9e70869', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-31 12:20:43', '2026-03-31 12:20:43', NULL, NULL),
('mne9eitv43utm', 1, 6, NULL, NULL, NULL, 'image', '/uploads/1774939924346-ad1f1e913449.webp', 'preview.webp', 64306, 'image/webp', 0, 0, NULL, '2026-03-31 12:22:04', '2026-03-31 12:22:04', NULL, NULL),
('mne9itt2pmerm', 6, 1, NULL, 'ea592ee9c25d6637178ed285309077be2b6c904a84452e2ad957019c7c29d2d66840c396f82bef040b2e43d1a5dd97e7da9ad750a795e5ad75bf1b4ca44835493616a37d426a03bff6e058aadc40127a09ed597c52dc7aeef589cdcca97da1eb', '909f129e06de5d13ea5a25691cbd5f0d', '', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-31 12:25:26', '2026-03-31 12:25:26', NULL, NULL),
('mne9lgpbi5leg', 6, 5, NULL, 'e915fa53608e0b55f90319dc98e9ef89', '9560df2c498f4c0ee184407996bbbc18', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-31 12:27:29', '2026-03-31 12:27:29', NULL, NULL),
('mnej4ra37ws5g', 1, 6, NULL, 'caad52db75d6beb3fe5d151a45e31d913eb8a5326fa46a29a11cc50609c715da1ecef9f3ad605d2f76f4d24cf5b63e47378412f234018beed745d1a294f3686485a7f10b8d2e89167ae04379eafa0292a0770a8837032c745aa0afcd5c03c25f', '67d184d40b14c7dd1a806370e78716ef', 'contact', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-31 16:54:24', '2026-03-31 16:54:24', NULL, NULL),
('mnej55fcoor6o', 1, 2, NULL, '5100c07ee87dd86120ac9f232bd5c07b0801f2f62358e38ecd5329c3080e99f5c6330ca9f1da71039ec2d44e2447e6e1c792dcfdfba057984a7a221f8b6236f010bbca3de2e55fb560df6cd3762d3a87', '092fe756374d7ee377a512f81434b5e1', 'contact', NULL, NULL, NULL, NULL, 0, 0, '[1, 1]', '2026-03-31 16:54:43', '2026-04-02 13:40:49', NULL, NULL),
('mnfq0nhzgxua1', 1, 2, NULL, '5e7f1bd155bf5a623660f7af8294c469', 'e1d3f58a71f268de19f1d5e39240b298', 'text', NULL, NULL, NULL, NULL, 0, 0, '[1, 1]', '2026-04-01 12:56:09', '2026-04-02 13:40:49', NULL, NULL),
('mnfq90yhiw0rg', 1, 2, NULL, 'ce8d2df48e38ea54580d13b1af44c5a2', '1b961a928e14581217b4f6afadd04075', 'text', NULL, NULL, NULL, NULL, 0, 0, '[1, 1]', '2026-04-01 13:01:27', '2026-04-02 13:40:49', NULL, NULL),
('mnfqb4u2wd4uw', 1, 2, NULL, NULL, NULL, 'voice_note', '/uploads/1775028785968-9a5c9e83877c.webm', 'voice_1775028785916.webm', 112161, 'audio/webm', 0, 0, '[1, 1]', '2026-04-01 13:03:05', '2026-04-02 13:40:49', NULL, NULL),
('mnfqc8ykx5gjj', 1, 2, NULL, NULL, NULL, 'image', '/uploads/c-1775028837908-a610759dcc0f.jpg', 'preview.jpg', 43846, 'image/jpeg', 0, 0, '[1, 1]', '2026-04-01 13:03:57', '2026-04-02 13:40:49', NULL, NULL),
('mnfqe0kjqpzde', 1, 2, NULL, '5d686f1b4644e38095571424479ce117', 'a5d5d596860375d47b348c9ad9d96214', 'text', NULL, NULL, NULL, NULL, 0, 0, '[1, 1]', '2026-04-01 13:05:20', '2026-04-02 13:40:49', NULL, NULL),
('mnfr3718tf1gl', 1, 7, NULL, 'c5206ed4dbc2f0f74ff90260e02c0d7d8ae623464c4b1bc272f0aa828d07491f722661fd89fc7d52329862523166f079e5be9d8cac915f81cd4ea23ad3181ef112c9110425d0a3dda56c7f0df7bff1b051251b8445b731fb2fd65bc67baa1f56', '90368c7044ebe8274735094799e654a3', 'contact', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-01 13:24:55', '2026-04-01 13:24:55', NULL, NULL),
('mnfscwt55c6b7eb51d', 1, 6, NULL, 'aea9769f0969f22e0262f4e0016c7a4eb841cd490eddb363805a9db2db5cb273af8ffb82abbaf8a2c4f9829bfe2f05f3', '41c1d5e21166eab706a37ad733cfcc1b', 'contact', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-01 14:00:28', '2026-04-01 14:00:28', NULL, NULL),
('mnfsfmpq6504d08092', 1, 6, NULL, 'a906979f890dec4185918c7495b9b0c778bc049085edb066b4d7ed5ca59b59b8c25b1aa27baa649a9b68ec423bc686ac', 'a4877cad8f733efb39ab660896b02d2a', 'contact', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-01 14:02:35', '2026-04-01 14:02:35', NULL, NULL),
('mnfstjzfb19f38692b', 1, 6, NULL, '3d78a505121a1bea7621b980534e7433b9121d7444d779998c807bae449c04a954741dc6830db452299661ca50423bee', 'b4e08d6d6b0a11e5377ccf6c8ca34120', 'contact', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-01 14:13:24', '2026-04-01 14:13:24', NULL, NULL),
('mnft072hc303f', 2, 1, NULL, '2dc829d4d83393a4bc5ea376b7a3fac4', 'ba5be9d98b12c5af8c664e92ce702fac', 'text', NULL, NULL, NULL, NULL, 0, 0, '[1, 1]', '2026-04-01 14:18:34', '2026-04-02 13:40:49', NULL, NULL),
('mnft0akg9jr44', 2, 1, NULL, '704e6bf7da1874810df6f447328a1e19', '986e506a0fb38e1953f662685b05ecd7', 'text', NULL, NULL, NULL, NULL, 0, 0, '[1, 1]', '2026-04-01 14:18:39', '2026-04-02 13:40:49', NULL, NULL),
('mnft4ymq09b9l', 1, 2, NULL, 'eb94a77fa12aaf001f7083474cb98c11', '53b36d53275c061459f5c85f221dc2bf', 'text', NULL, NULL, NULL, NULL, 0, 0, '[1, 1]', '2026-04-01 14:22:41', '2026-04-02 13:40:49', NULL, NULL),
('mnft5qao6tif1', 1, 2, NULL, '2b68dbe6760b77c8bb4da7c3c4d1a6ad', '5b763188d05aa62e3e063bbb7f5cec5a', 'text', NULL, NULL, NULL, NULL, 0, 0, '[1, 1]', '2026-04-01 14:22:52', '2026-04-02 13:40:49', NULL, NULL),
('mnftljlcdwide', 6, 1, NULL, '5b30b198f091a63f1f3990153cb27847', 'bb1af965e4eb331d4005919c87eee67f', 'image', '/uploads/c-1775034310362-df2961621f36.jpg', 'WhatsApp Image 2026-03-31 at 8.20.08 AM (1).jpg', 10425, 'image/jpeg', 0, 0, NULL, '2026-04-01 14:35:10', '2026-04-01 14:35:10', NULL, NULL),
('mnfwg65m5le4e', 5, 6, NULL, '37184c19ac10c5412218de13a1c74db3', '8daa70033cdafc95c683bd026862aa4d', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-01 15:54:58', '2026-04-01 15:54:58', NULL, NULL),
('mnfwgkrtcebz0', 5, 6, NULL, NULL, NULL, 'image', '/uploads/c-1775039117352-73a8f657d711.jpg', 'image.jpg', 18061, 'image/jpeg', 0, 0, NULL, '2026-04-01 15:55:17', '2026-04-01 15:55:17', NULL, NULL),
('mng0dvnx1u41l', 1, 6, NULL, '14fa0f653c4af4fd19d965175d40d15a', '8420ed138dc978c3b87d6342b47db312', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-01 17:45:10', '2026-04-01 17:45:10', NULL, 'mne9cql5nujy0'),
('mng0e3tr9q8rl', 1, 8, NULL, '764632d7d7a14df276d88abe336200a1', '3fc0eae26b408491f788c1dd94b7eecc', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-01 17:45:20', '2026-04-01 17:45:20', NULL, NULL),
('mng0ja1pcwy8i', 6, 1, NULL, '97f4c58697ffaeb649847bc59e080b96', '58a81e1000b2c2e805f9f1e7c256824c', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-01 17:49:22', '2026-04-01 17:49:22', NULL, 'mnftljlcdwide'),
('mng0jf0muvt0r', 6, 9, NULL, '844a9e6da0e7f54e6b38e8fb580316c4', 'e12f8b7dbc39f73e85cadf5f0b899d39', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-01 17:49:28', '2026-04-01 17:49:28', NULL, NULL),
('mng0jwkf8241w', 6, 5, NULL, 'ccdf2a0c2f19b07810967fc822eaa42c', '9a73c0bc522f010a6d0923d06e473a1d', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-01 17:49:51', '2026-04-01 17:49:51', NULL, NULL),
('mng0k2qriaepl', 1, 8, NULL, '17c68e768b72fc845a13c2a2efa32da8', 'b072435e477d46ab58d4368d9be586bf', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-01 17:49:59', '2026-04-01 17:49:59', NULL, NULL),
('mng0kgssynghh', 6, 1, NULL, NULL, NULL, 'image', '/uploads/c-1775039117352-73a8f657d711.jpg', 'image.jpg', 18061, 'image/jpeg', 0, 0, NULL, '2026-04-01 17:50:17', '2026-04-01 17:50:17', NULL, NULL),
('mnh6fxafhswnt', 2, 1, NULL, '7da2bd2254b6983b1cbcfe5086d6fd9a', 'c534f6a571b5b9648bd857cb3101249d', 'text', NULL, NULL, NULL, NULL, 0, 0, '[1]', '2026-04-02 13:22:30', '2026-04-02 13:40:49', NULL, NULL),
('mnh6gv67ro0xx', 2, 1, NULL, 'fcd214e7e9a35120c39b211f526e49ab55bd666b2775daeb209cb0449d2804d8b0a91a93b3392b864f5192016775d9053a6fb407431e54fd1c7d7e4b0f125ce9fcb71c06b905df85218a40fc53a7fd96', 'a427ac9868453b89d4a2a69ed558ac35', 'contact', NULL, NULL, NULL, NULL, 0, 0, '[1]', '2026-04-02 13:28:24', '2026-04-02 13:40:49', NULL, NULL),
('mnh6ol4riku6f', 2, 1, NULL, 'e702592bca08eebcbf045789115834d7', 'aeab03d2e4269f75c0e2a5d288c42862', 'text', NULL, NULL, NULL, NULL, 0, 0, '[1]', '2026-04-02 13:29:14', '2026-04-02 13:40:49', NULL, NULL),
('mnh6p2d5uy4ju', 2, 1, NULL, '2866de4345931cad8ad4ed4f08a74061', '236ac1a1e22a29e0c42bfe09d32b8e53', 'text', NULL, NULL, NULL, NULL, 0, 0, '[1]', '2026-04-02 13:29:36', '2026-04-02 13:40:49', NULL, NULL),
('mnh6vsud6r1y6', 2, 1, NULL, NULL, NULL, 'image', '/uploads/c-1775117090839-e51f5353e562.jpg', 'IMG_0084.jpg', 60043, 'image/jpeg', 0, 0, '[1]', '2026-04-02 13:34:50', '2026-04-02 13:40:49', NULL, NULL),
('mnh734icztjxe', 1, 2, NULL, 'aac1bcbee01d5ff0d1f76c57f96244f6cc32fc26e77f05a275344cb80934e34835351722bc999f22430e9e9f7495410370c3c2b18cc210f1edc353996c75250e3111840b91925a6e34f5072886f71d71', '3f484d1085ed069730eea5bd7a3a5769', 'contact', NULL, NULL, NULL, NULL, 0, 0, '[1]', '2026-04-02 13:40:31', '2026-04-02 13:40:49', NULL, NULL),
('mnhbu6ofk2bjk', 1, 6, NULL, 'f24dd6f695c79d94d5473e2505e3c2fef59d7b8c69de1453b6c949edcde683ca', '50531773625b154626a7c7c3a13169ba', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:32', '2026-04-02 15:53:32', NULL, NULL),
('mnhbu7kz66ry0', 1, 6, NULL, 'd8380efb56a3e8dd6124c3bac0b8d1dc', '5ce1e2b19b45d6f35527efb4124d44e2', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:34', '2026-04-02 15:53:34', NULL, NULL),
('mnhbu83kjpw08', 1, 6, NULL, '98330c8202b61a2e5f02624214ab6c0e', '3307136d8d944ea79674714beacbd021', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:34', '2026-04-02 15:53:34', NULL, NULL),
('mnhbu8dcxfkh7', 1, 6, NULL, '47af9e406b15eee2988286bd6311f154', '4b39a1d497d14330695a34237f89a859', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:35', '2026-04-02 15:53:35', NULL, NULL),
('mnhbu8kcbpdhe', 1, 6, NULL, '876bad2a528223c59fdb384c2b312cee', 'f093644ca50f1b6cdfafdf1066c91b38', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:35', '2026-04-02 15:53:35', NULL, NULL),
('mnhbu8p21w8iw', 1, 6, NULL, 'd555f61d303c41a45254fb1092138d33', 'eb1f85a1826d5526c4a7a8965604f36e', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:35', '2026-04-02 15:53:35', NULL, NULL),
('mnhbu8ukor9u1', 1, 6, NULL, 'fb506155d10b1a19dd58fafea4f83d27', '2dc4dcd4acad57bc092348c652103d89', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:35', '2026-04-02 15:53:35', NULL, NULL),
('mnhbu8zmbjw29', 1, 6, NULL, 'c10b9895f83c30b2ec54b7d702e27245', '957c5103301ea892a8fd85b446086a3d', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:35', '2026-04-02 15:53:35', NULL, NULL),
('mnhbu94641y0f', 1, 6, NULL, 'c3523adf46b48a9cd5c155b987e6fa1d', '18026f541591fcc4772e88edf8d46ee1', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:36', '2026-04-02 15:53:36', NULL, NULL),
('mnhbu98pu0jm9', 1, 6, NULL, '2fd8d22d7599b03377f187b7aafc1784', '9d451012950bae19df8af3578d860724', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:36', '2026-04-02 15:53:36', NULL, NULL),
('mnhbu9d90mwn4', 1, 6, NULL, 'f50d4b8a3589a2d43553cacb8c8d274c', 'e39d98e9e79b86f12e4c46a4b5315e4d', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:36', '2026-04-02 15:53:36', NULL, NULL),
('mnhbu9iaivfng', 1, 6, NULL, 'ebdbe83d432fe49f6a88e84cc9e78ba5', 'b5b08588f63f45891a9481a3cd197cfd', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:36', '2026-04-02 15:53:36', NULL, NULL),
('mnhbu9mqku6ir', 1, 6, NULL, '28eafa71bc99e418a0061353bf3262bf', '982e3526e8dc10c58b05a5f1ed721f9b', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:36', '2026-04-02 15:53:36', NULL, NULL),
('mnhbu9r20rvir', 1, 6, NULL, '4330680569f7b9fe26ad255a8ed83c48', 'c0f5bd5f53610d623f5cb747e6dea674', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:36', '2026-04-02 15:53:36', NULL, NULL),
('mnhbu9vwlrt6o', 1, 6, NULL, '8d83a1bdd1a7c2fb22ee7a62876bb868', '212e76ba80901880f8d1afeeeb948456', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:37', '2026-04-02 15:53:37', NULL, NULL),
('mnhbua0a0m3dk', 1, 6, NULL, 'e92349f99c73cc257a063e343a2c5851', 'b4a2d3f9efd3118aca29dd6ec358abff', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:37', '2026-04-02 15:53:37', NULL, NULL),
('mnhbua53jtbt2', 1, 6, NULL, '17431468efa75087c6fd142025ee5186', 'a90a38d5003fba1f90ee9a89effea259', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:37', '2026-04-02 15:53:37', NULL, NULL),
('mnhbuaa0z2j4l', 1, 6, NULL, 'd8ed21b59bc567166b6cef55ab051666', '91b2e4512cfb39b0444c6128e07d6ec9', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:37', '2026-04-02 15:53:37', NULL, NULL),
('mnhbuael2ybex', 1, 6, NULL, 'f134d03ad5df03113b6c6424ed07e422', '12a4ef718fc37d3f6275de5215954597', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:37', '2026-04-02 15:53:37', NULL, NULL),
('mnhbuajbwadhq', 1, 6, NULL, 'f729afbe569b7e5c9726393a6bd3341e', 'db9874d0a87582dc5089cb05e80a1990', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:37', '2026-04-02 15:53:37', NULL, NULL),
('mnhbuaoikj2nd', 1, 6, NULL, '4264f7df2b1776ddcba05c7a879d74d9', '11f8c904b3f70d9518ecec4caee00b49', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:38', '2026-04-02 15:53:38', NULL, NULL),
('mnhbuatzuqovi', 1, 6, NULL, '9f42141c6a77f5e31a42975a45c010b3', '826f026b3c618f5882c0ceb078148fca', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:38', '2026-04-02 15:53:38', NULL, NULL),
('mnhbufrsb89qc', 1, 6, NULL, '148f95061b0ff6fd295d737199cb0288', '32137dd993e097304d01afe8751315a7', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:44', '2026-04-02 15:53:44', NULL, NULL),
('mnhbufwpr9991', 1, 6, NULL, 'c7eec111bb07d853d9c67aa4570ac8f6', '0e73ef33fcf2a1e562085ba0b1b1f558', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:44', '2026-04-02 15:53:44', NULL, NULL),
('mnhbug1ja2556', 1, 6, NULL, '7a6e5eca752faa7c4660608ab3e49cdd', 'fd9e748a42fcc6e930cac85495e830b8', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:45', '2026-04-02 15:53:45', NULL, NULL),
('mnhbug62z8v9x', 1, 6, NULL, '1680f682adf6e30ae6acc2578118170d', '2b302c4097a0056b5ac8796ee6d0adc4', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:45', '2026-04-02 15:53:45', NULL, NULL),
('mnhbugaqdo81k', 1, 6, NULL, '37758af138afbeb6ebb9cdb45a0e2023', '03b370723116f820abe6ed78fb398c0c', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:45', '2026-04-02 15:53:45', NULL, NULL),
('mnhbugeqb85ze', 1, 6, NULL, '527cb4df3381851a214e43393386ca26', 'e99dbd21c0cd9f2071816625a875348b', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:45', '2026-04-02 15:53:45', NULL, NULL),
('mnhbugilwq8z9', 1, 6, NULL, '99e629eec15c330d696441821eeba8e1', 'fb448775bf8e0192160c9f9d09081074', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:45', '2026-04-02 15:53:45', NULL, NULL),
('mnhbugmwq71eh', 1, 6, NULL, 'b04f245920b452fab819befe503f64fe', 'e1dfd838c46fba7a37200a1eb9fbcc6c', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:45', '2026-04-02 15:53:45', NULL, NULL),
('mnhbugvk772e9', 1, 6, NULL, 'c706b7b8230957b4fc2e47d386ce1bb0', 'b29d42ffd3b4f7b7a4a9c068828284b1', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:46', '2026-04-02 15:53:46', NULL, NULL),
('mnhbugzy3q8oj', 1, 6, NULL, '842942b4c787a400b21c3862ab84eddf', '1f21752a4b8a17b0a63d6bee4648eb82', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:46', '2026-04-02 15:53:46', NULL, NULL),
('mnhbuh4jwmbnq', 1, 6, NULL, '94868b918cae10f8f64562757e92bd88', '784a12144dfea7bd975742a7bea0d049', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:46', '2026-04-02 15:53:46', NULL, NULL),
('mnhbuh5fq4fc8', 6, 1, NULL, '786062c4dcedb64aa9d9d32d717614ab', '46d1115227289222f4ddaba175a48070', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:48', '2026-04-02 15:53:48', NULL, NULL),
('mnhbuh8f8lbmo', 1, 6, NULL, 'b2cf79a2f97b50c1d785eecaab5cad1d', 'c77183e327775d1299bf293b7039d30b', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:46', '2026-04-02 15:53:46', NULL, NULL),
('mnhbuhb5upsov', 6, 1, NULL, '8c822b370db53bcbc6c5f48902acc40b', '5d61634f92635cb468e28db3cd5cc0ba', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:48', '2026-04-02 15:53:48', NULL, NULL),
('mnhbuhd9es7pi', 1, 6, NULL, 'dc695047ce64a8ac1e49fc957c698243', '0b38d02de616b082b2c1945cacc4e7b2', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:46', '2026-04-02 15:53:46', NULL, NULL),
('mnhbuhhimbxym', 1, 6, NULL, 'd1bfc481a4afa3cb4e487d6b1007fc4f', '158ffd914368748aa13c053fa00d6356', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:46', '2026-04-02 15:53:46', NULL, NULL),
('mnhbuhilt6lbn', 6, 1, NULL, '656ed855695f359268cdeef0d8819669', '01d97261d28763161319a417142bd6e8', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:49', '2026-04-02 15:53:49', NULL, NULL),
('mnhbuhlcm1htt', 6, 1, NULL, 'debe2ee26c3f2a7d88ab098a183e7f60', '9b98b8e39dc420cdfd61e39f9055b7b8', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:49', '2026-04-02 15:53:49', NULL, NULL),
('mnhbuhmaimcbe', 1, 6, NULL, '7b552742f6a48e56cbe0c03e1910987d', 'd202905b1810ef8a105759659af837b1', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:47', '2026-04-02 15:53:47', NULL, NULL),
('mnhbuhpj2h593', 6, 1, NULL, 'cdadd4f1e1d50815e1d6435ac4be4dab', '05096987a2d3154b2d31d05e16070d05', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:49', '2026-04-02 15:53:49', NULL, NULL),
('mnhbuhqwiyqi1', 1, 6, NULL, '6fd0af67d18b7bc2eda0db3f6996532f', '37dae9c8f4f56731da39d853f8f312f7', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:47', '2026-04-02 15:53:47', NULL, NULL),
('mnhbuhvledbos', 1, 6, NULL, '9dbf9317833dd9ab3877c5d18fbadca5', 'b96135d994216332a140bb9d3fb2bb37', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:47', '2026-04-02 15:53:47', NULL, NULL),
('mnhbuhx6rcm48', 6, 1, NULL, '2844ed1ff2eb560e84bbb44fae600ceb', 'a6d42242c40f22b7beb717fdb32f8614', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:49', '2026-04-02 15:53:49', NULL, NULL),
('mnhbui07mlp6h', 1, 6, NULL, '107620f9c01d51f8438debf6b703699a', '550b20df0e76c503402c7cad83724f38', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:47', '2026-04-02 15:53:47', NULL, NULL),
('mnhbui0x7myl0', 6, 1, NULL, '1804822ba71645c2875e77d33c986963', 'c4f91f618b1e3ec4b001c0460409416a', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:49', '2026-04-02 15:53:49', NULL, NULL),
('mnhbui4bh0uq0', 6, 1, NULL, '77b1dd312aea4c3f08500018ab8cab8a', 'be4de5d0eafe0b483585747a6b29dc94', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:49', '2026-04-02 15:53:49', NULL, NULL),
('mnhbui50qlfes', 1, 6, NULL, '9377a4ad6f6a0d18c42d1935f59147af', 'e8c9e28e0a1b4d59932df868e3a2b288', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:47', '2026-04-02 15:53:47', NULL, NULL),
('mnhbui8e2higo', 6, 1, NULL, '64cc20ee7dfc18db967d5e900e146c8a', 'd2bf3af561a8e572518a35681ceaaa57', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:50', '2026-04-02 15:53:50', NULL, NULL),
('mnhbui9hx2vn3', 1, 6, NULL, 'a510a113f404f5e600e7fd506eea4621', '32a2d05f744b7c921f70bb3ef6410a56', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:47', '2026-04-02 15:53:47', NULL, NULL),
('mnhbuieogowzq', 1, 6, NULL, '9158f3d947fb590e6ea53db67b6be0db', 'c2d9724bdf86f7a5e4fb060f5dd9dd33', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:48', '2026-04-02 15:53:48', NULL, NULL),
('mnhbuifr8zhgo', 6, 1, NULL, 'c727af38b8232d421a2a4a1e1e79870a', '5b17e852f28e6ba7dd41ae35cdf08de2', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:50', '2026-04-02 15:53:50', NULL, NULL),
('mnhbuij4nbqt7', 1, 6, NULL, '6385888e00c4115caf0326d3baa570e5', '5c9ebbef049693f199afe18437c9c091', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:48', '2026-04-02 15:53:48', NULL, NULL),
('mnhbuinrl83ld', 1, 6, NULL, '0acb01aa54501a069f057f47043576df', '418c5dc4085a45394648b8dfd7a2fdb2', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:48', '2026-04-02 15:53:48', NULL, NULL),
('mnhbuipab2yej', 6, 1, NULL, '368a56ca3c8c443c998a4704d9e89f86', '6aea5cd2a969b6a8a51a9244dd53f612', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:50', '2026-04-02 15:53:50', NULL, NULL),
('mnhbuiswsqqoa', 1, 6, NULL, '7e6debaea637c4dcb56b85256da7669b', 'bba63f80429931bfabed008972907cb4', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:48', '2026-04-02 15:53:48', NULL, NULL),
('mnhbuitc8pjzr', 6, 1, NULL, '987b308f7c58691aed50f6631808d0ed', '15fe60d0e379b18a18ab6483a1a819ab', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:50', '2026-04-02 15:53:50', NULL, NULL),
('mnhbuiy7tsxwd', 1, 6, NULL, '3f7f039f775b28adf0e753752f3bbaf0', 'e27eec26c5a02b3482d5e71c4654e6ad', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:48', '2026-04-02 15:53:48', NULL, NULL),
('mnhbuiydudeh2', 6, 1, NULL, 'e0a58a652d8fcc6e506da194abb40b9b', '21017bf3cc5071f6c3ca162b0bfeac9b', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:50', '2026-04-02 15:53:50', NULL, NULL),
('mnhbuj2foxe14', 6, 1, NULL, '7d139c38b4e220b07f41119fcfa99602', '7a661e9a78a9706cc8ee4ec67d5d04bf', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:51', '2026-04-02 15:53:51', NULL, NULL),
('mnhbuj6i1dekt', 1, 6, NULL, '04f543439342f627cb2729ed4bc384e6', 'd19391babdc2d0a7d0cd1ab33bfc70a6', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:49', '2026-04-02 15:53:49', NULL, NULL),
('mnhbujagta7ey', 6, 1, NULL, 'de3be66afde943cbc1c538091dbe5691', '58e38620cf7a6b1ec7b3a6d01962d734', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:51', '2026-04-02 15:53:51', NULL, NULL),
('mnhbujb7rplfh', 1, 6, NULL, '20edc342827201fd882ffb14280541af', '2fb7543eb384e180e05abc22a5a68abe', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:49', '2026-04-02 15:53:49', NULL, NULL),
('mnhbujetvmbto', 6, 1, NULL, '8b7583dffea18a716f2ff880403e5ca4', '967d733069ffea50c4d6fedfa2bd53e7', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:51', '2026-04-02 15:53:51', NULL, NULL),
('mnhbujgwddwtl', 1, 6, NULL, 'a48305c8a52677f10a6edaa4de600e92', '8e76be3bd7c590349e01f933f8127aaf', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:49', '2026-04-02 15:53:49', NULL, NULL),
('mnhbujirn7frg', 6, 1, NULL, '2402b9440a1efc5f0a5506a99db14163', 'de9a7b412991b6c0b8aab2f58e121a8e', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:51', '2026-04-02 15:53:51', NULL, NULL),
('mnhbujl543shb', 1, 6, NULL, '196ad66803827d9f92d4f3c894695cd4', '3d3fe102a110eaebf9da63491a99b04c', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:49', '2026-04-02 15:53:49', NULL, NULL),
('mnhbujnwcy4hv', 6, 1, NULL, '078c5755905855174b6841f0b13316c4', '9b05d8fc83df728a5c706f9d2e855513', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:51', '2026-04-02 15:53:51', NULL, NULL),
('mnhbujpgfhch1', 1, 6, NULL, '716f919ede32be3d47e7705186d0fe5a', '2ab614ff86880517e8253959aaa39291', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:49', '2026-04-02 15:53:49', NULL, NULL),
('mnhbujsnmmoum', 6, 1, NULL, '4e1ec24f1a77a9596726d99db0b7011a', '7d4d641b5bb2e421547970ba56c43694', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:52', '2026-04-02 15:53:52', NULL, NULL),
('mnhbuk6s2doh2', 6, 1, NULL, '2a690b1306b1460c99875cde80d64ecc', 'fd17f8a1459eee67b58bf8663238f35a', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:53:52', '2026-04-02 15:53:52', NULL, NULL),
('mnhbxw026wkaw', 1, 6, NULL, '7c318a6f4bc856719ea6836a6402ee03592f81f0dd9d09b976d81d758a1438c2753b1f717aa610bce61701178ed31cf23c56cccaa4a6d52bef5e1eebdc66f33a9ce7839a6186d3d265a3d9ff82516a1cb198f0c19e5c28d219a54adce4ccbcd6', '7dbaf9fb4e2ecf253448cb22bf7872cf', 'contact', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:56:25', '2026-04-02 15:56:25', NULL, NULL),
('mnhby8y3v6qhm', 6, 1, NULL, '19fc99c79a34e8cfa19b77bd4675d748a69019c94c7e5d2ea4a09dd3d24d5d210683f3afc113d7beb2d56a04eb021b65ba1829e84c0534295b458ff70c80c0f16e93c84e5e1790f865a23777e6c1855e49e01a81701681bffaddab0d3770b58f', 'f8550ab6012f6a1cb66aa630c30c0c2b', 'location', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:56:44', '2026-04-02 15:56:44', NULL, NULL),
('mnhbybka3dmsu', 1, 6, NULL, 'ed1558b5cdb1927357b2b10d071f1e26dd801ed3fc86ef262cc93a1cca75ea7625857c64edecb248ac9cb5206522899ca9d0b3eb1beae4a21119e6af10641543991fee97482b2a26528fedd572d38d6776650144570098ddc258f257a33430c1', '2b38353c39d8370f76c2ec18b40fdaf4', 'location', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-04-02 15:56:45', '2026-04-02 15:56:45', NULL, NULL),
('moo82rsi92lu7', 1, 2, NULL, '56fbc1b8d52854872bdc1fa210be7a8d', '814310539701f38d1f5bbb241abf3058', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-05-02 16:22:20', '2026-05-02 16:22:20', NULL, NULL),
('moo82ve0in4mo', 2, 1, NULL, 'dbc834863025e2b0a9b6b15f083c6dbe', '89041943ae8777a94e5faf1ef645fd8e', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-05-02 16:22:25', '2026-05-02 16:22:25', NULL, NULL),
('moquv4otbbag1', 2, 1, NULL, 'b6c540dc95029c470f00aa440fb08f7e', '4da1ec700d98eb52b17464670666be29', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-05-04 12:35:49', '2026-05-04 12:35:49', NULL, NULL),
('moquv93y6okbi', 2, 1, NULL, 'dd4998a5d67e0742599f648458422dab', 'ea6d8f7d7a2d12efb470be845a3da1c9', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-05-04 12:35:54', '2026-05-04 12:35:54', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `message_reactions`
--

CREATE TABLE `message_reactions` (
  `id` int(11) NOT NULL,
  `message_id` varchar(40) NOT NULL,
  `user_id` int(11) NOT NULL,
  `emoji` varchar(20) NOT NULL DEFAULT '❤️',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `message_reactions`
--

INSERT INTO `message_reactions` (`id`, `message_id`, `user_id`, `emoji`, `created_at`) VALUES
(1, 'mnfq90yhiw0rg', 2, '❤️', '2026-04-01 07:32:30'),
(5, 'mnftljlcdwide', 1, '😮', '2026-04-01 12:16:12');

-- --------------------------------------------------------

--
-- Table structure for table `message_status`
--

CREATE TABLE `message_status` (
  `id` int(11) NOT NULL,
  `message_id` varchar(40) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` enum('delivered','seen') DEFAULT 'delivered',
  `seen_at` datetime DEFAULT NULL,
  `delivered_at` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `message_status`
--

INSERT INTO `message_status` (`id`, `message_id`, `user_id`, `status`, `seen_at`, `delivered_at`) VALUES
(1, 'mn8tnsd82licf', 2, 'seen', '2026-04-02 13:28:33', NULL),
(2, 'mn8u4rkp3nmbt', 2, 'seen', '2026-03-27 17:15:44', NULL),
(4, 'mn8u54ibh0ld4', 1, 'seen', '2026-03-27 17:16:00', NULL),
(6, 'mn8u5chv85els', 2, 'seen', '2026-03-27 17:16:11', NULL),
(8, 'mn8u6k7or0q4d', 1, 'seen', '2026-03-27 17:17:07', NULL),
(10, 'mn8uq6xvd9jxt', 4, 'delivered', NULL, NULL),
(11, 'mn8v7svhj56jj', 4, 'seen', '2026-03-27 17:46:05', NULL),
(13, 'mncry5sgjewdo', 2, 'seen', '2026-03-30 11:25:43', NULL),
(15, 'mncrygl1o5gyk', 2, 'delivered', NULL, NULL),
(16, 'mncrz0bhmrxhn', 2, 'seen', '2026-03-30 11:26:23', NULL),
(18, 'mncs1dumhijxl', 2, 'seen', '2026-03-30 11:28:13', NULL),
(20, 'mncs84fu0y7su', 1, 'seen', '2026-03-30 11:33:26', NULL),
(22, 'mncsqsio8r1uj', 1, 'seen', '2026-04-02 13:41:21', NULL),
(23, 'mncsqxf8urxtw', 6, 'delivered', NULL, NULL),
(24, 'mncsr1fbdfmzk', 6, 'delivered', NULL, NULL),
(25, 'mncsr8t0ar3u8', 5, 'seen', '2026-03-30 11:48:20', NULL),
(27, 'mncx301uadsmx', 7, 'delivered', NULL, NULL),
(28, 'mnd3kq9qhpe0w', 1, 'seen', '2026-04-02 13:18:40', NULL),
(29, 'mndgxolzqbwat', 2, 'seen', '2026-03-30 23:05:09', NULL),
(31, 'mndh3ohpaf8jq', 2, 'seen', '2026-03-30 23:09:49', NULL),
(33, 'mnditt299ni9f', 2, 'seen', '2026-03-30 23:58:08', NULL),
(35, 'mne8vi8jhy23j', 1, 'delivered', NULL, NULL),
(36, 'mne8wtwp3ipv0', 1, 'seen', '2026-03-31 12:08:20', NULL),
(38, 'mne8y0x6k6sov', 1, 'seen', '2026-03-31 12:09:15', NULL),
(40, 'mne9bmomr0xi1', 1, 'seen', '2026-03-31 12:19:50', NULL),
(43, 'mne9chw96cteq', 1, 'seen', '2026-04-02 13:41:21', NULL),
(44, 'mne9cjnkhbh56', 1, 'seen', '2026-03-31 12:20:33', NULL),
(46, 'mne9cql5nujy0', 6, 'seen', '2026-03-31 12:20:41', NULL),
(48, 'mne9crpv7xg45', 6, 'seen', '2026-03-31 12:20:42', NULL),
(50, 'mne9csnu9qx25', 6, 'seen', '2026-03-31 12:20:43', NULL),
(52, 'mne9eitv43utm', 6, 'seen', '2026-03-31 12:22:04', NULL),
(54, 'mne9itt2pmerm', 1, 'seen', '2026-03-31 12:25:26', NULL),
(56, 'mnfqb4u2wd4uw', 2, 'seen', '2026-04-01 13:03:06', NULL),
(58, 'mnfqe0kjqpzde', 2, 'seen', '2026-04-01 13:05:20', NULL),
(60, 'mnft072hc303f', 1, 'seen', '2026-04-01 14:18:34', NULL),
(62, 'mnft0akg9jr44', 1, 'seen', '2026-04-01 14:18:39', NULL),
(64, 'mnfwg65m5le4e', 6, 'delivered', NULL, NULL),
(65, 'mnfwgkrtcebz0', 6, 'seen', '2026-04-01 15:55:17', NULL),
(67, 'mng0dvnx1u41l', 6, 'seen', '2026-04-02 15:52:15', NULL),
(68, 'mng0ja1pcwy8i', 1, 'seen', '2026-04-01 17:49:22', NULL),
(70, 'mng0kgssynghh', 1, 'seen', '2026-04-02 13:41:21', NULL),
(72, 'mnftljlcdwide', 1, 'seen', '2026-04-02 13:41:21', '2026-04-02 13:27:48'),
(73, 'mnh6fxafhswnt', 1, 'seen', '2026-04-02 13:27:50', '2026-04-02 13:27:48'),
(75, 'mndfym3zoxxwn', 2, 'seen', '2026-04-02 13:28:33', '2026-04-02 13:28:23'),
(76, 'mndgpkp8bt4ok', 2, 'seen', '2026-04-02 13:28:33', '2026-04-02 13:28:23'),
(77, 'mnej55fcoor6o', 2, 'seen', '2026-04-02 13:28:33', '2026-04-02 13:28:23'),
(78, 'mnfq0nhzgxua1', 2, 'seen', '2026-04-02 13:28:33', '2026-04-02 13:28:23'),
(79, 'mnfq90yhiw0rg', 2, 'seen', '2026-04-02 13:28:33', '2026-04-02 13:28:23'),
(80, 'mnfqc8ykx5gjj', 2, 'seen', '2026-04-02 13:28:33', '2026-04-02 13:28:23'),
(81, 'mnft4ymq09b9l', 2, 'seen', '2026-04-02 13:28:33', '2026-04-02 13:28:23'),
(82, 'mnft5qao6tif1', 2, 'seen', '2026-04-02 13:28:33', '2026-04-02 13:28:23'),
(83, 'mnh6gv67ro0xx', 1, 'seen', '2026-04-02 13:28:24', '2026-04-02 13:28:24'),
(94, 'mnh6ol4riku6f', 1, 'seen', '2026-04-02 13:29:14', '2026-04-02 13:29:14'),
(96, 'mnh6p2d5uy4ju', 1, 'seen', '2026-04-02 13:29:39', '2026-04-02 13:29:36'),
(98, 'mnh6vsud6r1y6', 1, 'seen', '2026-04-02 13:34:55', '2026-04-02 13:34:51'),
(104, 'mnej4ra37ws5g', 6, 'seen', '2026-04-02 15:52:15', '2026-04-02 15:52:00'),
(105, 'mnfscwt55c6b7eb51d', 6, 'seen', '2026-04-02 15:52:15', '2026-04-02 15:52:00'),
(106, 'mnfsfmpq6504d08092', 6, 'seen', '2026-04-02 15:52:15', '2026-04-02 15:52:00'),
(107, 'mnfstjzfb19f38692b', 6, 'seen', '2026-04-02 15:52:15', '2026-04-02 15:52:00'),
(113, 'mnhbu6ofk2bjk', 6, 'seen', '2026-04-02 15:53:33', '2026-04-02 15:53:32'),
(115, 'mnhbu7kz66ry0', 6, 'seen', '2026-04-02 15:53:34', '2026-04-02 15:53:34'),
(117, 'mnhbu83kjpw08', 6, 'seen', '2026-04-02 15:53:34', '2026-04-02 15:53:34'),
(119, 'mnhbu8dcxfkh7', 6, 'seen', '2026-04-02 15:53:35', '2026-04-02 15:53:35'),
(121, 'mnhbu8kcbpdhe', 6, 'seen', '2026-04-02 15:53:35', '2026-04-02 15:53:35'),
(123, 'mnhbu8p21w8iw', 6, 'seen', '2026-04-02 15:53:35', '2026-04-02 15:53:35'),
(125, 'mnhbu8ukor9u1', 6, 'seen', '2026-04-02 15:53:35', '2026-04-02 15:53:35'),
(127, 'mnhbu8zmbjw29', 6, 'seen', '2026-04-02 15:53:36', '2026-04-02 15:53:35'),
(129, 'mnhbu94641y0f', 6, 'seen', '2026-04-02 15:53:36', '2026-04-02 15:53:36'),
(131, 'mnhbu98pu0jm9', 6, 'seen', '2026-04-02 15:53:36', '2026-04-02 15:53:36'),
(133, 'mnhbu9d90mwn4', 6, 'seen', '2026-04-02 15:53:36', '2026-04-02 15:53:36'),
(135, 'mnhbu9iaivfng', 6, 'seen', '2026-04-02 15:53:36', '2026-04-02 15:53:36'),
(137, 'mnhbu9mqku6ir', 6, 'seen', '2026-04-02 15:53:36', '2026-04-02 15:53:36'),
(139, 'mnhbu9r20rvir', 6, 'seen', '2026-04-02 15:53:37', '2026-04-02 15:53:36'),
(141, 'mnhbu9vwlrt6o', 6, 'seen', '2026-04-02 15:53:37', '2026-04-02 15:53:37'),
(143, 'mnhbua0a0m3dk', 6, 'seen', '2026-04-02 15:53:37', '2026-04-02 15:53:37'),
(145, 'mnhbua53jtbt2', 6, 'seen', '2026-04-02 15:53:37', '2026-04-02 15:53:37'),
(147, 'mnhbuaa0z2j4l', 6, 'seen', '2026-04-02 15:53:37', '2026-04-02 15:53:37'),
(149, 'mnhbuael2ybex', 6, 'seen', '2026-04-02 15:53:37', '2026-04-02 15:53:37'),
(151, 'mnhbuajbwadhq', 6, 'seen', '2026-04-02 15:53:38', '2026-04-02 15:53:37'),
(153, 'mnhbuaoikj2nd', 6, 'seen', '2026-04-02 15:53:38', '2026-04-02 15:53:38'),
(155, 'mnhbuatzuqovi', 6, 'seen', '2026-04-02 15:53:38', '2026-04-02 15:53:38'),
(157, 'mnhbufrsb89qc', 6, 'seen', '2026-04-02 15:53:44', '2026-04-02 15:53:44'),
(159, 'mnhbufwpr9991', 6, 'seen', '2026-04-02 15:53:44', '2026-04-02 15:53:44'),
(161, 'mnhbug1ja2556', 6, 'seen', '2026-04-02 15:53:45', '2026-04-02 15:53:45'),
(163, 'mnhbug62z8v9x', 6, 'seen', '2026-04-02 15:53:45', '2026-04-02 15:53:45'),
(165, 'mnhbugaqdo81k', 6, 'seen', '2026-04-02 15:53:45', '2026-04-02 15:53:45'),
(167, 'mnhbugeqb85ze', 6, 'seen', '2026-04-02 15:53:45', '2026-04-02 15:53:45'),
(169, 'mnhbugilwq8z9', 6, 'seen', '2026-04-02 15:53:45', '2026-04-02 15:53:45'),
(171, 'mnhbugmwq71eh', 6, 'seen', '2026-04-02 15:53:45', '2026-04-02 15:53:45'),
(173, 'mnhbugvk772e9', 6, 'seen', '2026-04-02 15:53:46', '2026-04-02 15:53:46'),
(175, 'mnhbugzy3q8oj', 6, 'seen', '2026-04-02 15:53:46', '2026-04-02 15:53:46'),
(177, 'mnhbuh4jwmbnq', 6, 'seen', '2026-04-02 15:53:46', '2026-04-02 15:53:46'),
(179, 'mnhbuh8f8lbmo', 6, 'seen', '2026-04-02 15:53:46', '2026-04-02 15:53:46'),
(181, 'mnhbuhd9es7pi', 6, 'seen', '2026-04-02 15:53:46', '2026-04-02 15:53:46'),
(183, 'mnhbuhhimbxym', 6, 'seen', '2026-04-02 15:53:47', '2026-04-02 15:53:46'),
(185, 'mnhbuhmaimcbe', 6, 'seen', '2026-04-02 15:53:47', '2026-04-02 15:53:47'),
(187, 'mnhbuhqwiyqi1', 6, 'seen', '2026-04-02 15:53:47', '2026-04-02 15:53:47'),
(189, 'mnhbuhvledbos', 6, 'seen', '2026-04-02 15:53:47', '2026-04-02 15:53:47'),
(191, 'mnhbui07mlp6h', 6, 'seen', '2026-04-02 15:53:47', '2026-04-02 15:53:47'),
(193, 'mnhbui50qlfes', 6, 'seen', '2026-04-02 15:53:47', '2026-04-02 15:53:47'),
(195, 'mnhbui9hx2vn3', 6, 'seen', '2026-04-02 15:53:48', '2026-04-02 15:53:47'),
(197, 'mnhbuieogowzq', 6, 'seen', '2026-04-02 15:53:48', '2026-04-02 15:53:48'),
(199, 'mnhbuij4nbqt7', 6, 'seen', '2026-04-02 15:53:48', '2026-04-02 15:53:48'),
(201, 'mnhbuinrl83ld', 6, 'seen', '2026-04-02 15:53:48', '2026-04-02 15:53:48'),
(203, 'mnhbuh5fq4fc8', 1, 'seen', '2026-04-02 15:53:48', '2026-04-02 15:53:48'),
(204, 'mnhbuiswsqqoa', 6, 'seen', '2026-04-02 15:53:48', '2026-04-02 15:53:48'),
(207, 'mnhbuiy7tsxwd', 6, 'seen', '2026-04-02 15:53:48', '2026-04-02 15:53:48'),
(208, 'mnhbuhb5upsov', 1, 'seen', '2026-04-02 15:53:48', '2026-04-02 15:53:48'),
(211, 'mnhbuhilt6lbn', 1, 'seen', '2026-04-02 15:53:49', '2026-04-02 15:53:49'),
(213, 'mnhbuj6i1dekt', 6, 'seen', '2026-04-02 15:53:49', '2026-04-02 15:53:49'),
(214, 'mnhbuhlcm1htt', 1, 'seen', '2026-04-02 15:53:49', '2026-04-02 15:53:49'),
(217, 'mnhbujb7rplfh', 6, 'seen', '2026-04-02 15:53:49', '2026-04-02 15:53:49'),
(218, 'mnhbuhpj2h593', 1, 'seen', '2026-04-02 15:53:49', '2026-04-02 15:53:49'),
(221, 'mnhbujgwddwtl', 6, 'seen', '2026-04-02 15:53:49', '2026-04-02 15:53:49'),
(223, 'mnhbuhx6rcm48', 1, 'seen', '2026-04-02 15:53:49', '2026-04-02 15:53:49'),
(224, 'mnhbujl543shb', 6, 'seen', '2026-04-02 15:53:49', '2026-04-02 15:53:49'),
(227, 'mnhbui0x7myl0', 1, 'seen', '2026-04-02 15:53:49', '2026-04-02 15:53:49'),
(229, 'mnhbujpgfhch1', 6, 'seen', '2026-04-02 15:53:49', '2026-04-02 15:53:49'),
(230, 'mnhbui4bh0uq0', 1, 'seen', '2026-04-02 15:53:49', '2026-04-02 15:53:49'),
(233, 'mnhbui8e2higo', 1, 'seen', '2026-04-02 15:53:50', '2026-04-02 15:53:50'),
(235, 'mnhbuifr8zhgo', 1, 'seen', '2026-04-02 15:53:50', '2026-04-02 15:53:50'),
(237, 'mnhbuipab2yej', 1, 'seen', '2026-04-02 15:53:50', '2026-04-02 15:53:50'),
(239, 'mnhbuitc8pjzr', 1, 'seen', '2026-04-02 15:53:50', '2026-04-02 15:53:50'),
(241, 'mnhbuiydudeh2', 1, 'seen', '2026-04-02 15:53:51', '2026-04-02 15:53:51'),
(243, 'mnhbuj2foxe14', 1, 'seen', '2026-04-02 15:53:51', '2026-04-02 15:53:51'),
(245, 'mnhbujagta7ey', 1, 'seen', '2026-04-02 15:53:51', '2026-04-02 15:53:51'),
(247, 'mnhbujetvmbto', 1, 'seen', '2026-04-02 15:53:51', '2026-04-02 15:53:51'),
(249, 'mnhbujirn7frg', 1, 'seen', '2026-04-02 15:53:51', '2026-04-02 15:53:51'),
(251, 'mnhbujnwcy4hv', 1, 'seen', '2026-04-02 15:53:51', '2026-04-02 15:53:51'),
(253, 'mnhbujsnmmoum', 1, 'seen', '2026-04-02 15:53:52', '2026-04-02 15:53:52'),
(255, 'mnhbuk6s2doh2', 1, 'seen', '2026-04-02 15:53:52', '2026-04-02 15:53:52'),
(257, 'mnhbxw026wkaw', 6, 'seen', '2026-04-02 15:56:35', '2026-04-02 15:56:25'),
(259, 'mnhby8y3v6qhm', 1, 'seen', '2026-04-02 15:56:44', '2026-04-02 15:56:44'),
(261, 'mnhbybka3dmsu', 6, 'seen', '2026-04-02 15:56:46', '2026-04-02 15:56:45'),
(263, 'mng0jf0muvt0r', 9, 'delivered', NULL, '2026-04-04 17:56:42'),
(264, 'mnh734icztjxe', 2, 'seen', '2026-04-07 15:58:09', '2026-04-07 15:58:03'),
(266, 'moo82rsi92lu7', 2, 'seen', '2026-05-02 16:22:20', '2026-05-02 16:22:20'),
(268, 'moo82ve0in4mo', 1, 'seen', '2026-05-02 16:22:25', '2026-05-02 16:22:25'),
(270, 'moquv4otbbag1', 1, 'seen', '2026-05-04 12:35:49', '2026-05-04 12:35:49'),
(272, 'moquv93y6okbi', 1, 'seen', '2026-05-04 12:35:54', '2026-05-04 12:35:54');

-- --------------------------------------------------------

--
-- Table structure for table `payment_gateways`
--

CREATE TABLE `payment_gateways` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `display_name` varchar(200) NOT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`config`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_gateways`
--

INSERT INTO `payment_gateways` (`id`, `name`, `display_name`, `is_active`, `config`, `created_at`) VALUES
(1, 'razorpay', 'Razorpay', 1, '{\"key_id\":\"rzp_test_SVQXeK0WrCZHjI\",\"key_secret\":\"0ieB5Dh8RG04S0eFGCJuVsEA\",\"webhook_secret\":\"\"}', '2026-05-08 09:45:07'),
(2, 'stripe', 'Stripe', 0, '{\"publishable_key\":\"\",\"secret_key\":\"\",\"webhook_secret\":\"\"}', '2026-05-08 09:45:07'),
(3, 'paypal', 'PayPal', 0, '{\"client_id\":\"\",\"client_secret\":\"\",\"mode\":\"sandbox\"}', '2026-05-08 09:45:07');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `status_likes`
--

CREATE TABLE `status_likes` (
  `status_id` varchar(40) NOT NULL,
  `user_id` int(11) NOT NULL,
  `emoji` varchar(10) DEFAULT '❤️',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `status_likes`
--

INSERT INTO `status_likes` (`status_id`, `user_id`, `emoji`, `created_at`) VALUES
('mnd6ri8z8c6367c19d', 7, '👏', '2026-03-31 06:47:59'),
('mndgrkn895a37efbe1', 2, '😂', '2026-03-30 17:36:12'),
('mndgrkn895a37efbe1', 9, '❤️', '2026-03-31 08:36:19');

-- --------------------------------------------------------

--
-- Table structure for table `status_posts`
--

CREATE TABLE `status_posts` (
  `id` varchar(40) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content_type` enum('text','image','video') DEFAULT 'text',
  `content` text DEFAULT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `caption` varchar(500) DEFAULT NULL,
  `bg_color` varchar(20) DEFAULT '#1a2433',
  `text_color` varchar(20) DEFAULT '#ffffff',
  `font_size` int(11) DEFAULT 28,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `status_posts`
--

INSERT INTO `status_posts` (`id`, `user_id`, `content_type`, `content`, `file_url`, `caption`, `bg_color`, `text_color`, `font_size`, `expires_at`, `created_at`) VALUES
('mnd6ri8z8c6367c19d', 2, 'text', 'xzbndgmfhg', NULL, NULL, '#3d0d1a', '#ffffff', 24, '2026-03-31 18:20:25', '2026-03-30 12:50:25'),
('mnd6s92y1640f0b89a', 7, 'text', 'Working', NULL, NULL, '#0d3d35', '#ffffff', 24, '2026-03-31 18:20:59', '2026-03-30 12:50:59'),
('mndgrkn895a37efbe1', 1, 'image', NULL, '/uploads/c-1774891824392-04126f4c52cc.jpg', 'awdjjsakj', '#1a2433', '#ffffff', 28, '2026-03-31 23:00:24', '2026-03-30 17:30:24');

-- --------------------------------------------------------

--
-- Table structure for table `status_views`
--

CREATE TABLE `status_views` (
  `status_id` varchar(40) NOT NULL,
  `viewer_id` int(11) NOT NULL,
  `viewed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `status_views`
--

INSERT INTO `status_views` (`status_id`, `viewer_id`, `viewed_at`) VALUES
('mnd6ri8z8c6367c19d', 1, '2026-03-30 17:29:57'),
('mnd6ri8z8c6367c19d', 2, '2026-03-30 12:50:29'),
('mnd6ri8z8c6367c19d', 7, '2026-03-30 12:50:48'),
('mnd6s92y1640f0b89a', 1, '2026-03-30 17:30:02'),
('mnd6s92y1640f0b89a', 2, '2026-03-30 12:51:04'),
('mnd6s92y1640f0b89a', 7, '2026-03-30 12:51:02'),
('mndgrkn895a37efbe1', 1, '2026-03-30 17:30:28'),
('mndgrkn895a37efbe1', 2, '2026-03-30 17:36:07'),
('mndgrkn895a37efbe1', 6, '2026-03-31 06:38:53'),
('mndgrkn895a37efbe1', 7, '2026-03-31 06:47:52'),
('mndgrkn895a37efbe1', 8, '2026-03-30 18:35:10'),
('mndgrkn895a37efbe1', 9, '2026-03-31 08:36:14');

-- --------------------------------------------------------

--
-- Table structure for table `unban_requests`
--

CREATE TABLE `unban_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `reason` text NOT NULL,
  `appeal_message` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `review_note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `unban_requests`
--

INSERT INTO `unban_requests` (`id`, `user_id`, `email`, `username`, `reason`, `appeal_message`, `status`, `reviewed_by`, `reviewed_at`, `review_note`, `created_at`) VALUES
(1, 1, 'sonu@gmail.com', 'ajay', 'My account has been suspended please help me', NULL, 'approved', 1, '2026-05-08 09:54:08', NULL, '2026-05-08 09:53:21');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `about` varchar(200) DEFAULT 'Hey there! I am using ChatApp.',
  `profile_pic` varchar(500) DEFAULT NULL,
  `last_seen_privacy` enum('everyone','contacts','nobody') DEFAULT 'everyone',
  `profile_pic_privacy` enum('everyone','contacts','nobody') DEFAULT 'everyone',
  `about_privacy` enum('everyone','contacts','nobody') DEFAULT 'everyone',
  `group_add_privacy` enum('everyone','contacts','admins') DEFAULT 'everyone',
  `two_step_enabled` tinyint(1) DEFAULT 0,
  `two_step_pin` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `avatar_color` varchar(20) DEFAULT '#00A884',
  `is_online` tinyint(1) DEFAULT 0,
  `last_seen` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `avatar_url` varchar(255) DEFAULT NULL,
  `priv_last_seen` varchar(20) DEFAULT 'everyone',
  `priv_photo` varchar(20) DEFAULT 'everyone',
  `priv_about` varchar(20) DEFAULT 'everyone',
  `priv_group_add` varchar(20) DEFAULT 'everyone',
  `live_loc_enabled` tinyint(1) DEFAULT 0,
  `two_step_hash` varchar(255) DEFAULT NULL,
  `account_status` enum('active','banned','suspended','pending') DEFAULT 'active',
  `ban_reason` text DEFAULT NULL,
  `banned_until` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `phone`, `about`, `profile_pic`, `last_seen_privacy`, `profile_pic_privacy`, `about_privacy`, `group_add_privacy`, `two_step_enabled`, `two_step_pin`, `password_hash`, `avatar_color`, `is_online`, `last_seen`, `created_at`, `avatar_url`, `priv_last_seen`, `priv_photo`, `priv_about`, `priv_group_add`, `live_loc_enabled`, `two_step_hash`, `account_status`, `ban_reason`, `banned_until`) VALUES
(1, 'ajay', 'sonu@gmail.com', '8294169540', '', '/uploads/1775116900421-9fe8119c204f.png', 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, '$2a$12$zpotu2hYK2eUzWJn7lmNx.b1fKcmqbL0JHOGRbckSzYtU1fpUHtKm', '#6A1B9A', 0, '2026-05-08 17:06:39', '2026-03-27 16:46:20', '/uploads/1775116900421-9fe8119c204f.png', 'everyone', 'everyone', 'everyone', 'everyone', 1, NULL, 'active', NULL, NULL),
(2, 'sonu', 'ajay@gmail.com', '', 'Hey there! I am using ChatApp.', '/uploads/c-1775033075008-14e827a7790d.jpg', 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, '$2a$12$Y3JW8JqnfN4AuRBkotf5p.J1RFThnnSV71J/nUyyL3qgtW4kS1Y1y', '#1565C0', 0, '2026-05-08 17:11:11', '2026-03-27 16:47:08', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, 'active', NULL, NULL),
(3, 'rahul', 'rahul554@gmail.com', NULL, 'Hey there! I am using ChatApp.', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, '$2a$12$IXj9QQL1fYBkYNmkOWFJh.T3qcxg9/ab3p2c8Clsqutm3aM6CGFPO', '#00838F', 0, '2026-03-27 17:36:10', '2026-03-27 17:31:19', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, 'active', NULL, NULL),
(4, 'AAS', 'ajaykumarwrs1997@gmail.com', NULL, 'Hey there! I am using ChatApp.', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, '$2a$12$O/aQz7JRn78UyoHnBujTA.i3VI02Zwu5PCpqLAxZjioby08QKKozG', '#6A1B9A', 0, '2026-03-27 17:47:08', '2026-03-27 17:31:45', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, 'active', NULL, NULL),
(5, 'Sanket Kumar', 'sanket@gmail.com', NULL, 'Hey there! I am using ChatApp.', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, '$2a$12$glEpPHw9X5R5i8UMWE7QCed4VF2LXfB57BBudn6Hu43r7LOhSe/ca', '#00A884', 0, '2026-04-02 13:20:58', '2026-03-30 11:24:18', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, 'active', NULL, NULL),
(6, 'Mansi', 'mansi.eemotrack@gmail.com', '9534064840', 'Not Available', '/uploads/1774939413403-8e7e1e9fffc6.jpeg', 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, '$2a$12$aXudOaWZCRfu5y9sYObNQe9rX6.J9L2FewTNTkR8OPeOoiX7ERY4a', '#E65100', 0, '2026-04-07 16:27:51', '2026-03-30 11:46:21', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, 'active', NULL, NULL),
(7, 'Sanket New', 'new@gmail.com', '', '', '/uploads/1774865372755-3d288d2d5835.png', 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, '$2a$12$QnAoKHC3mhvEj/7P1dNsLODIGjJN9XU48soKBsV.PgujUS9roJOZy', '#2E7D32', 0, '2026-03-31 12:22:44', '2026-03-30 13:46:58', NULL, 'nobody', 'nobody', 'everyone', 'everyone', 1, NULL, 'active', NULL, NULL),
(8, 'rahul1', 'rahul@gmail.com', NULL, 'Hey there! I am using ChatApp.', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, '$2a$12$Sn489cNsUIJ4MErEa0MSL.yTV4EddYoiV978ldjGla/JW/V4hXqnG', '#E65100', 0, '2026-03-31 00:07:40', '2026-03-31 00:04:40', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, 'active', NULL, NULL),
(9, 'Sanket K', 'sanketkumar@gmail.com', NULL, 'Hey there! I am using ChatApp.', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, '$2a$12$HImcyhaFsNu8sZTKUhoNk.eY27MStTZMKhLrK5it/EQmOjEjepoNy', '#2E7D32', 0, '2026-05-04 12:31:03', '2026-03-31 14:04:50', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, 'active', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_ads`
--

CREATE TABLE `user_ads` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `ad_type` enum('banner','status','chat','notification') DEFAULT 'banner',
  `media_url` varchar(500) DEFAULT NULL,
  `media_type` enum('image','video','gif') DEFAULT 'image',
  `cta_text` varchar(100) DEFAULT 'Learn More',
  `cta_url` varchar(500) DEFAULT NULL,
  `placement_status` tinyint(1) DEFAULT 1,
  `placement_chat` tinyint(1) DEFAULT 0,
  `placement_home` tinyint(1) DEFAULT 0,
  `budget` decimal(10,2) DEFAULT 0.00,
  `spent` decimal(10,2) DEFAULT 0.00,
  `daily_budget` decimal(10,2) DEFAULT 0.00,
  `cost_per_click` decimal(10,4) DEFAULT 0.0000,
  `cost_per_impression` decimal(10,4) DEFAULT 0.0000,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `target_gender` enum('all','male','female') DEFAULT 'all',
  `target_age_min` int(11) DEFAULT 13,
  `target_age_max` int(11) DEFAULT 65,
  `target_location` varchar(500) DEFAULT NULL,
  `advertiser_name` varchar(200) DEFAULT NULL,
  `impressions` bigint(20) DEFAULT 0,
  `clicks` bigint(20) DEFAULT 0,
  `status` enum('draft','pending','approved','paused','hold','suspended','document_requested','ended','rejected') DEFAULT 'pending',
  `reject_reason` text DEFAULT NULL,
  `priority` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `action_type` enum('website','call','whatsapp','lead') DEFAULT 'website',
  `phone_number` varchar(40) DEFAULT NULL,
  `whatsapp_number` varchar(40) DEFAULT NULL,
  `lead_fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`lead_fields`)),
  `placement_calls` tinyint(1) DEFAULT 0,
  `cost_per_lead` decimal(10,4) DEFAULT 0.0000,
  `leads` bigint(20) DEFAULT 0,
  `verification_required` tinyint(1) DEFAULT 0,
  `verification_fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`verification_fields`)),
  `verification_documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`verification_documents`)),
  `verification_status` enum('not_required','requested','submitted','approved','rejected') DEFAULT 'not_required'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_ad_events`
--

CREATE TABLE `user_ad_events` (
  `id` bigint(20) NOT NULL,
  `ad_id` int(11) NOT NULL,
  `owner_user_id` int(11) NOT NULL,
  `viewer_user_id` int(11) DEFAULT NULL,
  `event_type` enum('impression','click','lead','call','whatsapp','website_visit') DEFAULT 'impression',
  `placement` varchar(50) DEFAULT NULL,
  `cost` decimal(10,4) DEFAULT 0.0000,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_ad_leads`
--

CREATE TABLE `user_ad_leads` (
  `id` bigint(20) NOT NULL,
  `ad_id` int(11) NOT NULL,
  `owner_user_id` int(11) NOT NULL,
  `viewer_user_id` int(11) DEFAULT NULL,
  `lead_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`lead_data`)),
  `cost` decimal(10,4) DEFAULT 0.0000,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_ad_payments`
--

CREATE TABLE `user_ad_payments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `ad_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'INR',
  `gateway` varchar(50) DEFAULT 'razorpay',
  `gateway_order_id` varchar(200) DEFAULT NULL,
  `gateway_payment_id` varchar(200) DEFAULT NULL,
  `gateway_signature` varchar(500) DEFAULT NULL,
  `status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_bans`
--

CREATE TABLE `user_bans` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `banned_by` int(11) NOT NULL,
  `reason` text DEFAULT NULL,
  `ban_type` enum('temporary','permanent') DEFAULT 'permanent',
  `banned_until` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `lifted_at` timestamp NULL DEFAULT NULL,
  `lifted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_bans`
--

INSERT INTO `user_bans` (`id`, `user_id`, `banned_by`, `reason`, `ban_type`, `banned_until`, `is_active`, `created_at`, `lifted_at`, `lifted_by`) VALUES
(1, 1, 1, 'Violated terms of service', 'temporary', '2026-05-08 06:16:00', 0, '2026-05-04 06:17:07', '2026-05-04 06:18:27', 1),
(2, 1, 1, 'Violated terms of service', 'temporary', NULL, 0, '2026-05-04 06:19:32', '2026-05-04 06:20:17', 1),
(3, 1, 1, 'Violated terms of service', 'temporary', NULL, 0, '2026-05-04 07:01:43', '2026-05-04 07:04:12', 1),
(4, 2, 1, 'Violated terms of service', 'permanent', NULL, 0, '2026-05-04 07:49:58', '2026-05-04 07:50:22', 1),
(5, 1, 1, 'Violated terms of service', 'temporary', NULL, 0, '2026-05-04 07:50:42', '2026-05-04 07:51:00', 1),
(6, 1, 1, 'Violated terms of service', 'permanent', NULL, 0, '2026-05-08 09:52:50', '2026-05-08 09:54:08', 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_settings`
--

CREATE TABLE `user_settings` (
  `user_id` int(11) NOT NULL,
  `notifications` tinyint(1) DEFAULT 1,
  `sound_enabled` tinyint(1) DEFAULT 1,
  `theme` varchar(20) DEFAULT 'dark',
  `language` varchar(10) DEFAULT 'en',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure for view `admin_stats`
--
DROP TABLE IF EXISTS `admin_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `admin_stats`  AS SELECT (select count(0) from `users`) AS `total_users`, (select count(0) from `users` where `users`.`account_status` = 'active' or `users`.`account_status` is null) AS `active_users`, (select count(0) from `users` where `users`.`account_status` = 'banned') AS `banned_users`, (select count(0) from `users` where `users`.`is_online` = 1) AS `online_users`, (select count(0) from `users` where cast(`users`.`created_at` as date) = curdate()) AS `new_users_today`, (select count(0) from `messages` where cast(`messages`.`created_at` as date) = curdate()) AS `messages_today`, (select count(0) from `messages`) AS `total_messages`, (select count(0) from `chat_groups`) AS `total_groups`, (select count(0) from `ads` where `ads`.`status` = 'active') AS `active_ads`, (select count(0) from `api_keys` where `api_keys`.`status` = 'active') AS `active_api_keys`, (select count(0) from `unban_requests` where `unban_requests`.`status` = 'pending') AS `pending_unban_requests` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `active_calls`
--
ALTER TABLE `active_calls`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `room_id` (`room_id`);

--
-- Indexes for table `active_call_members`
--
ALTER TABLE `active_call_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_acm` (`room_id`,`user_id`);

--
-- Indexes for table `admin_activity_log`
--
ALTER TABLE `admin_activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_admin_log_admin` (`admin_id`),
  ADD KEY `idx_admin_log_date` (`created_at`);

--
-- Indexes for table `admin_roles`
--
ALTER TABLE `admin_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `ads`
--
ALTER TABLE `ads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `ad_balance`
--
ALTER TABLE `ad_balance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `ad_events`
--
ALTER TABLE `ad_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ad_events_ad` (`ad_id`),
  ADD KEY `idx_ad_events_type` (`event_type`),
  ADD KEY `idx_ad_events_date` (`created_at`);

--
-- Indexes for table `api_keys`
--
ALTER TABLE `api_keys`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `api_key` (`api_key`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `api_request_logs`
--
ALTER TABLE `api_request_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_api_logs_key` (`api_key_id`),
  ADD KEY `idx_api_logs_date` (`created_at`);

--
-- Indexes for table `app_settings`
--
ALTER TABLE `app_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `blocked_users`
--
ALTER TABLE `blocked_users`
  ADD PRIMARY KEY (`user_id`,`blocked_id`),
  ADD KEY `blocked_id` (`blocked_id`);

--
-- Indexes for table `call_history`
--
ALTER TABLE `call_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_call_hist_caller` (`caller_id`,`started_at`),
  ADD KEY `idx_call_hist_callee` (`callee_id`,`started_at`);

--
-- Indexes for table `chat_groups`
--
ALTER TABLE `chat_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `chat_settings`
--
ALTER TABLE `chat_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_chat` (`user_id`,`chat_key`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_uc` (`user_id`,`contact_id`),
  ADD KEY `contact_id` (`contact_id`),
  ADD KEY `idx_user_contacts_uid` (`user_id`);

--
-- Indexes for table `group_members`
--
ALTER TABLE `group_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_group_user` (`group_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `live_locations`
--
ALTER TABLE `live_locations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_live_session` (`session_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `receiver_id` (`receiver_id`),
  ADD KEY `idx_private` (`sender_id`,`receiver_id`,`created_at`),
  ADD KEY `idx_group` (`group_id`,`created_at`);

--
-- Indexes for table `message_reactions`
--
ALTER TABLE `message_reactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_mr` (`message_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `message_status`
--
ALTER TABLE `message_status`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_msg_user` (`message_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `payment_gateways`
--
ALTER TABLE `payment_gateways`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_token` (`token_hash`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `status_likes`
--
ALTER TABLE `status_likes`
  ADD PRIMARY KEY (`status_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `status_posts`
--
ALTER TABLE `status_posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `expires_at` (`expires_at`);

--
-- Indexes for table `status_views`
--
ALTER TABLE `status_views`
  ADD PRIMARY KEY (`status_id`,`viewer_id`),
  ADD KEY `viewer_id` (`viewer_id`);

--
-- Indexes for table `unban_requests`
--
ALTER TABLE `unban_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_username` (`username`);

--
-- Indexes for table `user_ads`
--
ALTER TABLE `user_ads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user_ad_events`
--
ALTER TABLE `user_ad_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_ad_events_ad` (`ad_id`),
  ADD KEY `idx_user_ad_events_owner` (`owner_user_id`),
  ADD KEY `idx_user_ad_events_date` (`created_at`);

--
-- Indexes for table `user_ad_leads`
--
ALTER TABLE `user_ad_leads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_ad_leads_ad` (`ad_id`),
  ADD KEY `idx_user_ad_leads_owner` (`owner_user_id`);

--
-- Indexes for table `user_ad_payments`
--
ALTER TABLE `user_ad_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user_bans`
--
ALTER TABLE `user_bans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `banned_by` (`banned_by`);

--
-- Indexes for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `active_calls`
--
ALTER TABLE `active_calls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `active_call_members`
--
ALTER TABLE `active_call_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `admin_activity_log`
--
ALTER TABLE `admin_activity_log`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `admin_roles`
--
ALTER TABLE `admin_roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `ads`
--
ALTER TABLE `ads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `ad_balance`
--
ALTER TABLE `ad_balance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ad_events`
--
ALTER TABLE `ad_events`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `api_keys`
--
ALTER TABLE `api_keys`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `api_request_logs`
--
ALTER TABLE `api_request_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `app_settings`
--
ALTER TABLE `app_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `chat_settings`
--
ALTER TABLE `chat_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=289;

--
-- AUTO_INCREMENT for table `group_members`
--
ALTER TABLE `group_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `live_locations`
--
ALTER TABLE `live_locations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `message_reactions`
--
ALTER TABLE `message_reactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `message_status`
--
ALTER TABLE `message_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=274;

--
-- AUTO_INCREMENT for table `payment_gateways`
--
ALTER TABLE `payment_gateways`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `unban_requests`
--
ALTER TABLE `unban_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `user_ads`
--
ALTER TABLE `user_ads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_ad_events`
--
ALTER TABLE `user_ad_events`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_ad_leads`
--
ALTER TABLE `user_ad_leads`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_ad_payments`
--
ALTER TABLE `user_ad_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_bans`
--
ALTER TABLE `user_bans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_activity_log`
--
ALTER TABLE `admin_activity_log`
  ADD CONSTRAINT `admin_activity_log_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ads`
--
ALTER TABLE `ads`
  ADD CONSTRAINT `ads_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ad_balance`
--
ALTER TABLE `ad_balance`
  ADD CONSTRAINT `ad_balance_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ad_events`
--
ALTER TABLE `ad_events`
  ADD CONSTRAINT `ad_events_ibfk_1` FOREIGN KEY (`ad_id`) REFERENCES `ads` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `api_keys`
--
ALTER TABLE `api_keys`
  ADD CONSTRAINT `api_keys_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `api_request_logs`
--
ALTER TABLE `api_request_logs`
  ADD CONSTRAINT `api_request_logs_ibfk_1` FOREIGN KEY (`api_key_id`) REFERENCES `api_keys` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `blocked_users`
--
ALTER TABLE `blocked_users`
  ADD CONSTRAINT `bu_fk1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bu_fk2` FOREIGN KEY (`blocked_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `call_history`
--
ALTER TABLE `call_history`
  ADD CONSTRAINT `call_history_ibfk_1` FOREIGN KEY (`caller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `call_history_ibfk_2` FOREIGN KEY (`callee_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `chat_groups`
--
ALTER TABLE `chat_groups`
  ADD CONSTRAINT `chat_groups_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_settings`
--
ALTER TABLE `chat_settings`
  ADD CONSTRAINT `cs_fk1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `contacts`
--
ALTER TABLE `contacts`
  ADD CONSTRAINT `contacts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contacts_ibfk_2` FOREIGN KEY (`contact_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `group_members`
--
ALTER TABLE `group_members`
  ADD CONSTRAINT `group_members_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `chat_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `live_locations`
--
ALTER TABLE `live_locations`
  ADD CONSTRAINT `live_locations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`group_id`) REFERENCES `chat_groups` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `message_reactions`
--
ALTER TABLE `message_reactions`
  ADD CONSTRAINT `message_reactions_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `message_reactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `message_status`
--
ALTER TABLE `message_status`
  ADD CONSTRAINT `message_status_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `message_status_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `status_likes`
--
ALTER TABLE `status_likes`
  ADD CONSTRAINT `sl_fk1` FOREIGN KEY (`status_id`) REFERENCES `status_posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sl_fk2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `status_posts`
--
ALTER TABLE `status_posts`
  ADD CONSTRAINT `sp_fk1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `status_views`
--
ALTER TABLE `status_views`
  ADD CONSTRAINT `sv_fk1` FOREIGN KEY (`status_id`) REFERENCES `status_posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sv_fk2` FOREIGN KEY (`viewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `unban_requests`
--
ALTER TABLE `unban_requests`
  ADD CONSTRAINT `unban_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_ads`
--
ALTER TABLE `user_ads`
  ADD CONSTRAINT `user_ads_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_ad_events`
--
ALTER TABLE `user_ad_events`
  ADD CONSTRAINT `user_ad_events_ibfk_1` FOREIGN KEY (`ad_id`) REFERENCES `user_ads` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_ad_leads`
--
ALTER TABLE `user_ad_leads`
  ADD CONSTRAINT `user_ad_leads_ibfk_1` FOREIGN KEY (`ad_id`) REFERENCES `user_ads` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_ad_payments`
--
ALTER TABLE `user_ad_payments`
  ADD CONSTRAINT `user_ad_payments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_bans`
--
ALTER TABLE `user_bans`
  ADD CONSTRAINT `user_bans_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_bans_ibfk_2` FOREIGN KEY (`banned_by`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD CONSTRAINT `us_fk1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
