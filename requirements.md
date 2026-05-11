# English Coach - 系統需求文件 (PRD)

## 專案目標 (Project Objective)

建立一個具備響應式設計 (RWD) 的英漢雙語新聞學習應用程式 (English-Chinese news learning application)，幫助使用者透過最新的國際與財金新聞，同步提升英語閱讀與財經知識。

## 核心功能需求 (Core Features)

### 1. 新聞聚合與雙語閱讀 (Automated News Aggregator)

- **自動抓取新聞**：系統每天自動從台灣新聞來源抓取 10 篇「國際 (International)」與「財金 (Financial)」類別的英文新聞。
- **雙語對照**：提供英文原文與中文翻譯，讓使用者方便對照學習。

### 2. 個人化單字庫 (User-Specific Vocabulary Bank)

- **儲存生字**：使用者在閱讀新聞時，可以將不熟悉的英文單字儲存到個人專屬的單字庫。
- **單字資訊**：儲存時系統會提供該單字的中文定義及音標。

### 3. AI 驅動的例句生成 (AI-Driven Sentence Generation)

- **輔助記憶**：針對使用者儲存在單字庫中的每一個單字，系統會透過 AI 自動生成 2 句相關的英文例句及其中文翻譯，幫助使用者透過語境來記憶單字。

### 4. 封存機制 (Archive System)

- **閱讀狀態管理**：使用者看完某篇新聞後，可以手動按下「封存 (Archive)」按鈕，標記為已讀。
- **過濾首頁**：已封存的新聞不再顯示於首頁的新聞列表中。
- **自動清理**：封存紀錄超過 30 天後將自動刪除。

## 技術架構與開發規範 (Technical & CI/CD Requirements)

### 1. 前端架構

- **框架**：使用 Next.js (App Router)。
- **樣式**：搭配 Tailwind CSS 進行 RWD 響應式網頁設計。

### 2. 後端與資料庫

- **BaaS (Backend as a Service)**：使用 Supabase 處理使用者認證 (Auth)、資料庫 (PostgreSQL)、Row Level Security (RLS) 以及資料儲存。
- **資料表結構**：主要涵蓋 `news` (新聞)、`vocabulary` (單字)、`sentences` (例句) 以及 `user_archived_news` (封存紀錄)。

### 3. CI/CD 與部署

- **代碼品質**：強制執行嚴格的程式碼標準，包含 ESLint, Prettier, 與 Husky (Git Hooks)，確保每次 Commit 都有品質保證。
- **自動化部署**：透過 GitHub 與 Vercel 建立穩健的 CI/CD 流程，實現自動化部署。

## 專案現況 (Project Status) - 2026-05-11 更新

- [x] **新聞聚合**：已實作 RSS 抓取與每日同步邏輯。
- [x] **雙語閱讀**：已實作點擊文章後 AI 自動生成雙語對照。
- [x] **個人化單字庫**：已實作單字儲存、**音標獲取**與**中文定義**獲取功能。
- [x] **AI 造句**：已實作每個單字自動生成 2 句雙語例句。
- [x] **封存機制**：已實作首頁封存功能、封存過濾與 30 天舊聞清理。
- [x] **優化與修正**：已完成首頁效能優化 (Memory Filtering) 與 Lint 錯誤修復。
