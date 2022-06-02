// wiseSaying 테이블 models
module.exports = (sequelize, DataTypes) => {
  const wiseSaying = sequelize.define(
    "wiseSaying",
    // 컬럼 정의
    {
      wiseSayingIndex: {
        type: DataTypes.TINYINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: "(주요키/인덱스) 명언 인덱스",
      },
      wiseSayingContent: {
        type: DataTypes.STRING(202),
        allowNull: false,
        comment: "웹 스크래핑 해온 명언 내용",
      },
      celebrity: {
        type: DataTypes.STRING(15),
        allowNull: false,
        comment: "명언을 말한 사람",
      },
    },
    {
      charset: "utf8",
      collate: "utf8_general_ci",
      tableName: "wiseSaying",
      timestamps: false,
      initialAutoIncrement: 1,
    }
  );
  return wiseSaying;
};
