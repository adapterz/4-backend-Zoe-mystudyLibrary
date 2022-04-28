// comment 테이블 model
module.exports = (sequelize, DataTypes) => {
  const comment = sequelize.define(
    "comment",
    // 컬럼 정의
    {
      commentIndex: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: "(주요키/인덱스) 댓글인덱스",
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
      commentContent: {
        type: DataTypes.STRING(502),
        comment: "댓글 내용",
        allowNull: false,
      },
      parentIndex: {
        type: DataTypes.INTEGER.UNSIGNED,
        comment: "null 이면 루트댓글 아니면 대댓글",
        allowNull: true,
      },
      commentSequence: {
        type: DataTypes.INTEGER.UNSIGNED,
        comment: "루트댓글의 대댓글들 순서",
        allowNull: false,
      },
      boardDeleteTimestamp: {
        type: DataTypes.TIMESTAMP,
        comment: "YYYY-MM-DD HH:MM:SS",
        allowNull: true,
      },
      createTimestamp: {
        type: DataTypes.TIMESTAMP,
        comment: "YYYY-MM-DD HH:MM:SS",
        allowNull: false,
      },
      updateTimestamp: {
        type: DataTypes.TIMESTAMP,
        comment: "YYYY-MM-DD HH:MM:SS",
        allowNull: true,
      },
      deleteTimestamp: {
        type: DataTypes.TIMESTAMP,
        comment: "YYYY-MM-DD HH:MM:SS",
        allowNull: true,
      },
    },
    {
      indexes: [{ fields: ["boardIndex"] }, { fields: ["userIndex"] }],
      charset: "utf8",
      collate: "utf8_general_ci",
      tableName: "comment",
      timestamps: false,
      initialAutoIncrement: 1,
    }
  );
  return comment;
};
