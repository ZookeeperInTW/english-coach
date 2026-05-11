-- 1. 新聞資料表 (News)
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title_en TEXT NOT NULL,
  title_zh TEXT NOT NULL,
  content_en TEXT,
  content_zh TEXT,
  category TEXT NOT NULL, -- 'international' or 'finance'
  source_url TEXT,
  image_url TEXT
);

-- 2. 單字庫資料表 (Vocabulary)
CREATE TABLE vocabulary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  word TEXT NOT NULL,
  definition_zh TEXT,
  phonetic TEXT
);

-- 3. 例句資料表 (Sentences)
CREATE TABLE sentences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
  sentence_en TEXT NOT NULL,
  sentence_zh TEXT NOT NULL
);

-- 啟用 Row Level Security (RLS)
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentences ENABLE ROW LEVEL SECURITY;

-- 設定權限 (Policies)
-- 新聞所有人皆可讀取
CREATE POLICY "News are viewable by everyone" ON news FOR SELECT USING (true);

-- 單字與例句僅限本人存取
CREATE POLICY "Users can only view their own vocabulary" ON vocabulary FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only view sentences for their own vocabulary" ON sentences FOR ALL USING (
  EXISTS (
    SELECT 1 FROM vocabulary 
    WHERE vocabulary.id = sentences.vocabulary_id 
    AND vocabulary.user_id = auth.uid()
  )
);

-- 4. 封存新聞資料表 (User Archived News)
CREATE TABLE user_archived_news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  news_id UUID REFERENCES news(id) ON DELETE CASCADE,
  UNIQUE(user_id, news_id)
);

ALTER TABLE user_archived_news ENABLE ROW LEVEL SECURITY;

-- 使用者只能讀取與新增自己的封存紀錄
CREATE POLICY "Users can manage their own archived news" ON user_archived_news 
FOR ALL USING (auth.uid() = user_id);
