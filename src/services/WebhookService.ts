//const WEBHOOK_URL = 'https://n8n.srv1009698.hstgr.cloud/webhook/appointment-webhook';
//const WEBHOOK_URL = 'https://nimishai2025.app.n8n.cloud/webhook-test/6f7e3c42-4d9d-44ec-abcb-8def1407e0b2';
const WEBHOOK_URL = 'https://nimishai2025.app.n8n.cloud/webhook-test/a3d06230-5f0b-430d-8b08-3a2069cadb79';
/**
 * APPOINTMENT SOURCE TRACKING FOR ANALYTICS
 *
 * When implementing appointment creation through AI integrations,
 * ensure the 'appointment_source' field is set appropriately:
 *
 * - 'ai_chat': When appointment is created via AI Assistant chat
 * - 'ai_voice': When appointment is created via AI Assistant voice
 * - 'voice_agent_call': When appointment is created via phone call to Voice Agent
 *
 * Implementation Notes:
 * 1. When N8N webhook creates appointments in response to AI chat messages,
 *    set appointment_source = 'ai_chat'
 *
 * 2. When N8N webhook creates appointments from voice recognition,
 *    set appointment_source = 'ai_voice'
 *
 * 3. When Voice Agent (phone system) creates appointments,
 *    set appointment_source = 'voice_agent_call'
 *
 * Example webhook payload should include:
 * {
 *   ...appointmentData,
 *   appointment_source: 'ai_chat' // or 'ai_voice' or 'voice_agent_call'
 * }
 */

export interface IntentClassification {
  category: 'SCHEDULE_VIEW' | 'BOOKING_MANAGEMENT' | 'TIME_BLOCKING' | 'GENERAL_QUERY';
  action: string;
  confidence: number;
  entities: {
    customer?: string;
    service?: string;
    date?: string;
    time?: string;
    duration?: string;
    view?: 'daily' | 'weekly' | 'monthly';
    dateContext?: string;
    dateValue?: string;
    timeValue?: string;
    reason?: string;
  };
}

interface WebhookPayload {
  intent: string;
  action: string;
  entities: Record<string, any>;
  userInput: string;
  timestamp: string;
  sessionId: string;
}

export interface WebhookResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function sendToN8nWebhook(
  intent: IntentClassification,
  userInput: string
): Promise<WebhookResponse> {
  try {
    const payload: WebhookPayload = {
      intent: intent.category,
      action: intent.action,
      entities: intent.entities,
      userInput: userInput,
      timestamp: new Date().toISOString(),
      sessionId: generateSessionId()
    };

    console.log('🚀 Calling n8n webhook:', WEBHOOK_URL);
    console.log('📦 Payload:', payload);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    console.log('✅ Webhook response received:', data);

    return {
      success: true,
      message: data.message || 'Request processed successfully',
      data: data
    };
  } catch (error) {
    console.error('Webhook error:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        message: 'The request is taking longer than expected. Please try again.',
        error: 'Request timeout'
      };
    }

    return {
      success: false,
      message: 'Failed to process your request',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export function classifyIntent(userInput: string): IntentClassification {
  const input = userInput.toLowerCase().trim();

  const scheduleViewPatterns = [
    /what'?s?\s+(my|the)\s+schedule\s+(today|tomorrow|this\s+week)?/i,
    /show\s+(me\s+)?(my\s+)?(schedule|calendar|appointments)/i,
    /do\s+i\s+have\s+(any\s+)?(appointments|bookings)/i,
    /(daily|weekly|monthly)\s+(briefing|overview|schedule)/i,
    /how\s+many\s+appointments/i,
    /view\s+(my\s+)?(schedule|calendar)/i,
    /day\s+at\s+a\s+glance/i,
    /(today|tomorrow)'?s?\s+(overview|summary|agenda)/i
  ];

  const bookingPatterns = [
    /book\s+(.+?)\s+for\s+(.+?)\s+at\s+(.+)/i,
    /schedule\s+(.+?)\s+for\s+(.+)/i,
    /add\s+(an?\s+)?appointment/i,
    /move\s+(.+?)'?s\s+appointment/i,
    /cancel\s+(.+?)'?s\s+appointment/i,
    /reschedule/i,
    /create\s+(an?\s+)?appointment/i
  ];

  const timeBlockingPatterns = [
    /block\s+(out\s+)?(.+?)\s+for/i,
    /set\s+vacation\s+mode/i,
    /mark\s+(.+?)\s+as\s+(busy|unavailable)/i,
    /(lunch|break|buffer)\s+time/i,
    /block\s+(today|tomorrow|next\s+\w+)/i
  ];

  for (const pattern of scheduleViewPatterns) {
    if (pattern.test(input)) {
      return {
        category: 'SCHEDULE_VIEW',
        action: 'view_schedule',
        confidence: 0.9,
        entities: extractEntitiesFromInput(input)
      };
    }
  }

  for (const pattern of bookingPatterns) {
    if (pattern.test(input)) {
      return {
        category: 'BOOKING_MANAGEMENT',
        action: 'manage_booking',
        confidence: 0.85,
        entities: extractEntitiesFromInput(input)
      };
    }
  }

  for (const pattern of timeBlockingPatterns) {
    if (pattern.test(input)) {
      return {
        category: 'TIME_BLOCKING',
        action: 'block_time',
        confidence: 0.8,
        entities: extractEntitiesFromInput(input)
      };
    }
  }

  return {
    category: 'GENERAL_QUERY',
    action: 'respond',
    confidence: 0.5,
    entities: {}
  };
}

function extractEntitiesFromInput(input: string) {
  const entities: any = {};

  const datePatterns = {
    today: /today/i,
    tomorrow: /tomorrow/i,
    thisWeek: /this\s+week/i,
    nextWeek: /next\s+week/i,
    specific: /(\d{1,2}\/\d{1,2}\/?\d{0,4})|(\w+\s+\d{1,2})/i
  };

  const timePattern = /(\d{1,2}):?(\d{2})?\s*(am|pm)?/i;
  const namePattern = /(?:for|with|book)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/;
  const servicePattern = /(?:for|book|schedule)\s+(.+?)\s+(?:at|on|service|for)/i;

  for (const [key, pattern] of Object.entries(datePatterns)) {
    if (pattern.test(input)) {
      entities.dateContext = key;
      const match = input.match(pattern);
      if (match) entities.dateValue = match[0];
      break;
    }
  }

  const timeMatch = input.match(timePattern);
  if (timeMatch) {
    entities.time = timeMatch[0];
    entities.timeValue = timeMatch[0];
  }

  const nameMatch = input.match(namePattern);
  if (nameMatch) {
    entities.customer = nameMatch[1];
  }

  const serviceMatch = input.match(servicePattern);
  if (serviceMatch) {
    entities.service = serviceMatch[1].trim();
  }

  return entities;
}
