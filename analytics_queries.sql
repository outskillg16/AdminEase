-- ============================================================
-- APPOINTMENT SOURCE TRACKING - ANALYTICS QUERIES
-- ============================================================
--
-- This file contains ready-to-use SQL queries for analyzing
-- appointment creation sources in AdminEase.
--
-- Usage: Copy and paste queries into Supabase SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- 1. APPOINTMENT SOURCE DISTRIBUTION
-- Shows how many appointments were created through each method
-- ------------------------------------------------------------
SELECT
  appointment_source,
  COUNT(*) as total_appointments,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM appointments
GROUP BY appointment_source
ORDER BY total_appointments DESC;


-- ------------------------------------------------------------
-- 2. CANCELLATION RATE BY SOURCE
-- Identifies which creation method has the highest cancellation rate
-- ------------------------------------------------------------
SELECT
  appointment_source,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'canceled' THEN 1 ELSE 0 END) as cancelled,
  ROUND(100.0 * SUM(CASE WHEN status = 'canceled' THEN 1 ELSE 0 END) / COUNT(*), 2) as cancellation_rate_pct
FROM appointments
GROUP BY appointment_source
ORDER BY cancellation_rate_pct DESC;


-- ------------------------------------------------------------
-- 3. COMPLETION RATE BY SOURCE
-- Shows which method leads to the highest appointment completion
-- ------------------------------------------------------------
SELECT
  appointment_source,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
  ROUND(100.0 * SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*), 2) as completion_rate_pct
FROM appointments
GROUP BY appointment_source
ORDER BY completion_rate_pct DESC;


-- ------------------------------------------------------------
-- 4. NO-SHOW RATE BY SOURCE
-- Analyzes which source has the highest no-show rate
-- ------------------------------------------------------------
SELECT
  appointment_source,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as no_shows,
  ROUND(100.0 * SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) / COUNT(*), 2) as no_show_rate_pct
FROM appointments
GROUP BY appointment_source
ORDER BY no_show_rate_pct DESC;


-- ------------------------------------------------------------
-- 5. SOURCE TREND - LAST 30 DAYS
-- Tracks appointment sources over the last 30 days
-- ------------------------------------------------------------
SELECT
  DATE(created_at) as date,
  appointment_source,
  COUNT(*) as appointments
FROM appointments
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), appointment_source
ORDER BY date DESC, appointment_source;


-- ------------------------------------------------------------
-- 6. SOURCE TREND - LAST 7 DAYS (Daily)
-- Daily breakdown of appointment sources for the past week
-- ------------------------------------------------------------
SELECT
  DATE(created_at) as date,
  appointment_source,
  COUNT(*) as appointments
FROM appointments
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at), appointment_source
ORDER BY date DESC, appointment_source;


-- ------------------------------------------------------------
-- 7. PEAK CREATION HOURS BY SOURCE
-- Identifies when appointments are created by each method
-- ------------------------------------------------------------
SELECT
  appointment_source,
  EXTRACT(HOUR FROM created_at) as hour_of_day,
  COUNT(*) as appointments_created
FROM appointments
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY appointment_source, EXTRACT(HOUR FROM created_at)
ORDER BY appointment_source, hour_of_day;


-- ------------------------------------------------------------
-- 8. MONTHLY COMPARISON
-- Compares appointment sources month over month
-- ------------------------------------------------------------
SELECT
  DATE_TRUNC('month', created_at) as month,
  appointment_source,
  COUNT(*) as appointments,
  LAG(COUNT(*)) OVER (
    PARTITION BY appointment_source
    ORDER BY DATE_TRUNC('month', created_at)
  ) as prev_month,
  COUNT(*) - LAG(COUNT(*)) OVER (
    PARTITION BY appointment_source
    ORDER BY DATE_TRUNC('month', created_at)
  ) as change
FROM appointments
WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', created_at), appointment_source
ORDER BY month DESC, appointment_source;


