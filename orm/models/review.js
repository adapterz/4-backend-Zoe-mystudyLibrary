// review 테이블 model
module.exports = (sequelize, DataTypes) => {
  const review = sequelize.define(
    "review",
    // 컬럼 정의
    {
      reviewIndex: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: "(주요키/인덱스) 후기인덱스",
      },
      libraryIndex: {
        type: DataTypes.INTEGER.UNSIGNED,
        comment: "(인덱스) library 테이블의 도서관 인덱스",
        allowNull: false,
      },
      userIndex: {
        type: DataTypes.INTEGER.UNSIGNED,
        comment: "(인덱스) user 테이블의 유저 인덱스",
        allowNull: false,
      },
      reviewContent: {
        type: DataTypes.STRING(102),
        comment: "후기 내용",
        allowNull: false,
      },
      grade: {
        type: DataTypes.INTEGER.UNSIGNED,
        comment: "평점, 1~5 범위의 정수",
        allowNull: false,
      },
      createTimestamp: {
        type: "TIMESTAMP",
        comment: "YYYY-MM-DD HH:MM:SS",
        allowNull: false,
      },
      updateTimestamp: {
        type: "TIMESTAMP",
        comment: "YYYY-MM-DD HH:MM:SS",
        allowNull: true,
      },
      deleteTimestamp: {
        type: "TIMESTAMP",
        comment: "YYYY-MM-DD HH:MM:SS",
        allowNull: true,
      },
    },
    {
      indexes: [{ fields: ["libraryIndex"] }, { fields: ["userIndex"] }],
      charset: "utf8",
      collate: "utf8_general_ci",
      tableName: "review",
      timestamps: false,
      initialAutoIncrement: 1,
    }
  );
  return review;
};
