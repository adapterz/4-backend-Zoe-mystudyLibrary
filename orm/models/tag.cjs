// tag 테이블 models
module.exports = (sequelize, DataTypes) => {
  const tag = sequelize.define(
    "tag",
    // 컬럼 정의
    {
      tagIndex: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: "(주요키/인덱스)",
      },
      boardIndex: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: "(인덱스) board 테이블의 게시글 인덱스",
      },
      tag: {
        type: DataTypes.CHAR(8),
        comment: "태그, 2~8글자 사이의 태그(한글만)",
        allowNull: true,
      },
      tagSequence: {
        type: DataTypes.TINYINT,
        comment: "한 게시글의 태그 순번, 1~5",
        allowNull: false,
      },
      updateTimestamp: {
        type: DataTypes.TIMESTAMP,
        comment: "YYYY-MM-DD HH:MM:SS",
        defaultValue: sequelize.literal("now()"),
        allowNull: false,
      },
      deleteTimestamp: {
        type: DataTypes.TIMESTAMP,
        comment: "YYYY-MM-DD HH:MM:SS",
        allowNull: true,
      },
    },
    {
      indexes: [{ fields: ["boardIndex"] }],
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      tableName: "tag",
      timestamps: false,
      initialAutoIncrement: 1,
    }
  );
  return tag;
};
