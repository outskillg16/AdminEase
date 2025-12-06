# Appointment Source Tracking Implementation Guide

## Overview
This document provides implementation details for the appointment source tracking feature, which enables analytics on how appointments are created in the AdminEase application.

## Database Schema

### Column Details
- **Column Name**: `appointment_source`
- **Data Type**: `text`
- **Constraint**: `CHECK (appointment_source IN ('ui_manual', 'ai_chat', 'ai_voice', 'voice_agent_call'))`
- **Default Value**: `'ui_manual'`
- **Nullable**: `NOT NULL`
- **Indexed**: Yes (`idx_appointments_source`)

### Valid Values

| Value | Description | Use Case |
|-------|-------------|----------|
| `ui_manual` | Created via UI form/modal | User manually creates appointment through the web interface |
| `ai_chat` | Created via AI Assistant chat | User creates appointment through text-based AI chat |
| `ai_voice` | Created via AI Assistant voice | User creates appointment through voice commands to AI |
| `voice_agent_call` | Created via phone call | Appointment created when customer calls the business phone number |

## Implementation Status

### ✅ Completed
1. **Database Migration**
   - Column added to `appointments` table
   - Check constraint applied
   - Index created for performance
   - All existing appointments defaulted to `'ui_manual'`

2. **TypeScript Interface**
   - `Appointment` interface updated in `src/components/Appointments.tsx`
   - Includes proper type safety with union type

3. **UI Manual Creation**
   - Updated in `CreateAppointmentModal` component
   - File: `src/components/Appointments.tsx` (line 1144)
   - Sets `appointment_source: 'ui_manual'` on all UI-created appointments

### 🔄 Pending Implementation

#### 1. AI Chat Integration
**Location**: N8N Webhook Handler for AI Chat
**What to do**:
When the N8N workflow creates an appointment in response to an AI chat message, include:

```typescript
const appointmentData = {
  user_id: userId,
  customer_name: customerName,
  appointment_date: appointmentDate,
  // ... other fields ...
  appointment_source: 'ai_chat'  // ADD THIS
};

await supabase
  .from('appointments')
  .insert(appointmentData);
```

**Documentation**: See comments in `src/services/WebhookService.ts`

#### 2. AI Voice Integration
**Location**: N8N Webhook Handler for Voice Recognition
**What to do**:
When the N8N workflow creates an appointment from voice input, include:

```typescript
const appointmentData = {
  user_id: userId,
  customer_name: customerName,
  appointment_date: appointmentDate,
  // ... other fields ...
  appointment_source: 'ai_voice'  // ADD THIS
};

await supabase
  .from('appointments')
  .insert(appointmentData);
```

**Integration Point**: Voice recognition hook in AI Assistant
**File**: `src/components/AIAssistant.tsx`

#### 3. Voice Agent Phone Call Integration
**Location**: Voice Agent API/Webhook Handler
**What to do**:
When appointments are created via phone calls to the Voice Agent:

```typescript
const appointmentData = {
  user_id: userId,
  customer_name: customerName,
  appointment_date: appointmentDate,
  // ... other fields ...
  appointment_source: 'voice_agent_call'  // ADD THIS
};

await supabase
  .from('appointments')
  .insert(appointmentData);
```

**Integration Point**: Voice Agent system that sends calendar invitations

## Code References

### Key Files
- **Database Migration**: `supabase/migrations/add_appointment_source_tracking.sql`
- **TypeScript Interface**: `src/components/Appointments.tsx` (line 45-64)
- **UI Implementation**: `src/components/Appointments.tsx` (line 1113-1145)
- **Webhook Documentation**: `src/services/WebhookService.ts` (line 3-28)

## Analytics Queries

### 1. Appointment Source Distribution
Shows how many appointments were created through each method:

```sql
SELECT
  appointment_source,
  COUNT(*) as total_appointments,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM appointments
GROUP BY appointment_source
ORDER BY total_appointments DESC;
```

**Expected Output**:
```
appointment_source  | total_appointments | percentage
--------------------+-------------------+------------
ui_manual          | 1250              | 62.50
ai_chat            | 450               | 22.50
voice_agent_call   | 200               | 10.00
ai_voice           | 100               | 5.00
```

### 2. Cancellation Rate by Source
Identifies which creation method has the highest cancellation rate:

```sql
SELECT
  appointment_source,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'canceled' THEN 1 ELSE 0 END) as cancelled,
  ROUND(100.0 * SUM(CASE WHEN status = 'canceled' THEN 1 ELSE 0 END) / COUNT(*), 2) as cancellation_rate_pct
FROM appointments
GROUP BY appointment_source
ORDER BY cancellation_rate_pct DESC;
```

### 3. Completion Rate by Source
Shows which method leads to the highest appointment completion:

```sql
SELECT
  appointment_source,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
  ROUND(100.0 * SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*), 2) as completion_rate_pct
FROM appointments
GROUP BY appointment_source
ORDER BY completion_rate_pct DESC;
```

