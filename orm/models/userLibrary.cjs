// userLibrary 테이블 model
module.exports = (sequelize, DataTypes) => {
  const userLibrary = sequelize.define(
    "userLibrary",
    // 컬럼 정의
    {
      userLibraryIndex: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: "(주요키/인덱스) 유저 도서관 인덱스",
      },
      userIndex: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: "(인덱스) user 테이블의 유저 인덱스",
      },
      libraryIndex: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: "(인덱스) library 테이블과 연결",
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
      indexes: [{ fields: ["userIndex"] }, { fields: ["libraryIndex"] }],
      charset: "utf8",
      collate: "utf8_general_ci",
      tableName: "userLibrary",
      timestamps: false,
      initialAutoIncrement: 1,
    }
  );
  return userLibrary;
};
