// board 테이블 model
module.exports = (sequelize, DataTypes) => {
  const board = sequelize.define(
    "board",
    // 컬럼 정의
    {
      boardIndex: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: "(주요키/인덱스) 게시판 인덱스",
      },
      category: {
        type: DataTypes.TINYINT,
        comment: "카테고리, 공부인증샷/자유게시판(0/1로 저장)",
        allowNull: false,
      },
      userIndex: {
        type: DataTypes.INTEGER.UNSIGNED,
        comment: "(인덱스) user 테이블의 유저 인덱스",
        allowNull: false,
      },
      postTitle: {
        type: DataTypes.STRING(52),
        comment: "게시글 이름",
        allowNull: false,
      },
      postContent: {
        type: DataTypes.STRING(5002),
        comment: "게시글 내용",
        allowNull: false,
      },
      viewCount: {
        type: DataTypes.INTEGER.UNSIGNED,
        comment: "게시글의 좋아요 수",
        allowNull: false,
        defaultValue: 0,
      },
      favoriteCount: {
        type: DataTypes.INTEGER.UNSIGNED,
        comment: "게시글의 조회수",
        allowNull: false,
        defaultValue: 0,
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
      indexes: [{ unique: true, fields: ["userIndex"] }],
      charset: "utf8", // 한국어 설정
      collate: "utf8_general_ci", // 한국어 설정
      tableName: "board", // 테이블 이름
      timestamps: false,
      initialAutoIncrement: 1,
    }
  );
  return board;
};
