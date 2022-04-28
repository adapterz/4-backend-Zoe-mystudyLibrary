// favoritePost 테이블 model
module.exports = (sequelize, DataTypes) => {
  const favoritePost = sequelize.define(
    "favoritePost",
    // 컬럼 정의
    {
      favoriteIndex: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: "(주요키/인덱스)",
      },
      boardIndex: {
        type: DataTypes.INTEGER.UNSIGNED,
        comment: "(인덱스) board 테이블의 게시글 인덱스",
        allowNull: false,
      },
      userIndex: {
        type: DataTypes.INTEGER.UNSIGNED,
        comment: "(인덱스) user 테이블의 유저 인덱스",
        allowNull: false,
      },
      favoriteFlag: {
        type: DataTypes.BOOLEAN,
        comment: "0:FALSE/1:TRUE",
        allowNULL: false,
      },
      boardDeleteTimestamp: {
        type: DataTypes.TIMESTAMP,
        comment: "YYYY-MM-DD HH:MM:SS",
        allowNull: true,
      },
      updateTimestamp: {
        type: DataTypes.TIMESTAMP,
        comment: "YYYY-MM-DD HH:MM:SS",
        allowNull: false,
      },
    },
    {
      indexes: [{ fields: ["boardIndex"] }, { fields: ["userIndex"] }],
      charset: "utf8",
      collate: "utf8_general_ci",
      tableName: "favoritePost",
      timestamps: false,
      initialAutoIncrement: 1,
    }
  );
  return favoritePost;
};
