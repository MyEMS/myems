/*
 Source Schema         : myems_system_db
 Date: 22/04/2022 20:12:20
*/

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_svgs`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_svgs` ;
CREATE TABLE `myems_system_db`.`tbl_svgs`  (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128)  NOT NULL,
  `content` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`)
);

-- ---------------------------------------------------------------------------------------------------------------------
-- Records of `myems_system_db`.`tbl_svgs`
-- ---------------------------------------------------------------------------------------------------------------------
INSERT INTO `myems_system_db`.`tbl_svgs` VALUES (1, 'SVG01', '<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<!-- Generator: Adobe Illustrator 24.1.2, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->\r\n<svg version=\"1.1\" id=\"图层_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\r\nviewBox=\"0 0 1920 1080\" enable-background=\"new 0 0 1920 1080\" xml:space=\"preserve\">\r\n<text id=\"PT100\" transform=\"matrix(0.7283 0 0 1 584 374.6328)\" font-family=\"\'AdobeSongStd-Light-GBpc-EUC-H\'\" font-size=\"32.9428px\">888888</text>\r\n<rect x=\"360\" y=\"299\" fill=\"#ED1C24\" width=\"184\" height=\"127\"/>\r\n<text id=\"PT101\" transform=\"matrix(0.7283 0 0 1 882 300.6328)\" font-family=\"\'AdobeSongStd-Light-GBpc-EUC-H\'\" font-size=\"32.9428px\">888888</text>\r\n\r\n</svg>');
INSERT INTO `myems_system_db`.`tbl_svgs` VALUES (2, 'SVG02', '<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<!-- Generator: Adobe Illustrator 24.1.2, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->\r\n<svg version=\"1.1\" id=\"图层_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\r\nviewBox=\"0 0 1920 1080\" enable-background=\"new 0 0 1920 1080\" xml:space=\"preserve\">\r\n<text id=\"PT100\" transform=\"matrix(0.7283 0 0 1 584 374.6328)\" font-family=\"\'AdobeSongStd-Light-GBpc-EUC-H\'\" font-size=\"32.9428px\">888888</text>\r\n<rect x=\"360\" y=\"299\" fill=\"#A12312\" width=\"184\" height=\"127\"/>\r\n<text id=\"PT101\" transform=\"matrix(0.7283 0 0 1 882 300.6328)\" font-family=\"\'AdobeSongStd-Light-GBpc-EUC-H\'\" font-size=\"32.9428px\">888888</text>\r\n\r\n</svg>');

