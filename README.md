# 4-fulllstack-Zoe-mystudyLibrary
===================================
내 주변의 도서관 찾는 사이트
------------------------------------
## 프로젝트 설명

  사용자의 지역을 입력하면 그 지역의 도서관이 검색되는 복지 사이트 입니다.
  
  각 개별 도서관에 평점, 후기를 남길 수 있고 사이트 사용자들끼리 커뮤니티 글을 공유할 수 있습니다.

  
------------------------------------
## 프로젝트 DB 테이블 설명
### A. USER 테이블
![image](https://user-images.githubusercontent.com/98700133/160246119-7fc0b1ed-49df-4c3c-ad71-87910bf0ca36.png)

  유저의 정보를 관리하기 위한 테이블입니다.
  
 * 컬럼
 + userIndex(유저 인덱스) - 주요키
  - INT
 + id(아이디)
  - VARCHAR(25)
 + pw(비밀번호)
  - VARCHAR(500)
 + name(이름)
  - VARCHAR(30)
 + gender(성별)
  - CHAR(1)
 + phoneNumber(휴대폰 번호)
  - CHAR(14)
 + nickName(닉네임)
  - CHAR(8)
 + profileShot(프로필 사진)
  - VARCHAR(1000)
 + updateDateTime(업데이트 날짜/시간)
  - DATETIME

### A-(1). USERLIBRARY 테이블
![image](https://user-images.githubusercontent.com/98700133/160254262-0040868e-d9c5-4ef3-b54b-994ad31f8870.png)

  유저가 구독한 도서관 정보를 관리하기 위한 테이블입니다.
  
 * 컬럼
 + userIndex(유저 인덱스)
  - INT
 + libraryIndex(도서관 인덱스)
  - INT
 + updateDateTime(업데이트 날짜/시간)
  - DATETIME
 + deleteDateTime(삭제 날짜/시간)
  - DATETIME

### B. BOARD 테이블
![image](https://user-images.githubusercontent.com/98700133/160252699-b547149e-3648-479d-ad2e-a32f379694fb.png)

  게시판에 올라온 글 정보를 관리하기 위한 테이블입니다.
  
  * 컬럼
  + boardIndex(게시글 인덱스) - 주요키
   - INT
  + category(게시판 카테고리)
   - CHAR(5)
  + userIndex(유저 인덱스)
   - INT
  + postTitle(글 제목)
   - VARCHAR(50)
  + postContent(글 내용)
   - VARCHAR(5000)
  + viewCount(조회수)
   - INT
  + favoriteCount(좋아요 수)
   - INT
  + createDateTime(작성 날짜/시간)
   - DATETIME
  + deleteDateTime(삭제 날짜/시간)
   - DATETIME

### B-(1). TAG 테이블
![image](https://user-images.githubusercontent.com/98700133/160254410-34e6e1ee-b0e3-492a-b372-a14bac119e14.png)

  특정 게시글의 태그 정보를 관리하기 위한 테이블입니다.
  
  * 컬럼
  + boardIndex(게시글 인덱스)
   - INT
  + tag(태그 내용)
   - CHAR(8)
  + updateDateTime(업데이트 날짜/시간)
   - DATETIME
  + deleteDateTime(삭제 날짜/시간)
   - DATETIME

### B-(2). VIEWPOST 테이블
![image](https://user-images.githubusercontent.com/98700133/160254578-8e4ef874-c4cf-4312-9095-57263f639b30.png)

  조회수 중복 증가 여부를 체크하기 위해 관리하는 테이블입니다.
  
  * 컬럼
  + boardIndex(게시글 인덱스)
   - INT
  + ip (아이피)
   - VARCHAR(100)
  + userIndex(유저 인덱스)
   - INT
  + updateDateTime(업데이트 날짜/시간)
   - DATETIME
  + deleteDateTime(삭제 날짜/시간)
   - DATETIME

### B-(3). FAVORITEPOST 테이블
![image](https://user-images.githubusercontent.com/98700133/160255557-67f7ed49-f471-4f40-928f-633ddf848893.png)

  좋아요 중복 증가 여부를 체크하기 위해 관리하는 테이블입니다.
  
  * 컬럼
  + boardIndex(게시글 인덱스)
   - INT
  + userIndex(유저 인덱스)
   - INT
  + updateDateTime(업데이트 날짜/시간)
   - DATETIME
  + deleteDateTime(삭제 날짜/시간)
   - DATETIME
 
### B-(4). COMMENT 테이블
![image](https://user-images.githubusercontent.com/98700133/160254177-eb5f4da7-b413-4697-a356-7aa62b7ecf30.png)

  게시글에 작성된 댓글 정보를 관리하기 위한 테이블입니다.
  
  * 컬럼
  + commentIndex(댓글 인덱스) - 주요키
   - INT
  + boardIndex(게시글 인덱스)
   - INT
  + userIndex(유저 인덱스)
   - INT
  + commentContent(댓글 내용)
   - VARCHAR(500)
  + createDateTime(작성 날짜/시간)
   - DATETIME
  + deleteDateTime(삭제 날짜/시간)
   - DATETIME

### C. LIBRARY 테이블
![image](https://user-images.githubusercontent.com/98700133/160252822-ebf42a0b-e75b-479c-ac51-d37f76e4938d.png)

  공공데이터 포털에 올라온 '전국도서관 정보'를 관리하기 위한 테이블입니다.

  * 컬럼
  + libraryIndex(도서관 인덱스) - 주요키
   - INT
  + libraryName(도서관 이름)
   - VARCHAR(30)
  + libraryType(도서관 종류)
   - VARCHAR(15)
  + closeDay(휴관일)
   - VARCHAR(200)
  + openWeekday(평일운영시작시간)
   - TIME
  + endWeekday(평일운영종료시간)
   - TIME
  + openSaturday(토요일운영시작시간)
   - TIME
  + endSaturday(토요일운영종료시간)
   - TIME
  + openHoliday(공휴일운영시작시간)
   - TIME
  + endHoliday(공휴일운영종료시간)
   - TIME
  + nameOfCity(시도명)
   - CHAR(8)
  + districts(시군구명)
   - VARCHAR(15)
  + address(상세주소)
   - VARCHAR(200)
  + libraryContact(도서관연락처)
   - CHAR(14)
  + deleteDateTime(삭제 날짜/시간)
   - DATETIME

### C-(1). REVIEW 테이블
![image](https://user-images.githubusercontent.com/98700133/160254108-b9d0aec8-972e-47eb-919a-551561771b34.png)

  특정 도서관에 작성한 후기 정보를 관리하기 위한 테이블입니다.
  
  * 컬럼
  + reviewIndex(리뷰 인덱스) - 주요키
   - INT
  + libraryIndex(도서관 인덱스)
   - INT
  + userIndex(유저 인덱스)
   - INT
  + reviewContent(후기 내용)
   - VARCHAR(100)
  + grade(평점)
   - DECIMAL(2,1)
  + createDateTime(작성 날짜/시간)
   - DATETIME
  + deleteDateTime(삭제 날짜/시간)
   - DATETIME

### D. winston_logs 테이블
![image](https://user-images.githubusercontent.com/98700133/160255592-2ff4faae-45d7-401e-b060-e6154b86d3d9.png)

  로그 관리 테이블입니다.
  

-------------------------------------
## 프로젝트 구조
![image](https://user-images.githubusercontent.com/98700133/160255925-f8995509-a9c1-4d2c-ae46-6a3f601c7a59.png)

위의 구조대로 프로젝트를 구성했습니다.

### 해당 프로젝트 폴더 구조
![image](https://user-images.githubusercontent.com/98700133/160256063-cbe1452d-d083-433a-bd81-c0e8d6749f9a.png)

+ Controller: 모델을 관리해주는 역할
+ Routes: 경로 설정
+ Model: DB에 직접적으로 접근하도록 나누어서 코드 작성
+ CustomModule: 해당 프로젝트에 필요한 모듈/메서드들이 정의 및 설정돼있는 파일들을 모아 둔 폴더
+ Terms: 이용약관 html 파일이 있는 폴더

--------------------------------------
## 사용 언어 및 패키지

+ 사용언어: JS
+ 사용모듈: bcrypt, body-parser, colors, cookie-parser,dotenv,express, express-rate-limit, express,session,express-validator, helmet, moment, moment-timezone,morgan,
           mysql2,request,winston,winston-sql-transport, eslint, eslint-config-prettier, eslint-plugin-prettier, prettier

--------------------------------------
## 