### 4. Source Trend Over Time
Tracks appointment sources over the last 30 days:

```sql
SELECT
  DATE(created_at) as date,
  appointment_source,
  COUNT(*) as appointments
FROM appointments
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), appointment_source
ORDER BY date DESC, appointment_source;
```

### 5. Peak Hours by Source
Identifies when appointments are created by each method:

```sql
SELECT
  appointment_source,
  EXTRACT(HOUR FROM created_at) as hour_of_day,
  COUNT(*) as appointments_created
FROM appointments
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY appointment_source, EXTRACT(HOUR FROM created_at)
ORDER BY appointment_source, hour_of_day;
```

### 6. User Preference Analysis
For multi-user systems, shows which users prefer which methods:

```sql
SELECT
  user_id,
  appointment_source,
  COUNT(*) as count,
  RANK() OVER (PARTITION BY user_id ORDER BY COUNT(*) DESC) as preference_rank
FROM appointments
GROUP BY user_id, appointment_source
ORDER BY user_id, preference_rank;
```

### 7. Monthly Comparison
Compares appointment sources month over month:

```sql
SELECT
  DATE_TRUNC('month', created_at) as month,
  appointment_source,
  COUNT(*) as appointments,
  LAG(COUNT(*)) OVER (PARTITION BY appointment_source ORDER BY DATE_TRUNC('month', created_at)) as prev_month,
  COUNT(*) - LAG(COUNT(*)) OVER (PARTITION BY appointment_source ORDER BY DATE_TRUNC('month', created_at)) as change
FROM appointments
WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', created_at), appointment_source
ORDER BY month DESC, appointment_source;
```

## Testing Checklist

### Manual Testing
- [ ] Create appointment via UI form → Verify `appointment_source = 'ui_manual'`
- [ ] Check existing appointments → All should have `'ui_manual'` as default
- [ ] Edit/reschedule appointment → Verify source field is preserved
- [ ] Cancel appointment → Verify source field is preserved
- [ ] Run analytics queries → Verify results are accurate

### AI Integration Testing (When Implemented)
- [ ] Create appointment via AI chat → Verify `appointment_source = 'ai_chat'`
- [ ] Create appointment via AI voice → Verify `appointment_source = 'ai_voice'`
- [ ] Create appointment via phone call → Verify `appointment_source = 'voice_agent_call'`

### Data Integrity Testing
- [ ] Verify NO NULL values in `appointment_source` column
- [ ] Verify only valid values exist (ui_manual, ai_chat, ai_voice, voice_agent_call)
- [ ] Verify index is used in analytics queries (check query plans)
- [ ] Verify RLS policies still work correctly

## Performance Considerations

### Index Usage
The index on `appointment_source` ensures fast analytics queries:
- Index name: `idx_appointments_source`
- Type: B-tree
- Columns: `appointment_source`

### Query Optimization
When filtering by source, the database will use the index:
```sql
-- This query will use the index
SELECT * FROM appointments
WHERE appointment_source = 'ai_chat'
AND appointment_date > CURRENT_DATE;
```

## Backward Compatibility

### Existing Data
- All existing appointments automatically have `'ui_manual'` as their source
- No data migration required
- No breaking changes to existing queries

### Existing Code
- Default value ensures compatibility with old code that doesn't set the field
- Optional field in TypeScript interface allows gradual adoption
- RLS policies automatically apply to new column

## Future Enhancements

### Potential Additional Sources
If new appointment creation methods are added:
1. Add new value to CHECK constraint
2. Update TypeScript interface union type
3. Update this documentation

Example:
```sql
ALTER TABLE appointments
DROP CONSTRAINT valid_appointment_source;

ALTER TABLE appointments
ADD CONSTRAINT valid_appointment_source
CHECK (appointment_source IN (
  'ui_manual',
  'ai_chat',
  'ai_voice',
  'voice_agent_call',
  'api_integration',  -- NEW
  'mobile_app'        -- NEW
));
```

### Enhanced Analytics
Consider adding:
- Dashboard widget showing source distribution
- Real-time alerts for source anomalies
- A/B testing different onboarding flows per source
- Conversion funnel analysis by source

## Support

### Questions or Issues
- Review migration file: `supabase/migrations/add_appointment_source_tracking.sql`
- Check TypeScript types: `src/components/Appointments.tsx`
- Review webhook documentation: `src/services/WebhookService.ts`

### Rollback (if needed)
To remove the feature:
```sql
ALTER TABLE appointments DROP COLUMN appointment_source;
DROP INDEX IF EXISTS idx_appointments_source;
```

**Note**: This will permanently delete source tracking data. Backup first!

---

**Document Version**: 1.0
**Last Updated**: December 6, 2025
**Feature Status**: ✅ Database Ready | 🔄 Pending AI Integration
