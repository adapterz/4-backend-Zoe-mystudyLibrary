"use strict";

// 외부모듈
import fs from "fs";
import path from "path";
import Sequelize from "sequelize";
import { fileURLToPath } from "url";
import { dirname } from "path";

// 내부모듈
import { development } from "../../ormConfig.js";
// es6 환경에서 require 사용할 수 있게하기
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// es6 버전에서 __filename, __dirname 사용할 수 있게하기
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const basename = path.basename(__filename);

export const db = {};

// 시퀄라이즈 객체
export const sequelize = new Sequelize(development.database, development.username, development.password, {
  host: development.host,
  dialect: development.dialect,
  port: development.port,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000, // 오류 발생 전 연결 시도하는 최대 시간 (밀리초)
    idle: 10000, // 10초간 사용되지 않은 풀 연결 제거 (밀리초)
  },
  logging: false,
});

// TIMESTAMP datatype 사용할 수 있게하기
const TIMESTAMP = require("sequelize-mysql-timestamp")(sequelize);
Sequelize.DataTypes.TIMESTAMP = TIMESTAMP;

// 모델(테이블) 읽기
fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf(".") !== 0 && file !== basename && file.slice(-4) === ".cjs";
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
export const Op = Sequelize.Op;
