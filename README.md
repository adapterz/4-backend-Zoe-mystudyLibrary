# 4-fulllstack-Zoe-mystudyLibrary
------------------------------------

내 주변의 도서관 찾는 사이트
------------------------------------
## 프로젝트 설명

  사용자의 지역을 입력하면 그 지역의 도서관이 검색되는 복지 사이트 입니다.
  
  각 개별 도서관에 평점, 후기를 남길 수 있고 사이트 사용자들끼리 커뮤니티 글을 공유할 수 있습니다.

  
------------------------------------
## 프로젝트 DB 테이블

테이블과 테이블 구성요소:
https://closed-glade-095.notion.site/myStudyLibrary-DB-6bc5bd5da4f9483ab37bf6af83cf3e55

-------------------------------------
## 프로젝트 구조
![image](https://user-images.githubusercontent.com/98700133/160259273-0556e259-ffd2-4c48-a97f-851f331522e4.png)

위의 구조대로 프로젝트를 구성했습니다.



### 해당 프로젝트 폴더 구조
![image](https://user-images.githubusercontent.com/98700133/160256063-cbe1452d-d083-433a-bd81-c0e8d6749f9a.png)

+ Controller: 모델을 관리해주는 역할
+ Rout: 경로 설정
+ Model: DB에 직접적으로 접근하도록 나누어서 코드 작성
+ CustomModule: 해당 프로젝트에 필요한 모듈/메서드들이 정의 및 설정돼있는 파일들을 모아 둔 폴더
+ Terms: 이용약관 html 파일이 있는 폴더

--------------------------------------
## 사용 언어 및 패키지

+ 사용언어: JS
+ 사용모듈: bcrypt, body-parser, colors, cookie-parser,dotenv,express, express-rate-limit, express,session,express-validator, helmet, moment, moment-timezone,morgan,
           mysql2,request,winston,winston-sql-transport, eslint, eslint-config-prettier, eslint-plugin-prettier, prettier

--------------------------------------
## 문제사항과 해결방안

### 1

첫번째 문제/해결방안 링크: 
https://closed-glade-095.notion.site/myStudyLibrary-23cd8182b9674678a7025ce443f11df7

### 2

### **문제**

게시글에 접근한 것 만으로도 조회수를 올려준다면 새로고침을 계속 누르는 행위로 조회수를 계속 올릴 수 있게 됩니다. 이는 커뮤니티 사용자들이 읽고 싶은 글을 선택하는데 장애가 될 것입니다.

또한 인기게시글을 따로 모아둔 카테고리를 따로 기획하지는 않았지만 추후 서비스 확장 가능성을 염두해서 조회수 조작 가능성을 막고 싶었습니다.

 따라서  게시글을 조회할때마다 조회수가 증가하는 것을 방지하기 위한 고민을 했습니다.

### **해결**

조회수를 관리해주는 VIEWPOST 라는 테이블을 추가해줬습니다.

![image](https://user-images.githubusercontent.com/98700133/160259317-e298a65d-8e9c-4ece-916e-6d63d3998ea1.png)

로그인한 유저가 게시글을 조회할 때  해당 VIEWPOST 테이블에  중복되는 ip나 userIndex로 조회한 적이 있는지 탐색해주도록 코드를 작성했습니다.  로그인하지 않은 유저가 게시글을 조회할 때 중복되는 ip로 조회한 적이 있는지 탐색해주도록 코드를 작성했습니다. 또한 기존에 테이블에 데이터가 없으면 조회수를 증가시켜주고 해당 데이터를 VIEWPOST 테이블에 추가해줬습니다. 또한 기존에 해당 게시글을 똑같은 유저가 조회한 기록이 있으면 조회수가 증가하지 않도록 코드를 작성했습니다.
