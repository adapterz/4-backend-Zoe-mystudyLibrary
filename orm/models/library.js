// library 테이블 model
module.exports = (sequelize, DataTypes) => {
  const library = sequelize.define(
    "library",
    // 컬럼 정의
    {
      libraryIndex: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: "(인덱스) 주요키",
      },
      libraryName: {
        type: DataTypes.STRING(30),
        comment: "도서관 이름",
        allowNull: false,
      },
      libraryType: {
        type: DataTypes.TINYINT.UNSIGNED,
        comment: "공공도서관 등에 대응되는 숫자로 저장, ex) 0: 공공도서관",
        allowNULL: false,
      },
      closeDay: {
        type: DataTypes.STRING(150),
        comment: "쉬는날, ex) 토요일, 공휴일",
        allowNull: false,
      },
      openWeekday: {
        type: DataTypes.TIME,
        comment: "평일운영시작시간, ex) 09:00",
        allowNULL: true,
      },
      endWeekday: {
        type: DataTypes.TIME,
        comment: "평일운영종료시간, ex) 18:00",
        allowNULL: true,
      },
      openSaturday: {
        type: DataTypes.TIME,
        comment: "토요일운영시작시간, ex) 09:00",
        allowNULL: true,
      },
      endSaturday: {
        type: DataTypes.TIME,
        comment: "토요일운영종료시간, ex) 18:00",
        allowNULL: true,
      },
      openHoliday: {
        type: DataTypes.TIME,
        comment: "휴일운영시작시간, ex) 09:00",
        allowNULL: true,
      },
      endHoliday: {
        type: DataTypes.TIME,
        comment: "공휴일운영종료시간, ex) 18:00",
        allowNULL: true,
      },
      nameOfCity: {
        type: DataTypes.CHAR(8),
        comment: "(다중컬럼인덱스) 검색용 ex) 광주광역시, 서울특별시",
        allowNULL: true,
      },
      districts: {
        type: DataTypes.STRING(15),
        comment: "(다중컬럼인덱스) 검색용 ex. 서구, 광산구",
        allowNULL: true,
      },
      address: {
        type: DataTypes.STRING(200),
        comment: "도서관 주소",
        allowNULL: true,
      },
      libraryContact: {
        type: DataTypes.CHAR(14),
        comment: "도서관 연락처",
        allowNULL: true,
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
      indexes: [{ fields: ["nameOfCity", "districts"] }],
      charset: "utf8",
      collate: "utf8_general_ci",
      tableName: "library",
      timestamps: false,
      initialAutoIncrement: 1,
    }
  );
  return library;
};
