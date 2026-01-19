-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将5.12.0升级到6.1.0RC
-- THIS SCRIPT IS ONLY FOR UPGRADING 5.12.0 TO 6.1.0RC
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

-- 1. Add phone number field to pending new user table tbl_new_users (unique constraint to prevent duplicate registrations)
ALTER TABLE `myems_user_db`.`tbl_new_users`
ADD COLUMN `phone` VARCHAR(20) NULL UNIQUE COMMENT 'User Mobile Phone Number' AFTER `email`;

-- 2. Add phone number field to official user table tbl_users (unique constraint to prevent duplicates)
ALTER TABLE `myems_user_db`.`tbl_users`
ADD COLUMN `phone` VARCHAR(20) NULL UNIQUE COMMENT 'User Mobile Phone Number' AFTER `email`;

-- 3. Add phone number field to verification code table tbl_verification_codes (associate phone number with verification code to resolve 1054 error)
ALTER TABLE `myems_user_db`.`tbl_verification_codes`
ADD COLUMN `phone` VARCHAR(20) NULL COMMENT 'User Mobile Phone Number' AFTER `recipient_email`;

-- 4. Add phone number field to email message table tbl_email_messages (associate email with phone number to resolve 1054 error)
ALTER TABLE `myems_user_db`.`tbl_email_messages`
ADD COLUMN `phone` VARCHAR(20) NULL COMMENT 'User Mobile Phone Number' AFTER `recipient_email`;

-- 5. Create indexes for phone number fields to improve query efficiency (suitable for login, uniqueness verification, verification code query scenarios)
CREATE INDEX idx_tbl_new_users_phone ON `myems_user_db`.`tbl_new_users` (`phone`);
CREATE INDEX idx_tbl_users_phone ON `myems_user_db`.`tbl_users` (`phone`);
CREATE INDEX idx_tbl_verification_codes_phone ON `myems_user_db`.`tbl_verification_codes` (`phone`);
CREATE INDEX idx_tbl_email_messages_phone ON `myems_user_db`.`tbl_email_messages` (`phone`);

-- 6. Retain the project's original specifications: Update version number and release date
UPDATE `myems_system_db`.`tbl_versions`
SET version='6.1.0RC', release_date='2026-1-19'
WHERE id=1;

COMMIT;