-- ------------------------------------------------------------
-- 9. USER PREFERENCE ANALYSIS
-- Shows which users prefer which appointment creation methods
-- ------------------------------------------------------------
SELECT
  user_id,
  appointment_source,
  COUNT(*) as count,
  RANK() OVER (
    PARTITION BY user_id
    ORDER BY COUNT(*) DESC
  ) as preference_rank
FROM appointments
GROUP BY user_id, appointment_source
ORDER BY user_id, preference_rank;


-- ------------------------------------------------------------
-- 10. AVERAGE DURATION BY SOURCE
-- Compares appointment durations across different sources
-- ------------------------------------------------------------
SELECT
  appointment_source,
  ROUND(AVG(duration_minutes), 0) as avg_duration_minutes,
  MIN(duration_minutes) as min_duration,
  MAX(duration_minutes) as max_duration,
  COUNT(*) as total_appointments
FROM appointments
GROUP BY appointment_source
ORDER BY avg_duration_minutes DESC;


-- ------------------------------------------------------------
-- 11. SERVICE TYPE DISTRIBUTION BY SOURCE
-- Shows which services are booked through which methods
-- ------------------------------------------------------------
SELECT
  appointment_source,
  service_type,
  COUNT(*) as appointments,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY appointment_source), 2) as pct_within_source
FROM appointments
GROUP BY appointment_source, service_type
ORDER BY appointment_source, appointments DESC;


-- ------------------------------------------------------------
-- 12. RESCHEDULE RATE BY SOURCE
-- Analyzes which source appointments are rescheduled most often
-- ------------------------------------------------------------
SELECT
  appointment_source,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'rescheduled' THEN 1 ELSE 0 END) as rescheduled,
  ROUND(100.0 * SUM(CASE WHEN status = 'rescheduled' THEN 1 ELSE 0 END) / COUNT(*), 2) as reschedule_rate_pct
FROM appointments
GROUP BY appointment_source
ORDER BY reschedule_rate_pct DESC;


-- ------------------------------------------------------------
-- 13. APPOINTMENT STATUS BREAKDOWN BY SOURCE
-- Complete status breakdown for each appointment source
-- ------------------------------------------------------------
SELECT
  appointment_source,
  status,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY appointment_source), 2) as percentage
FROM appointments
GROUP BY appointment_source, status
ORDER BY appointment_source, count DESC;


-- ------------------------------------------------------------
-- 14. WEEKLY APPOINTMENT VOLUME BY SOURCE
-- Shows appointment volume by day of week for each source
-- ------------------------------------------------------------
SELECT
  appointment_source,
  TO_CHAR(appointment_date, 'Day') as day_of_week,
  EXTRACT(ISODOW FROM appointment_date) as day_number,
  COUNT(*) as appointments
FROM appointments
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY appointment_source, TO_CHAR(appointment_date, 'Day'), EXTRACT(ISODOW FROM appointment_date)
ORDER BY appointment_source, day_number;


-- ------------------------------------------------------------
-- 15. LEAD TIME ANALYSIS BY SOURCE
-- Time between appointment creation and actual appointment date
-- ------------------------------------------------------------
SELECT
  appointment_source,
  ROUND(AVG(EXTRACT(EPOCH FROM (appointment_date - created_at)) / 86400), 1) as avg_lead_time_days,
  MIN(EXTRACT(EPOCH FROM (appointment_date - created_at)) / 86400) as min_lead_time_days,
  MAX(EXTRACT(EPOCH FROM (appointment_date - created_at)) / 86400) as max_lead_time_days,
  COUNT(*) as total_appointments
FROM appointments
WHERE appointment_date > created_at
GROUP BY appointment_source
ORDER BY avg_lead_time_days DESC;


-- ------------------------------------------------------------
-- 16. LOCATION TYPE PREFERENCE BY SOURCE
-- Which sources prefer virtual vs in-person vs phone appointments
-- ------------------------------------------------------------
SELECT
  appointment_source,
  location_type,
  COUNT(*) as appointments,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY appointment_source), 2) as pct_within_source
