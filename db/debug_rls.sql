-- 驗證 RLS 設定是否正確
-- 在 Supabase SQL Editor 執行

-- 1. 確認 helper functions 存在
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('is_member_of_group', 'get_user_group_ids', 'get_user_role_in_group');

-- 2. 確認 handle_new_user trigger 存在
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 3. 確認 public.users 有你的帳號（從 auth.users 同步過來的）
SELECT id, email, display_name FROM public.users LIMIT 10;

-- 4. 列出 groups 表的所有 RLS policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'groups';

-- 5. 列出 group_members 表的所有 RLS policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'group_members';

-- 6. 測試：用你的 auth.uid() 直接插入 groups（模擬）
-- 先確認你的 user id
SELECT id FROM auth.users LIMIT 5;
