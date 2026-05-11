# Project TODO

## Phase 1: Setup & Infrastructure

- [x] 初始化 Next.js 專案
- [x] 建立 `design.md` 設計準則
- [x] 設定 Prettier 與 ESLint
- [x] 設定 Husky 與 lint-staged (Git Hooks)
- [x] 設定環境變數 (.env.local)
- [x] 安裝專案依賴 (npm install)
- [x] 初始化 Supabase Client

## Phase 2: Core Components & Layout (RWD)

- [x] 建立響應式 Navbar (Mobile Hamburger Menu)
- [x] 建立響應式 Footer
- [x] 設定全域字體與配色方案 (Tailwind config)

## Phase 3: Database & Backend Setup

- [x] 在 Supabase 建立 `news`, `vocabulary`, `sentences` 資料表 (提供 SQL 腳本)
- [x] 實作 RSS 新聞抓取腳本 (Focus Taiwan, Taipei Times) (已建立 API Route)
- [x] 整合 AI 翻譯與造句 API (Gemini/OpenAI) (已串接 Gemini API)

## Phase 4: Frontend Features

- [x] 新聞列表頁面 (英中對照卡片式佈局)
- [x] 新聞內文詳情頁面
- [x] 單字庫管理頁面 (單字卡、造句顯示)
- [x] 「加入單字庫」功能按鈕

## Phase 5: Verification & Deployment

- [x] GitHub Repository 連結
- [x] 流程檢查與驗證 (Build, Lint, Git Hooks)
- [x] 自動 Commit & Push 流程驗證

## Phase 6: Optimization & Polish (2026-05-11)

- [x] **單字庫強化**：整合 AI 自動獲取單字音標 (IPA) 與中文定義
- [x] **單字庫 UI**：美化單字卡顯示，呈現音標與定義
- [x] **效能優化**：實作 Server-side memory filtering 解決 PostgREST 查詢問題
- [x] **程式碼品質**：修復所有 ESLint 警告，將 `img` 轉換為 `next/image`
- [x] **導覽列優化**：清理冗餘連結，確保 RWD 體驗一致性
- [x] **自動化流程**：驗證 GitHub -> Vercel 自動部署流程