FROM appointments
GROUP BY appointment_source, location_type
ORDER BY appointment_source, appointments DESC;


-- ------------------------------------------------------------
-- 17. DATA QUALITY CHECK
-- Ensures no NULL or invalid values in appointment_source
-- ------------------------------------------------------------
SELECT
  'Total Appointments' as metric,
  COUNT(*) as count
FROM appointments

UNION ALL

SELECT
  'With Valid Source' as metric,
  COUNT(*) as count
FROM appointments
WHERE appointment_source IN ('ui_manual', 'ai_chat', 'ai_voice', 'voice_agent_call')

UNION ALL

SELECT
  'NULL Sources' as metric,
  COUNT(*) as count
FROM appointments
WHERE appointment_source IS NULL

UNION ALL

SELECT
  'Invalid Sources' as metric,
  COUNT(*) as count
FROM appointments
WHERE appointment_source NOT IN ('ui_manual', 'ai_chat', 'ai_voice', 'voice_agent_call');


-- ------------------------------------------------------------
-- 18. GROWTH RATE BY SOURCE
-- Week-over-week growth for each appointment source
-- ------------------------------------------------------------
WITH weekly_data AS (
  SELECT
    DATE_TRUNC('week', created_at) as week,
    appointment_source,
    COUNT(*) as appointments
  FROM appointments
  WHERE created_at >= CURRENT_DATE - INTERVAL '12 weeks'
  GROUP BY DATE_TRUNC('week', created_at), appointment_source
)
SELECT
  week,
  appointment_source,
  appointments,
  LAG(appointments) OVER (PARTITION BY appointment_source ORDER BY week) as prev_week,
  appointments - LAG(appointments) OVER (PARTITION BY appointment_source ORDER BY week) as change,
  ROUND(
    100.0 * (appointments - LAG(appointments) OVER (PARTITION BY appointment_source ORDER BY week)) /
    NULLIF(LAG(appointments) OVER (PARTITION BY appointment_source ORDER BY week), 0),
    2
  ) as growth_pct
FROM weekly_data
ORDER BY week DESC, appointment_source;


-- ------------------------------------------------------------
-- 19. CONVERSION FUNNEL BY SOURCE
-- From creation to completion for each source
-- ------------------------------------------------------------
SELECT
  appointment_source,
  COUNT(*) as created,
  SUM(CASE WHEN status IN ('scheduled', 'completed', 'rescheduled') THEN 1 ELSE 0 END) as not_cancelled,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
  ROUND(100.0 * SUM(CASE WHEN status IN ('scheduled', 'completed', 'rescheduled') THEN 1 ELSE 0 END) / COUNT(*), 2) as kept_rate,
  ROUND(100.0 * SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*), 2) as completion_rate
FROM appointments
GROUP BY appointment_source
ORDER BY completion_rate DESC;


-- ------------------------------------------------------------
-- 20. SUMMARY DASHBOARD QUERY
-- Quick overview of all key metrics by source
-- ------------------------------------------------------------
SELECT
  appointment_source,
  COUNT(*) as total_appointments,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN status = 'canceled' THEN 1 ELSE 0 END) as cancelled,
  SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as no_shows,
  SUM(CASE WHEN status = 'rescheduled' THEN 1 ELSE 0 END) as rescheduled,
  ROUND(100.0 * SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*), 1) as completion_rate,
  ROUND(100.0 * SUM(CASE WHEN status = 'canceled' THEN 1 ELSE 0 END) / COUNT(*), 1) as cancellation_rate,
  ROUND(AVG(duration_minutes), 0) as avg_duration,
  ROUND(AVG(EXTRACT(EPOCH FROM (appointment_date - created_at)) / 86400), 1) as avg_lead_time_days
FROM appointments
GROUP BY appointment_source
ORDER BY total_appointments DESC;

-- ============================================================
-- END OF ANALYTICS QUERIES
-- ============================================================
