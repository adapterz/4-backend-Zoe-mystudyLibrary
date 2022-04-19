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
        type: "TIMESTAMP",
        comment: "YYYY-MM-DD HH:MM:SS",
        allowNull: false,
      },
      deleteTimestamp: {
        type: "TIMESTAMP",
        comment: "YYYY-MM-DD HH:MM:SS",
        allowNull: true,
      },
    },
    {
      indexes: [{ fields: ["userIndex"] }, { fields: ["libraryIndex"] }],
      charset: "utf8", // 한국어 설정
      collate: "utf8_general_ci", // 한국어 설정
      tableName: "userLibrary", // 테이블 이름
      timestamps: false,
      initialAutoIncrement: 1,
    }
  );
  return userLibrary;
};
