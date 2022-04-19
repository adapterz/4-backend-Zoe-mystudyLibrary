// winston_logs 테이블 model
module.exports = (sequelize, DataTypes) => {
  const log = sequelize.define(
    "winston_logs",
    // 컬럼 정의
    {
      idx: {
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
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      timestamp: {
        type: "TIMESTAMP",
        comment: "YYYY-MM-DD HH:MM:SS",
        allowNull: true,
      },
    },
    {
      charset: "utf8", // 한국어 설정
      collate: "utf8_general_ci", // 한국어 설정
      tableName: "winston_logs", // 테이블 이름
      timestamps: false,
      initialAutoIncrement: 1,
    }
  );
  return log;
};
