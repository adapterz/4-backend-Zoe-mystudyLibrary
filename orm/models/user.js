// user 테이블 model
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    "user",
    // 컬럼 정의
    {
      userIndex: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: "(주요키/인덱스) 유저 인덱스",
      },
      id: {
        type: DataTypes.STRING(25),
        allowNull: false,
        comment: "(인덱스) 유저 아이디, 5~20자의 하나 이상의 문자와 숫자 조합",
      },
      pw: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: "비밀번호, bcrypt 로 해싱된 pw",
      },
      name: {
        type: DataTypes.STRING(32),
        allowNull: false,
        comment: "이름, 국내 최장 이름 30자",
      },
      gender: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        comment: "성별, 여/남",
      },
      phoneNumber: {
        type: DataTypes.CHAR(11),
        allowNull: false,
        comment: "전화번호, ex) 01012345678(- 제외)",
      },
      nickname: {
        type: DataTypes.CHAR(8),
        allowNull: false,
        comment: "닉네임, 2~8글자 한글 or 숫자 or 영어",
      },
      profileImage: {
        type: DataTypes.STRING(1000),
        comment: "URI",
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
    },
    {
      indexes: [{ unique: true, fields: ["id"] }],
      charset: "utf8",
      collate: "utf8_general_ci",
      tableName: "user",
      timestamps: false,
      initialAutoIncrement: 1,
    }
  );
  return user;
};