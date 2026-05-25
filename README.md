# 凡人修仙傳（封測中）

> **共同選股研究室** — 讓朋友們一起研究股票、集體決策、追蹤績效的投資共識平台。

## 簡介

共同選股研究室解決了投資社群中常見的痛點：討論缺乏結構、決策品質無法追蹤、資金規模差異造成比較不公平。

平台透過「提案 → 討論 → 評分 → 投票 → 共識 → 追蹤 → 覆盤」完整流程，讓投資小組能以民主、透明的方式研究與決策，並統一以報酬率（%）衡量績效，確保公平性。

## 功能特色

- **群組管理** — 建立投資群組，透過邀請連結加入，支援 Owner / Admin / Member / Viewer 四種角色
- **提案系統** — 結構化的股票提案（投資論述、目標價、停損價、預期持有天數）
- **多維度評分** — 五大面向，每項 20 分，滿分 100
- **共識門檻** — 八項可配置的通過條件（同意比例、平均分數、多空論點數量等）
- **Bear Reviewer 機制** — 指定反方審查人挑戰論述，降低群體迷思風險
- **交易紀錄** — 記錄跟單買賣，自動計算已實現 / 未實現報酬率
- **績效儀表板** — 個人與群組的報酬率統計、勝率分析
- **排行榜** — 共識股報酬排名、成員報酬排名、提案人績效排名
- **覆盤系統** — 結構化事後回顧，記錄判斷對錯與經驗教訓

## 技術棧

| 層級 | 技術 |
|------|------|
| 框架 | Next.js 16（App Router） |
| 語言 | TypeScript 5 |
| 樣式 | Tailwind CSS 4 + shadcn/ui |
| 後端 / 驗證 / 資料庫 | Supabase（PostgreSQL + Row Level Security） |
| 表單 | React Hook Form + Zod |
| 圖表 | Recharts |
| 測試 | Vitest + Testing Library |
| 部署 | Vercel |

## 安裝

### 前置需求

- Node.js 18+
- npm 9+
- 一個 Supabase 專案（[supabase.com](https://supabase.com)）

### 步驟

```bash
# 複製專案
git clone https://github.com/kluiwork2/csa-codebase.git
cd csa-codebase

# 安裝依賴
npm install

# 建立環境變數
cp .env.example .env.local
```

編輯 `.env.local`，填入你的 Supabase 憑證：

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 資料庫設定

依序執行 `db/migrations/` 中的 migration 檔案，可選擇性載入測試資料：

```bash
# 透過 Supabase CLI 或 Dashboard SQL Editor 套用 migrations
# 載入測試資料（選用）
psql -f db/seed_mockdata.sql
```

## 使用方式

```bash
# 啟動開發伺服器
npm run dev

# 正式環境建置
npm run build

# 程式碼檢查
npm run lint

# 執行單元測試
npm test
```

開啟 [http://localhost:3000](http://localhost:3000) 即可使用。

## 專案結構

```
.
├── app/                        # Next.js App Router 頁面
│   ├── auth/                   # 驗證 callback
│   ├── consensus/[id]/         # 共識股詳情、交易、覆盤
│   ├── groups/[groupId]/       # 群組儀表板、提案、共識、排行、績效
│   ├── login/                  # 登入頁
│   ├── proposals/[id]/         # 提案詳情與編輯
│   └── signup/                 # 註冊頁
├── components/
│   ├── features/               # 業務元件（群組、提案、共識等）
│   └── ui/                     # 通用 UI 元件（shadcn/ui）
├── lib/
│   ├── consensus/              # 共識邏輯
│   ├── discussion/             # 討論留言
│   ├── group/                  # 群組 CRUD 與成員管理
│   ├── performance/            # 報酬率計算與指標
│   ├── proposal/               # 提案生命週期
│   ├── review/                 # 覆盤服務
│   ├── scoring/                # 多維度評分
│   ├── supabase/               # Supabase 客戶端（瀏覽器/伺服器/middleware）
│   ├── trade/                  # 交易紀錄
│   └── validation/             # Zod 驗證 schema
├── db/
│   └── migrations/             # SQL migration 檔案
├── tests/                      # 單元與整合測試
├── types/                      # 共用 TypeScript 型別
└── public/                     # 靜態資源
```

## 授權

本專案為私有軟體，保留所有權利。
