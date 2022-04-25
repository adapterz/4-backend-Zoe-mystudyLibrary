"use strict";

import fs from "fs";
import path from "path";
import Sequelize from "sequelize";
const basename = path.basename(__filename);
import { development } from "../../ormConfig";
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

// 모델(테이블) 읽기
fs.readdirSync(__dirname)
    .filter((file) => {
        return file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js";
    })
    .forEach((file) => {
        console.log(file);
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
