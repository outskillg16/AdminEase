/*
  # AI Configuration System

  ## Overview
  Creates comprehensive tables for AI assistant configuration including:
  - Basic AI settings (model parameters)
  - Conversation preferences
  - Vector embeddings for knowledge base
  - Document search functionality

  ## New Tables

  ### `ai_configurations`
  Stores all AI assistant settings for each business profile:
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `business_profile_id` (uuid, references business_profiles)
  - Basic settings: assistant_name, system_prompt, temperature, max_tokens
  - Conversation settings: greeting_message, context_window, response_style, etc.
  - Advanced settings: top_p, frequency_penalty, presence_penalty, etc.
  - Timestamps: created_at, updated_at

  ### `document_embeddings`
  Stores vector embeddings for semantic search:
  - `id` (uuid, primary key)
  - `document_id` (uuid, references business_documents)
  - `ai_config_id` (uuid, references ai_configurations)
  - `user_id` (uuid, references auth.users)
  - `chunk_index` (integer) - position in document
  - `chunk_text` (text) - text content of chunk
  - `embedding` (vector(1536)) - OpenAI ada-002 embedding
  - `metadata` (jsonb) - additional chunk metadata
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own configurations and embeddings
  - Cascading deletes for related records

  ## Indexes
  - Vector index (IVFFlat) for fast similarity search
  - Standard indexes on foreign keys for joins
  - Unique constraint on document chunk combinations

  ## Functions
  - `match_documents` - Vector similarity search function
  - Returns ranked document chunks by relevance
*/

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- AI Configurations Table
CREATE TABLE IF NOT EXISTS ai_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_profile_id uuid NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,

  -- Basic Settings
  assistant_name text NOT NULL DEFAULT 'AI Assistant',
  system_prompt text NOT NULL DEFAULT 'You are a helpful AI assistant.',
  temperature numeric(3,2) NOT NULL DEFAULT 0.7,
  max_tokens integer NOT NULL DEFAULT 500,

  -- Conversation Settings
  greeting_message text DEFAULT 'Hello! How can I help you today?',
  context_window integer NOT NULL DEFAULT 10,
  response_style text NOT NULL DEFAULT 'professional',
  enable_follow_up_questions boolean NOT NULL DEFAULT true,
  include_timestamps boolean NOT NULL DEFAULT false,

  -- Advanced Settings
  top_p numeric(3,2) NOT NULL DEFAULT 1.0,
  frequency_penalty numeric(3,2) NOT NULL DEFAULT 0.0,
  presence_penalty numeric(3,2) NOT NULL DEFAULT 0.0,
  enable_function_calling boolean NOT NULL DEFAULT false,
  conversation_memory boolean NOT NULL DEFAULT false,

  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_temperature CHECK (temperature >= 0 AND temperature <= 2),
  CONSTRAINT valid_max_tokens CHECK (max_tokens >= 100 AND max_tokens <= 4000),
  CONSTRAINT valid_context_window CHECK (context_window >= 5 AND context_window <= 20),
  CONSTRAINT valid_top_p CHECK (top_p >= 0 AND top_p <= 1),
  CONSTRAINT valid_frequency_penalty CHECK (frequency_penalty >= -2 AND frequency_penalty <= 2),
  CONSTRAINT valid_presence_penalty CHECK (presence_penalty >= -2 AND presence_penalty <= 2),
  CONSTRAINT valid_response_style CHECK (response_style IN ('professional', 'casual', 'concise', 'detailed')),
  
  -- One config per business profile
  UNIQUE(business_profile_id)
);

-- Document Embeddings Table
CREATE TABLE IF NOT EXISTS document_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES business_documents(id) ON DELETE CASCADE,
  ai_config_id uuid NOT NULL REFERENCES ai_configurations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  chunk_index integer NOT NULL,
  chunk_text text NOT NULL,
  embedding vector(1536),

  metadata jsonb DEFAULT '{}'::jsonb,

  created_at timestamptz DEFAULT now(),

  -- Constraints
  UNIQUE(document_id, chunk_index, ai_config_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_configurations_user 
  ON ai_configurations(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_configurations_business_profile 
  ON ai_configurations(business_profile_id);

CREATE INDEX IF NOT EXISTS idx_document_embeddings_ai_config 
  ON document_embeddings(ai_config_id);

CREATE INDEX IF NOT EXISTS idx_document_embeddings_user 
  ON document_embeddings(user_id);

CREATE INDEX IF NOT EXISTS idx_document_embeddings_document 
  ON document_embeddings(document_id);

-- Vector index for fast similarity search (will be created when embeddings exist)
-- CREATE INDEX idx_document_embeddings_vector
--   ON document_embeddings
--   USING ivfflat (embedding vector_cosine_ops)
--   WITH (lists = 100);

-- RLS Policies for ai_configurations
ALTER TABLE ai_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI config"
  ON ai_configurations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI config"
  ON ai_configurations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI config"
  ON ai_configurations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI config"
  ON ai_configurations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for document_embeddings
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own embeddings"
  ON document_embeddings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own embeddings"
  ON document_embeddings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own embeddings"
  ON document_embeddings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function for vector similarity search
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_user_id uuid
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  file_name text,
  chunk_text text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    de.id,
    de.document_id,
    bd.file_name,
    de.chunk_text,
    1 - (de.embedding <=> query_embedding) AS similarity
  FROM document_embeddings de
  JOIN business_documents bd ON de.document_id = bd.id
  WHERE de.user_id = filter_user_id
    AND de.embedding IS NOT NULL
    AND 1 - (de.embedding <=> query_embedding) > match_threshold
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_configurations_updated_at
  BEFORE UPDATE ON ai_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();