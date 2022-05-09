// winston_logs 테이블 models
module.exports = (sequelize, DataTypes) => {
  const log = sequelize.define(
    "winston_logs",
    // 컬럼 정의
    {
      logIndex: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      level: {
        type: DataTypes.CHAR(10),
        comment: "로그 level",
        allowNull: true,
      },
      message: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "로그 내용",
      },
      meta: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      timestamp: {
        type: DataTypes.TIMESTAMP,
        allowNull: false,
        defaultValue: sequelize.literal("now()"),
      },
    },
    {
      charset: "utf8",
      collate: "utf8_general_ci",
      tableName: "winston_logs",
      timestamps: false,
      initialAutoIncrement: 1,
    }
  );
  return log;
};
