# 4-backend-Zoe-mystudyLibrary
------------------------------------

내 주변의 도서관 찾는 사이트
------------------------------------
## 프로젝트 설명

  사용자의 지역을 입력하면 그 지역의 도서관이 검색되는 복지 사이트 입니다.
  
  각 개별 도서관에 평점, 후기를 남길 수 있고 사이트 사용자들끼리 커뮤니티 글을 공유할 수 있습니다.

------------------------------------
## 프로젝트 기획
https://ovenapp.io/view/sM4TbEvWMLijyHLw5oZIhUubP99mgGUD/gHdLH

왼쪽 하단의 '메모 표시'를 누르면 각 페이지와 기능에 대한 설명을 볼 수 있습니다.
화살표를 누르거나 '페이지 목록'을 누르면 다른 페이지로 넘어갈 수 있습니다.
'링크 영역 표시'를 누르면 누를 수 있는 영역을 확인할 수 있습니다.

------------------------------------
## 프로젝트 DB 테이블

테이블과 테이블 구성요소:
https://closed-glade-095.notion.site/myStudyLibrary-DB-6bc5bd5da4f9483ab37bf6af83cf3e55

-------------------------------------
## 프로젝트 구조
![image](https://user-images.githubusercontent.com/98700133/166646797-f6f3a886-3091-4fdd-9aeb-6e579bb1e6c4.png)

위의 구조대로 프로젝트를 구성했습니다.



### 해당 프로젝트 폴더 구조
![image](https://user-images.githubusercontent.com/98700133/166646865-e7d6aafd-644d-4210-b574-e974d8893630.png)

+ controller: 모델을 관리해주는 역할
+ route: 경로 설정
+ model: DB에 직접적으로 접근하도록 나누어서 코드 작성
+ customModule: 해당 프로젝트에 필요한 모듈/메서드들이 정의 및 설정돼있는 파일들을 모아 둔 폴더
+ terms: 이용약관 html 파일이 있는 폴더

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

두번째 문제/해결방안 링크:
https://closed-glade-095.notion.site/myStudyLibrary-2-ec21cf5b53b0428f9bce3c5fa2ff9736
