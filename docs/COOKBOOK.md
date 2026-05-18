# 共同選股研究室 — Cookbook 開發手冊

> 這份手冊涵蓋：環境設定、資料庫建立、本地開發、功能使用流程、部署上線。

---

## 目錄

1. [環境準備](#1-環境準備)
2. [Supabase 設定](#2-supabase-設定)
3. [本地啟動](#3-本地啟動)
4. [完整使用流程](#4-完整使用流程)
5. [頁面與路由總覽](#5-頁面與路由總覽)
6. [資料庫結構](#6-資料庫結構)
7. [核心商業邏輯](#7-核心商業邏輯)
8. [部署到 Vercel](#8-部署到-vercel)
9. [常見問題排除](#9-常見問題排除)
10. [後續開發建議](#10-後續開發建議)

---

## 1. 環境準備

### 必備工具

| 工具 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 執行環境 |
| npm | 9+ | 套件管理 |
| Git | 任意 | 版本控制 |
| 瀏覽器 | Chrome / Safari | 測試 |

### 安裝依賴

```bash
cd "Fans be god"
npm install
```

---

## 2. Supabase 設定

### 2.1 建立專案

1. 前往 [supabase.com](https://supabase.com) 建立帳號
2. 點選 **New Project**
3. 選擇 Region（建議選離你最近的，例如 Singapore）
4. 記下你的 Project URL 和 anon key

### 2.2 設定環境變數

編輯專案根目錄的 `.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://你的專案.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_anon_key
SUPABASE_SERVICE_ROLE_KEY=你的_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **在哪裡找這些值？**  
> Supabase Dashboard → Settings → API → 複製 Project URL 和 anon/public key

### 2.3 執行資料庫 Migration

1. 打開 Supabase Dashboard → **SQL Editor**
2. 貼上 `db/migrations/001_initial_schema.sql` 的完整內容
3. 點選 **Run**

這會建立所有 13 張資料表、RLS 政策、觸發器。

### 2.4 設定 Auth

Supabase Dashboard → Authentication → Settings：

- 確認 **Enable Email Signup** 已開啟
- 如果是開發階段，可以關閉 Email Confirmation（Settings → Auth → 取消勾選 Confirm email）

---

## 3. 本地啟動

```bash
npm run dev
```

打開瀏覽器進入 `http://localhost:3000`。

### 常用指令

| 指令 | 用途 |
|------|------|
| `npm run dev` | 啟動開發伺服器 |
| `npm run build` | 建置生產版本（含型別檢查） |
| `npm run lint` | ESLint 檢查 |
| `npm test` | 執行單元測試 |

---

## 4. 完整使用流程

以下是從零到完成一次完整投資決策循環的步驟：

### Step 1：註冊與登入

1. 進入 `/signup`，輸入 Email、暱稱、密碼
2. 註冊成功後自動跳轉到 `/groups`

### Step 2：建立投資小組

1. 點選「建立小組」
2. 輸入小組名稱（例如：科技股研究小組）和描述
3. 你會自動成為 Owner

### Step 3：邀請成員

1. 在小組 Dashboard 點選「邀請」
2. 輸入朋友的 Email（對方需已註冊）
3. 成功後對方即加入小組

### Step 4：新增股票提案

1. 進入小組 → 提案池 → 點選「新增提案」
2. 填寫：
   - 股票代號（例如：2330）
   - 股票名稱（例如：台積電）
   - 買進邏輯（至少 20 字，說明為什麼看好）
   - 目標價
   - 停損價 或 退出條件（至少填一個）
3. 提交後，提案進入「已提交」狀態

### Step 5：補充看多理由

在提案詳情頁下方：
1. 輸入看多理由的內容
2. 選擇分類（基本面 / 產業趨勢 / 估值 / 技術面 / 籌碼面 / 消息面）
3. 點選「新增」

> **規則：** 至少需要 3 個看多理由才能通過共識門檻

### Step 6：補充風險提醒

1. 輸入風險內容
2. 選擇嚴重度（低 / 中 / 高 / 嚴重）
3. 點選「新增」

> **規則：** 至少需要 2 個風險提醒  
> 如果不足，頁面會顯示黃色警告

### Step 7：指定反方審查者

在提案詳情頁的右側欄：
1. 從下拉選單選擇一位成員擔任反方
2. 反方審查者需要從批判角度補充風險

> **限制：** 提案人不能擔任自己提案的反方

### Step 8：評分

每位成員可以對提案進行 5 維度評分：

| 維度 | 範圍 |
|------|------|
| 基本面 | 1-20 |
| 產業趨勢 | 1-20 |
| 估值合理性 | 1-20 |
| 風險控制 | 1-20 |
| 計畫完整度 | 1-20 |

滿分 100 分。可以重新提交覆蓋。

> **規則：** 平均分數需 ≥ 75 才能通過

### Step 9：投票

每位成員選擇一個投票選項：
- 👍 同意
- 👎 反對
- ❓ 需要更多資訊
- 👀 先觀察

可附上投票原因。

> **規則：** 同意比例需 ≥ 70%

### Step 10：共識門檻檢查

提案詳情頁右側的「共識門檻」面板會即時顯示：
- 目前是否通過（綠色 / 紅色標籤）
- 各項指標數值
- 缺少的項目（紅色列出）
- 提醒（黃色列出）

**8 項完整門檻：**
1. 同意比例 ≥ 70%
2. 平均評分 ≥ 75
3. 看多理由 ≥ 3
4. 風險提醒 ≥ 2
5. 已指定反方審查者
6. 已填買進邏輯
7. 已填目標價
8. 已填停損價或退出條件

### Step 11：核准進入共識名單

當所有門檻通過：
- Owner 或 Admin 可以看到「核准進入共識名單」按鈕
- 點選後：
  - 提案狀態更新為「已通過」
  - 系統自動建立一筆共識標的（consensus_stock）

### Step 12：成員跟進

1. 進入共識名單 → 點選標的
2. 在右側欄點選「我要跟進」
3. 系統建立你的交易紀錄

### Step 13：記錄買進

1. 點選「填寫買進資訊」
2. 填入：買進日期、買進價格、數量、投入金額
3. 儲存

### Step 14：記錄賣出

1. 當你賣出時，填入：賣出日期、賣出價格
2. 系統自動計算報酬率：`(賣出價 - 買進價) / 買進價 × 100%`
3. 交易狀態變為「已賣出」

### Step 15：查看績效

進入小組 Dashboard → 「績效」：
- 小組平均報酬率
- 小組中位數報酬率
- 小組勝率
- 共識標的數量統計

進入「排行榜」：
- 成員平均報酬率排行（需 ≥ 3 筆交易才列入）
- 共識標的報酬率排行（需 ≥ 2 人跟進才列入）

### Step 16：復盤

1. 在共識標的詳情頁點選「復盤」
2. 回答：
   - 買進邏輯是否成立？
   - 目標價是否達成？
   - 停損是否觸發？
   - 哪些風險真的發生了？
   - 判斷正確 / 錯誤的地方
   - 學到的教訓
   - 下次改善方向
3. 所有成員的復盤會保留在該標的下方

---

## 5. 頁面與路由總覽

| 路由 | 功能 |
|------|------|
| `/` | 首頁（已登入跳轉 /groups） |
| `/login` | 登入 |
| `/signup` | 註冊 |
| `/groups` | 我的小組列表 |
| `/groups/new` | 建立新小組 |
| `/groups/[id]` | 小組 Dashboard |
| `/groups/[id]/invite` | 邀請成員 |
| `/groups/[id]/proposals` | 提案池（含狀態篩選） |
| `/groups/[id]/proposals/new` | 新增提案 |
| `/proposals/[id]` | 提案詳情（討論 / 評分 / 投票） |
| `/groups/[id]/consensus` | 共識名單 |
| `/consensus/[id]` | 共識標的詳情 |
| `/consensus/[id]/trade` | 我的交易紀錄 |
| `/groups/[id]/performance` | 小組績效 |
| `/groups/[id]/rankings` | 排行榜 |
| `/consensus/[id]/review` | 復盤 |

---

## 6. 資料庫結構

共 13 張資料表：

```
users              → 使用者
groups             → 投資小組
group_members      → 小組成員（含角色）
stock_proposals    → 股票提案
proposal_bull_points → 看多理由
proposal_risk_points → 風險提醒
proposal_comments  → 討論留言
proposal_scores    → 評分（5維度）
proposal_votes     → 投票
consensus_stocks   → 共識標的
trade_records      → 交易紀錄
trade_lots         → 分批買賣（預留）
reviews            → 復盤
```

### 角色權限

| 角色 | 說明 |
|------|------|
| `owner` | 建立者，擁有所有權限 |
| `admin` | 管理員，可邀請成員、核准共識 |
| `member` | 一般成員，可提案、評分、投票、交易 |
| `viewer` | 觀察者，只能看 |

### RLS（Row Level Security）

所有資料表都啟用 RLS：
- 使用者只能看到自己所屬小組的資料
- 只能編輯自己的交易紀錄
- 只能刪除自己的看多理由 / 風險提醒

---

## 7. 核心商業邏輯

### 報酬率計算

```
個人報酬率 = (賣出價 - 買進價) / 買進價 × 100%
小組標的平均報酬率 = 所有跟進成員報酬率加總 / 跟進人數
小組總平均報酬率 = 所有共識標的平均報酬率加總 / 共識標的數
勝率 = 獲利交易數 / 已結案交易總數 × 100%
```

### 排名規則

- **所有排名以百分比報酬率為主，不看投入金額**
- 成員排行需參與 ≥ 3 檔才列入（避免一筆幸運交易就排第一）
- 標的排行需 ≥ 2 人跟進才列入
- 個人投入金額預設只有自己看得到

### 提案狀態流程

```
draft → submitted → discussion → bear_review → voting → approved → closed
                  ↘ risk_insufficient ↗        ↘ rejected
                                                ↘ watchlist → closed
```

---

## 8. 部署到 Vercel

### 8.1 推送程式碼到 GitHub

```bash
git init
git add .
git commit -m "Initial MVP commit"
git remote add origin https://github.com/你的帳號/你的repo.git
git push -u origin main
```

### 8.2 連結 Vercel

1. 前往 [vercel.com](https://vercel.com)
2. Import 你的 GitHub repository
3. 設定 Environment Variables（和 `.env.local` 相同）：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`（改成你的 Vercel 網址）
4. Deploy

### 8.3 設定 Supabase Auth Redirect

Supabase Dashboard → Authentication → URL Configuration：
- Site URL: `https://你的app.vercel.app`
- Redirect URLs: 加入 `https://你的app.vercel.app/auth/callback`

---

## 9. 常見問題排除

### Q: 登入後頁面沒反應

確認 `.env.local` 的 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 設定正確。

### Q: 註冊後沒有跳轉

如果啟用了 Email Confirmation，使用者需要先點確認信。開發階段建議在 Supabase Dashboard 關閉。

### Q: RLS 錯誤 / 找不到資料

確認已執行完整的 `001_initial_schema.sql`，特別是 RLS 政策和 `handle_new_user()` 觸發器。

### Q: 建立小組時出錯

確認 `handle_new_user` 觸發器有正確在 `auth.users` 新增時同步建立 `public.users` 資料。

### Q: 共識門檻面板顯示全紅

正常！需要成員完成以下步驟後才會通過：
1. 加入 ≥ 3 個看多理由
2. 加入 ≥ 2 個風險提醒
3. 指定反方
4. 有人評分（平均 ≥ 75）
5. 有人投票（同意 ≥ 70%）

### Q: 報酬率顯示 N/A

需要有成員完成「買進 + 賣出」流程後，系統才會計算報酬率。

---

## 10. 後續開發建議

### V2 功能（優先順序）

1. **即時股價 API** — 串接外部 API 自動更新未實現報酬率
2. **通知功能** — 有人投票、評分、留言時推播提醒
3. **年化報酬率** — 已內建函式，需接入 UI
4. **盈虧比 / 最大回撤** — 已內建函式，需接入排行榜
5. **風險準確度排行** — 追蹤哪些風險真的發生了

### V3 功能

1. **AI 風險提醒** — 自動分析提案是否過度樂觀
2. **AI 復盤摘要** — 自動產生復盤結論
3. **券商交易紀錄匯入** — 自動同步買賣紀錄
4. **iOS / Android App** — 使用 Capacitor 或 React Native 包裝

### 程式碼維護

- 新增功能前先更新 `MEMORY.md`
- 所有新資料表需同步更新 `types/` 和 RLS 政策
- 計算邏輯集中在 `lib/performance/`，方便測試
- 跑 `npm test` 確認計算邏輯沒壞

---

## 專案結構快速參考

```
Fans be god/
├── app/                    ← 頁面（Next.js App Router）
├── components/
│   ├── ui/                 ← shadcn/ui 元件
│   └── features/           ← 業務元件（group, proposal, consensus, review）
├── lib/
│   ├── supabase/           ← Supabase 連線
│   ├── group/              ← 小組服務
│   ├── proposal/           ← 提案服務
│   ├── discussion/         ← 討論服務（bull/risk/comment/bear）
│   ├── scoring/            ← 評分 & 投票服務
│   ├── consensus/          ← 共識檢查 & 核准
│   ├── trade/              ← 交易紀錄服務
│   ├── review/             ← 復盤服務
│   ├── performance/        ← 報酬率計算（純函式）
│   └── validation/         ← Zod 驗證 schema
├── types/                  ← TypeScript 型別定義
├── db/migrations/          ← 資料庫 SQL
├── tests/unit/             ← 單元測試
├── docs/                   ← 技術文件
└── agent_docs/             ← AI Agent 文件
```

---

> **最重要的原則：** 這個 APP 的核心不是誰賺最多錢，而是讓一群朋友建立一套共同投資決策流程——提出、討論、風險檢查、投票、紀錄、復盤。
