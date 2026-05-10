# Design Guidelines (設計準則)

本文件定義了專案的設計規範，確保 UI/UX 的一致性。

## 1. 顏色系統 (Color Palette)

- **Primary**: `#3B82F6` (Blue 500) - 主要品牌色、行動按鈕。
- **Secondary**: `#10B981` (Emerald 500) - 成功、標籤。
- **Background**: `#FFFFFF` (Light) / `#111827` (Dark Mode)。
- **Text**: `#1F2937` (Gray 800) - 主要文字。

## 2. 字體規範 (Typography)

- **字體系列**: `Inter`, system-ui, sans-serif。
- **標題 (H1)**: `text-3xl font-bold tracking-tight` (Desktop) -> `text-2xl` (Mobile)。
- **內文**: `text-base leading-relaxed`。

## 3. 響應式設計 (RWD)

- **手機 (Mobile)**: `< 640px` (sm)。
- **平板 (Tablet)**: `640px` to `1024px` (md, lg)。
- **桌機 (Desktop)**: `> 1024px` (xl, 2xl)。
- **開發原則**: Mobile First (先從手機版開始設計)。

## 4. 元件規範 (Component Guidelines)

- **按鈕 (Buttons)**: 應具備 `hover` 與 `active` 狀態，且在手機版應有足夠的點擊區域 (min 44x44px)。
- **間距 (Spacing)**: 使用 Tailwind 的標準間距系統 (`p-4`, `m-2` 等)。
- **圓角 (Border Radius)**: 預設使用 `rounded-lg` (8px)。

## 5. 動效 (Animations)

- 使用 `transition-all duration-200 ease-in-out` 處理 Hover 效果。
- 載入狀態應有透明度過渡或 Spinner。
