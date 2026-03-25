ALTER TABLE `monitors` ADD `display_name` text;

-- 既存のデータを displayName で初期化（name をコピー）
UPDATE `monitors` SET `display_name` = `name` WHERE `display_name` IS NULL;