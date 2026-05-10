# Project TODO

## Phase 1: Setup & Infrastructure

- [x] 初始化 Next.js 專案
- [x] 建立 `design.md` 設計準則
- [x] 設定 Prettier 與 ESLint
- [x] 設定 Husky 與 lint-staged (Git Hooks)
- [x] 初始化 Supabase Client

## Phase 2: Core Components & Layout (RWD)

- [x] 建立響應式 Navbar (Mobile Hamburger Menu)
- [x] 建立響應式 Footer
- [ ] 設定全域字體與配色方案 (Tailwind config)

## Phase 3: Database & Backend Setup

- [x] 在 Supabase 建立 `news`, `vocabulary`, `sentences` 資料表 (提供 SQL 腳本)
- [x] 實作 RSS 新聞抓取腳本 (Focus Taiwan, Taipei Times) (已建立 API Route)
- [x] 整合 AI 翻譯與造句 API (Gemini/OpenAI) (已串接 Gemini API)

## Phase 4: Frontend Features

- [ ] 新聞列表頁面 (英中對照卡片式佈局)
- [ ] 新聞內文詳情頁面
- [ ] 單字庫管理頁面 (單字卡、造句顯示)
- [ ] 「加入單字庫」功能按鈕

## Phase 5: Verification & Deployment

- [x] GitHub Repository 連結
- [x] 流程檢查與驗證 (Build, Lint, Git Hooks)
- [ ] 自動 Commit & Push 流程驗證
