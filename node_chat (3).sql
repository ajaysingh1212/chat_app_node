-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 31, 2026 at 10:45 AM
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
  `duration_s` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `call_history`
--

INSERT INTO `call_history` (`id`, `caller_id`, `callee_id`, `group_id`, `call_type`, `status`, `started_at`, `ended_at`, `duration`, `is_group`, `duration_s`) VALUES
('mncx4i3cfbe6a3a394', 7, 1, NULL, 'audio', '', '2026-03-30 08:20:39', '2026-03-30 08:20:41', 0, 0, 1),
('mncx4p716fbbef5d6d', 7, 1, NULL, 'video', '', '2026-03-30 08:20:49', NULL, 0, 0, 0),
('mncx52wxc0bf5497f4', 7, 1, NULL, 'video', '', '2026-03-30 08:21:06', NULL, 0, 0, 0),
('mncx5fole666b93ac6', 1, 7, NULL, 'video', '', '2026-03-30 08:21:23', '2026-03-30 08:21:48', 0, 0, 25),
('mncx64csba77c6f3bf', 7, 1, NULL, 'video', '', '2026-03-30 08:21:53', NULL, 0, 0, 0),
('mndgxv8t4f334ad5ef', 1, 2, NULL, 'video', '', '2026-03-30 17:35:22', NULL, 0, 0, 0),
('mndgy84de1187b0747', 1, 2, NULL, 'video', '', '2026-03-30 17:35:38', NULL, 0, 0, 0),
('mndh1tpo557d62903b', 2, 1, NULL, 'video', 'missed', '2026-03-30 17:38:22', NULL, 0, 0, 0),
('mndh22f69a7eb7f2b3', 2, 1, NULL, 'video', 'missed', '2026-03-30 17:38:34', NULL, 0, 0, 0),
('mndh2n0u3f11217c3f', 1, 2, NULL, 'video', '', '2026-03-30 17:39:04', NULL, 0, 0, 0),
('mndh4m667c1acfd0ea', 1, 2, NULL, 'video', '', '2026-03-30 17:40:35', NULL, 0, 0, 0),
('mndh53yg6b93477ab2', 1, 2, NULL, 'audio', '', '2026-03-30 17:40:58', NULL, 0, 0, 0),
('mndh5dnfbe218d7520', 2, 1, NULL, 'audio', 'missed', '2026-03-30 17:41:08', NULL, 0, 0, 0),
('mndh6hdn38dd4ece0f', 1, 2, NULL, 'video', 'missed', '2026-03-30 17:42:00', NULL, 0, 0, 0),
('mndh6u4y15d1c834d2', 1, 2, NULL, 'video', 'missed', '2026-03-30 17:42:16', NULL, 0, 0, 0),
('mndi68qqb5c83c0118', 2, 1, NULL, 'video', 'completed', '2026-03-30 18:09:54', '2026-03-30 18:15:58', 0, 0, 259),
('mndiea2t21b18c2a67', 2, 1, NULL, 'video', '', '2026-03-30 18:16:07', NULL, 0, 0, 0),
('mndin2mi4be741bde3', 1, 2, NULL, 'video', 'completed', '2026-03-30 18:23:02', '2026-03-30 18:25:05', 0, 0, 123),
('mndj2x315e00237db1', 1, 8, NULL, 'video', '', '2026-03-30 18:35:21', NULL, 0, 0, 0),
('mne8xl2na2782da105', 1, 7, NULL, 'video', '', '2026-03-31 06:38:59', NULL, 0, 0, 0),
('mne8ycit162ce02af9', 1, 6, NULL, 'video', 'completed', '2026-03-31 06:39:58', '2026-03-31 06:41:49', 0, 0, 111),
('mne91u4t387efec415', 2, 1, NULL, 'video', '', '2026-03-31 06:42:15', NULL, 0, 0, 0),
('mned3bn29399c1c526', 1, 7, NULL, 'video', 'missed', '2026-03-31 08:35:20', NULL, 0, 0, 0),
('mned3v9be3abe4c8de', 1, 9, NULL, 'video', 'completed', '2026-03-31 08:35:49', '2026-03-31 08:36:11', 0, 0, 21),
('mned4ihgb43eb119ad', 1, 6, NULL, 'video', 'completed', '2026-03-31 08:36:20', '2026-03-31 08:36:34', 0, 0, 13),
('mned51vy9ff8fa4577', 1, 9, NULL, 'video', 'completed', '2026-03-31 08:36:50', '2026-03-31 08:37:12', 0, 0, 21),
('mned5stjedbc949111', 6, 5, NULL, 'video', 'missed', '2026-03-31 08:37:15', NULL, 0, 0, 0),
('mned5u7o8b8ad3373a', 1, 9, NULL, 'video', 'completed', '2026-03-31 08:37:22', '2026-03-31 08:38:30', 0, 0, 67),
('mned6ugne8b9890b7d', 6, 9, NULL, 'video', 'completed', '2026-03-31 08:38:14', '2026-03-31 08:38:35', 0, 0, 21);

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
(1, 1, 'p:sonu', 'off', 'default', NULL, 0, NULL, 0, 0, '2026-03-30 22:39:16', '2026-03-30 23:59:45'),
(5, 1, 'p:Sanket New', 'off', 'default', NULL, 1, '$2a$10$j4fHna2lkBDFK7UPQiqAVePP9TgJmD1ZdAL2zzcGP4EaUIco39FgS', 0, 0, '2026-03-30 22:56:43', '2026-03-30 22:57:24'),
(10, 6, 'p:ajay', 'off', 'default', NULL, 1, '$2a$10$8Iy1sGZz5.rOEA5/GHogGumyTbSXlHgWN3kZdf3lUD/WC93s.A5f6', 0, 0, '2026-03-31 12:17:25', '2026-03-31 12:22:51'),
(11, 7, 'p:sonu', 'off', 'rose', NULL, 0, NULL, 0, 0, '2026-03-31 12:17:26', '2026-03-31 12:17:31');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
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
  `msg_type` enum('text','image','file','audio','video','call') DEFAULT 'text',
  `file_path` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `is_edited` tinyint(1) DEFAULT 0,
  `deleted_both` tinyint(1) DEFAULT 0,
  `deleted_for` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`deleted_for`)),
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `disappears_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `group_id`, `content`, `content_iv`, `msg_type`, `file_path`, `file_name`, `file_size`, `file_type`, `is_edited`, `deleted_both`, `deleted_for`, `created_at`, `updated_at`, `disappears_at`) VALUES
('mn8tnsd82licf', 1, 2, NULL, 'b04f31fe02b37609182ef1d9833f0b75', '467d72c339d0f72a63c9d41cb720aafa', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-27 17:15:19', '2026-03-27 17:15:19', NULL),
('mn8u4rkp3nmbt', 1, 2, NULL, 'aec48180687d709f33ce727da67622d2', '89590a50b6e22b854532bc23ae583725', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-27 17:15:44', '2026-03-27 17:15:44', NULL),
('mn8u54ibh0ld4', 2, 1, NULL, 'f898af769741aa43172b16251644b18c', '6bcf9146a3f9a67431e14d4729b11925', 'text', NULL, NULL, NULL, NULL, 1, 1, NULL, '2026-03-27 17:16:00', '2026-03-27 17:16:34', NULL),
('mn8u5chv85els', 1, 2, NULL, 'ede8e2af8679b70279991cd536084062', '08788ebe91e8534b86de792009e21992', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-27 17:16:11', '2026-03-27 17:16:11', NULL),
('mn8u6k7or0q4d', 2, 1, NULL, NULL, NULL, 'image', '/uploads/1774612027838-0a37e19c84b6.png', 'icons8-plus-100 (1).png', 1358, 'image/png', 0, 0, NULL, '2026-03-27 17:17:07', '2026-03-27 17:17:07', NULL),
('mn8uq6xvd9jxt', 3, 4, NULL, '071ce180c823e9ce8a38df6ee7183071', '9532d28c67b7afd9d7547243ac3fd886', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-27 17:32:25', '2026-03-27 17:32:25', NULL),
('mn8v7svhj56jj', 1, 4, NULL, '6b89ca61da87b289f0fd81c3072f2254', 'f437158df139be79841098ef11ab5e78', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-27 17:46:05', '2026-03-27 17:46:05', NULL),
('mn8vdsmda54j2', 1, 4, NULL, NULL, NULL, 'file', '/uploads/1774614044931-862d89a94788.pdf', 'GURUWA SINGH MUNDA  ADCA C Bundu.pdf', 555081, 'application/pdf', 0, 1, NULL, '2026-03-27 17:50:44', '2026-03-27 17:50:51', NULL),
('mncry5sgjewdo', 5, 2, NULL, '5a89475f74c39fd49999d9d2746b805e', 'f305594c9a777dc70ad2c7e12273dff8', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-30 11:25:43', '2026-03-30 11:25:43', NULL),
('mncrygl1o5gyk', 5, 2, NULL, '173b77f1ccffeecb433c53b9e745e105', '89a696543a2eecb66d15fe25b691240a', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-30 11:25:57', '2026-03-30 11:25:57', NULL),
('mncrz0bhmrxhn', 5, 2, NULL, '7fbe9396fdfd03f6eee942b3973d308b', 'ac45bce40ad6a66d363e99329a93b4d3', 'text', NULL, NULL, NULL, NULL, 0, 1, NULL, '2026-03-30 11:26:23', '2026-03-30 11:27:38', NULL),
('mncs0ewwfxp1b', 5, 3, NULL, '1371fbe6f077eaa61bddfea02ac74434', '151c5f873659ca8941c52d3348cc5d84', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-30 11:27:28', '2026-03-30 11:27:28', NULL),
('mncs1dumhijxl', 5, 2, NULL, NULL, NULL, 'file', '/uploads/1774850293561-d4ef650c483a.pdf', '1690288584_PT06 protocol.pdf', 174520, 'application/pdf', 0, 0, NULL, '2026-03-30 11:28:13', '2026-03-30 11:28:13', NULL),
('mncs84fu0y7su', 2, 1, NULL, '638f7a0f1f6d41d6dbcab12b27812e2c', '3a8d28ec73853c1a6c0f3a8b6210fd59', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-30 11:33:26', '2026-03-30 11:33:26', NULL),
('mncsqsio8r1uj', 6, 1, NULL, '31b591fc45568bd59a6f7a8d43d38329', '168a685f891346f739c388e66cb4716e', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-30 11:47:58', '2026-03-30 11:47:58', NULL),
('mncsqxf8urxtw', 5, 6, NULL, '80714299a17a0c3b0e8ec28d6ed02a06', '0012fbf66be7da365dd1cd8f8a58aa04', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-30 11:48:05', '2026-03-30 11:48:05', NULL),
('mncsr1fbdfmzk', 5, 6, NULL, '8950dedbae01895f73d24cb8139e7693', 'f9df90eb411e2fd12c492e24782e823b', 'text', NULL, NULL, NULL, NULL, 0, 1, NULL, '2026-03-30 11:48:10', '2026-03-30 11:48:19', NULL),
('mncsr8t0ar3u8', 6, 5, NULL, '6c304380f63fa374bc81872869795f16', 'e620270f45dbbb878d2bbbbdd447cc18', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-30 11:48:20', '2026-03-30 11:48:20', NULL),
('mncsrzed15g0c', 6, NULL, 'mncsruxw8120k', '363ff1fee4677278e51460747414efc4', '8c0b4ad80ded85ebd926167c2f730a10', 'text', NULL, NULL, NULL, NULL, 1, 0, NULL, '2026-03-30 11:48:54', '2026-03-30 11:49:21', NULL),
('mncss4uct1wro', 5, NULL, 'mncsruxw8120k', '7b0b3c1ae7c6669544fb1cf79270c7b6', 'd6d5f47a405a039fb20be5c24264c670', 'text', NULL, NULL, NULL, NULL, 1, 0, NULL, '2026-03-30 11:49:01', '2026-03-30 11:49:18', NULL),
('mncx301uadsmx', 1, 7, NULL, '28ffc91e7ac6fe1991bd44b88dc3e158a34616f0e50514d13a47a99fb5afc05cd36ca80d92f69cbc446dea53dbf1722bc5ff47ff50e8b1cedf5af9bebe904f25', 'c125feb8351d888c8fc535776c678c45', '', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-30 13:49:55', '2026-03-30 13:49:55', NULL),
('mnd3kq9qhpe0w', 2, 1, NULL, '675ff50ba214daf937d5fc8362d2a07f', '65be5a80cd1ae5be06dfcc78a70b6187', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-30 16:51:10', '2026-03-30 16:51:10', NULL),
('mnd6qe9vp42vc', 2, 7, NULL, 'edf11970b52a4dee00b0a3b1a2201fc4', '9ced73f4cd8c1e464d5e7702b68f0587', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-30 18:19:33', '2026-03-30 18:19:33', NULL),
('mndfym3zoxxwn', 1, 2, NULL, 'b1a84bb52aa2589e8c13c4d3f100e2c7f7f3536246bc26e771c328d0991a2f87589a344264da8b107042f8ea9a7f977d346dcb9121672eef5a247bad1e02f614d2c8ef681ba51ed68c7ccdc9bc047149', '9c1cb3d79df5290697aeeba5b8b9dac9', '', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-30 22:37:53', '2026-03-30 22:37:53', NULL),
('mndgpkp8bt4ok', 1, 2, NULL, 'cda9cb56e7c49b58a17f2a99e00aaa89', '2d2b3c0c24593a5f5ce22920a410db88', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-30 22:58:51', '2026-03-30 22:58:51', NULL),
('mndgxolzqbwat', 1, 2, NULL, '053686e8721f12a268192f7048231541', '4b2d32c0a34d3404959f0012247c2c16', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-30 23:05:09', '2026-03-30 23:05:09', NULL),
('mndh3ohpaf8jq', 1, 2, NULL, '2d3d7472d389bd94401fa3651ed10477c1bfe5c6541a651147ed1e8b13f6e3980a1ec482dd359031e7f71dca92489295f332426a0ff320694d1c13ab890f5778cca2964e6afd1159be9c274e236c6176621706fc5ea5f4692a8c0ff38d87fc40', 'cdbfb2cc1a38ab9c0ae9789857a651a3', '', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-30 23:09:49', '2026-03-30 23:09:49', NULL),
('mnditt299ni9f', 1, 2, NULL, '310b0fa70182e1096eb137ac78d0440e', '648c184d413ab86109f44eb0bfaf3e8d', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-30 23:58:07', '2026-03-30 23:58:07', NULL),
('mne8vi8jhy23j', 6, 1, NULL, 'e836fff7f98aade35f80f01937e9e2ed', '37ccfa76e21dc086773102fe6f554964', 'text', NULL, NULL, NULL, NULL, 1, 1, NULL, '2026-03-31 12:07:18', '2026-03-31 12:07:46', NULL),
('mne8wtwp3ipv0', 6, 1, NULL, 'b9fcdf3c6dabbbc09d09954579b9fce2cfa7ddcbf178099f0fc256a3d17c68e37870b9860741df0178da69ca93696458b3047e8151ec9083fcfe4bd874b469f9765c1e5b9612c780905b6f73cf7f96ed0bb6b9e324a020a9103cd0d9ea01565f', 'd19c645a9c378d649b3b081ef93b9ed9', '', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-31 12:08:20', '2026-03-31 12:08:20', NULL),
('mne8y0x6k6sov', 7, 1, NULL, '88290641033c77231f5862cbe3febca2', '609416965a490cde99af6f94ab4af00d', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-31 12:09:15', '2026-03-31 12:09:15', NULL),
('mne9bmomr0xi1', 6, 1, NULL, 'a2803e84a276b935f588213c4dd7aeb5', '51d0ed2339d557b7d1bdb5780ebc6d45', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-31 12:19:50', '2026-03-31 12:19:50', NULL),
('mne9chw96cteq', 6, 1, NULL, 'f549825f32e0cf81005472c11cf5efd5', '0672c2ef2c07ce93c83e94f3da44369a', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-31 12:20:31', '2026-03-31 12:20:31', NULL),
('mne9cjnkhbh56', 6, 1, NULL, '0b7294f84bc43b02fe63682bdb70cd76', '9cc9d582a07aeddb58792172bbc35244', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-31 12:20:33', '2026-03-31 12:20:33', NULL),
('mne9cql5nujy0', 1, 6, NULL, '4c3ba1da5e0b957b69575aaedc26cfae', '49665bc04355ee0a684a06b2f90b0e1f', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-31 12:20:41', '2026-03-31 12:20:41', NULL),
('mne9crpv7xg45', 1, 6, NULL, '48a06c3dce6235f7b9f7496a4e9fb574', '4a031be15bc340397485555f164aae9a', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-31 12:20:42', '2026-03-31 12:20:42', NULL),
('mne9csnu9qx25', 1, 6, NULL, '093f9ed3e0f4750508000d56ffeadf5c', '1fdbb62e44e52d84c3d0bfd9a9e70869', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-31 12:20:43', '2026-03-31 12:20:43', NULL),
('mne9eitv43utm', 1, 6, NULL, NULL, NULL, 'image', '/uploads/1774939924346-ad1f1e913449.webp', 'preview.webp', 64306, 'image/webp', 0, 0, NULL, '2026-03-31 12:22:04', '2026-03-31 12:22:04', NULL),
('mne9itt2pmerm', 6, 1, NULL, 'ea592ee9c25d6637178ed285309077be2b6c904a84452e2ad957019c7c29d2d66840c396f82bef040b2e43d1a5dd97e7da9ad750a795e5ad75bf1b4ca44835493616a37d426a03bff6e058aadc40127a09ed597c52dc7aeef589cdcca97da1eb', '909f129e06de5d13ea5a25691cbd5f0d', '', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-31 12:25:26', '2026-03-31 12:25:26', NULL),
('mne9lgpbi5leg', 6, 5, NULL, 'e915fa53608e0b55f90319dc98e9ef89', '9560df2c498f4c0ee184407996bbbc18', 'text', NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-03-31 12:27:29', '2026-03-31 12:27:29', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `message_status`
--

CREATE TABLE `message_status` (
  `id` int(11) NOT NULL,
  `message_id` varchar(40) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` enum('delivered','seen') DEFAULT 'delivered',
  `seen_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `message_status`
--

INSERT INTO `message_status` (`id`, `message_id`, `user_id`, `status`, `seen_at`) VALUES
(1, 'mn8tnsd82licf', 2, 'delivered', NULL),
(2, 'mn8u4rkp3nmbt', 2, 'seen', '2026-03-27 17:15:44'),
(4, 'mn8u54ibh0ld4', 1, 'seen', '2026-03-27 17:16:00'),
(6, 'mn8u5chv85els', 2, 'seen', '2026-03-27 17:16:11'),
(8, 'mn8u6k7or0q4d', 1, 'seen', '2026-03-27 17:17:07'),
(10, 'mn8uq6xvd9jxt', 4, 'delivered', NULL),
(11, 'mn8v7svhj56jj', 4, 'seen', '2026-03-27 17:46:05'),
(13, 'mncry5sgjewdo', 2, 'seen', '2026-03-30 11:25:43'),
(15, 'mncrygl1o5gyk', 2, 'delivered', NULL),
(16, 'mncrz0bhmrxhn', 2, 'seen', '2026-03-30 11:26:23'),
(18, 'mncs1dumhijxl', 2, 'seen', '2026-03-30 11:28:13'),
(20, 'mncs84fu0y7su', 1, 'seen', '2026-03-30 11:33:26'),
(22, 'mncsqsio8r1uj', 1, 'delivered', NULL),
(23, 'mncsqxf8urxtw', 6, 'delivered', NULL),
(24, 'mncsr1fbdfmzk', 6, 'delivered', NULL),
(25, 'mncsr8t0ar3u8', 5, 'seen', '2026-03-30 11:48:20'),
(27, 'mncx301uadsmx', 7, 'delivered', NULL),
(28, 'mnd3kq9qhpe0w', 1, 'delivered', NULL),
(29, 'mndgxolzqbwat', 2, 'seen', '2026-03-30 23:05:09'),
(31, 'mndh3ohpaf8jq', 2, 'seen', '2026-03-30 23:09:49'),
(33, 'mnditt299ni9f', 2, 'seen', '2026-03-30 23:58:08'),
(35, 'mne8vi8jhy23j', 1, 'delivered', NULL),
(36, 'mne8wtwp3ipv0', 1, 'seen', '2026-03-31 12:08:20'),
(38, 'mne8y0x6k6sov', 1, 'seen', '2026-03-31 12:09:15'),
(40, 'mne9bmomr0xi1', 1, 'seen', '2026-03-31 12:19:50'),
(43, 'mne9chw96cteq', 1, 'delivered', '2026-03-31 12:20:31'),
(44, 'mne9cjnkhbh56', 1, 'seen', '2026-03-31 12:20:33'),
(46, 'mne9cql5nujy0', 6, 'seen', '2026-03-31 12:20:41'),
(48, 'mne9crpv7xg45', 6, 'seen', '2026-03-31 12:20:42'),
(50, 'mne9csnu9qx25', 6, 'seen', '2026-03-31 12:20:43'),
(52, 'mne9eitv43utm', 6, 'seen', '2026-03-31 12:22:04'),
(54, 'mne9itt2pmerm', 1, 'seen', '2026-03-31 12:25:26');

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
  `live_loc_enabled` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `phone`, `about`, `profile_pic`, `last_seen_privacy`, `profile_pic_privacy`, `about_privacy`, `group_add_privacy`, `two_step_enabled`, `two_step_pin`, `password_hash`, `avatar_color`, `is_online`, `last_seen`, `created_at`, `avatar_url`, `priv_last_seen`, `priv_photo`, `priv_about`, `priv_group_add`, `live_loc_enabled`) VALUES
(1, 'ajay', 'sonu@gmail.com', '8294169540', '', '/uploads/c-1774868559032-a159c336fd45.jpg', 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, '$2a$12$zpotu2hYK2eUzWJn7lmNx.b1fKcmqbL0JHOGRbckSzYtU1fpUHtKm', '#6A1B9A', 1, NULL, '2026-03-27 16:46:20', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 1),
(2, 'sonu', 'ajay@gmail.com', '', 'Hey there! I am using ChatApp.', '/uploads/c-1774895344804-569bf97b8a1c.jpg', 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, '$2a$12$Y3JW8JqnfN4AuRBkotf5p.J1RFThnnSV71J/nUyyL3qgtW4kS1Y1y', '#1565C0', 1, NULL, '2026-03-27 16:47:08', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0),
(3, 'rahul', 'rahul554@gmail.com', NULL, 'Hey there! I am using ChatApp.', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, '$2a$12$IXj9QQL1fYBkYNmkOWFJh.T3qcxg9/ab3p2c8Clsqutm3aM6CGFPO', '#00838F', 0, '2026-03-27 17:36:10', '2026-03-27 17:31:19', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0),
(4, 'AAS', 'ajaykumarwrs1997@gmail.com', NULL, 'Hey there! I am using ChatApp.', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, '$2a$12$O/aQz7JRn78UyoHnBujTA.i3VI02Zwu5PCpqLAxZjioby08QKKozG', '#6A1B9A', 0, '2026-03-27 17:47:08', '2026-03-27 17:31:45', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0),
(5, 'Sanket Kumar', 'sanket@gmail.com', NULL, 'Hey there! I am using ChatApp.', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, '$2a$12$glEpPHw9X5R5i8UMWE7QCed4VF2LXfB57BBudn6Hu43r7LOhSe/ca', '#00A884', 0, '2026-03-31 14:04:12', '2026-03-30 11:24:18', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0),
(6, 'Mansi', 'mansi.eemotrack@gmail.com', '9534064840', 'Not Available', '/uploads/1774939413403-8e7e1e9fffc6.jpeg', 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, '$2a$12$aXudOaWZCRfu5y9sYObNQe9rX6.J9L2FewTNTkR8OPeOoiX7ERY4a', '#E65100', 1, NULL, '2026-03-30 11:46:21', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0),
(7, 'Sanket New', 'new@gmail.com', '', '', '/uploads/1774865372755-3d288d2d5835.png', 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, '$2a$12$QnAoKHC3mhvEj/7P1dNsLODIGjJN9XU48soKBsV.PgujUS9roJOZy', '#2E7D32', 0, '2026-03-31 12:22:44', '2026-03-30 13:46:58', NULL, 'nobody', 'nobody', 'everyone', 'everyone', 1),
(8, 'rahul1', 'rahul@gmail.com', NULL, 'Hey there! I am using ChatApp.', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, '$2a$12$Sn489cNsUIJ4MErEa0MSL.yTV4EddYoiV978ldjGla/JW/V4hXqnG', '#E65100', 0, '2026-03-31 00:07:40', '2026-03-31 00:04:40', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0),
(9, 'Sanket K', 'sanketkumar@gmail.com', NULL, 'Hey there! I am using ChatApp.', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0, NULL, '$2a$12$HImcyhaFsNu8sZTKUhoNk.eY27MStTZMKhLrK5it/EQmOjEjepoNy', '#2E7D32', 1, NULL, '2026-03-31 14:04:50', NULL, 'everyone', 'everyone', 'everyone', 'everyone', 0);

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

--
-- Indexes for dumped tables
--

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
-- Indexes for table `message_status`
--
ALTER TABLE `message_status`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_msg_user` (`message_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

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
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_username` (`username`);

--
-- Indexes for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `chat_settings`
--
ALTER TABLE `chat_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

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
-- AUTO_INCREMENT for table `message_status`
--
ALTER TABLE `message_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

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
-- Constraints for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD CONSTRAINT `us_fk1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
