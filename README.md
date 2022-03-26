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
## 문제 발생과 해결방안
