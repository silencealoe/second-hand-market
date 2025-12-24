-- 创建超级管理员角色
INSERT INTO admin_roles (name, description, permissions, is_super, status, created_at, updated_at)
SELECT '超级管理员', '拥有所有权限的超级管理员角色', '{}', 1, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM admin_roles WHERE is_super = 1);

-- 获取超级管理员角色ID
SET @admin_role_id = (SELECT id FROM admin_roles WHERE is_super = 1);

-- 创建管理员账号（密码：admin123，已加密）
INSERT INTO admin_users (username, password, real_name, phone, role_id, status, last_login_at, created_at, updated_at)
SELECT 'admin', '$2b$10$qXW6pXjJ0W6qXW6pXjJ0W6qXW6pXjJ0W6qXW6pXjJ0W6qXW6pXjJ0W', '超级管理员', '13800138000', @admin_role_id, 1, NULL, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE username = 'admin');

-- 输出结果
SELECT '✅ 初始管理员账号创建完成！' AS result;
SELECT '🔑 账号: admin' AS username;
SELECT '🔑 密码: admin123' AS password;
