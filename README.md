# 4-backend-Zoe-mystudyLibrary
------------------------------------

 :books: 내 주변의 도서관 찾는 사이트  :books:
------------------------------------
## :closed_book: 프로젝트 설명

  사용자의 지역을 입력하면 그 지역의 도서관이 검색되는 복지 사이트 입니다.
  
  각 개별 도서관에 평점, 후기를 남길 수 있고 사이트 사용자들끼리 커뮤니티 글을 공유할 수 있습니다.

------------------------------------
## :orange_book: 프로젝트 기획

1. :clipboard: [기획 페이지](https://ovenapp.io/view/sM4TbEvWMLijyHLw5oZIhUubP99mgGUD/gHdLH)
2. 왼쪽 하단의 '메모 표시'를 누르면 각 페이지와 기능에 대한 설명을 볼 수 있습니다.
3. 화살표를 누르거나 '페이지 목록'을 누르면 다른 페이지로 넘어갈 수 있습니다.
4. '링크 영역 표시'를 누르면 누를 수 있는 영역을 확인할 수 있습니다.

------------------------------------
## :ledger: 프로젝트 DB 테이블

:clipboard: [테이블과 테이블 구성요소](https://closed-glade-095.notion.site/myStudyLibrary-DB-6bc5bd5da4f9483ab37bf6af83cf3e55)

-------------------------------------
## :green_book: 프로젝트 구조
![image](https://user-images.githubusercontent.com/98700133/166647004-e903aab2-f4ed-44db-9cac-f97b5b3e5cd0.png)

위의 구조를 기반으로 프로젝트를 구성했습니다. 
(model-controller-route)





### :pushpin: 해당 프로젝트 구조
<details>
    <summary> 프로젝트 구조 펼쳐보기</summary>

  
```bash
├── controller
│   ├── board.js
│   ├── comment.js
│   ├── library.js
│   ├── review.js
│   ├── user.js
│   └── wiseSaying.js
├── model
│   ├── board.js
│   ├── comment.js
│   ├── library.js
│   ├── review.js
│   ├── user.js
│   └── wiseSaying.js
├── route
│   ├── board.js
│   ├── comment.js
│   ├── library.js
│   ├── review.js
│   ├── user.js
│   └── wiseSaying.js
├── terms
│   ├── signUpGuide.html
├── customModule
│   ├── changeDataForm.js
│   ├── checkDataOrAuthority.js
│   ├── checkValidation.js
│   ├── dateTime.js
│   ├── modelLog.js
│   ├── pwBcrypt.js
│   ├── randomNum.js
│   ├── requestOpenApi.js
│   ├── scraping.js
│   ├── statusCode.js
│   └── uploadImage.js
├── orm
│   ├── models
│   │   ├── board.cjs
│   │   ├── comment.cjs
│   │   ├── favoritePost.cjs
│   │   ├── library.cjs
│   │   ├── log.cjs
│   │   ├── review.cjs
│   │   ├── tag.cjs
│   │   ├── user.cjs
│   │   ├── userLibrary.cjs
│   │   ├── wiseSaying.cjs
│   │   ├── withdrwalUser.cjs
│   │   └── index.mjs
├── profileImage
├── .env
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── app.js
├── ormConfig.js
├── package.json
├── package-lock.json
└──  README.md
``` 

<!-- summary 아래 한칸 공백 두고 내용 삽입 -->

</details>

#### 보편화 된 디렉토리
+ route: 리퀘스트를 통해 전달된 http 메서드와 url 경로를 처리하기 위해 적절한 controller로 연결하는 역할을 하는 코드 섹션
+ controller: model을 조작하며 리스폰스 상태코드 및 응답값 정의 하는 코드 섹션
+ model: controller로부터 받은 값에 따라 DB에 직접적으로 접근하는 역할을 하는 코드 섹션

#### 사용자 정의 디렉토리
+ customModule: 보편화 된 디렉토리에 포함되지 않으며 해당 프로젝트에 필요한 모듈/메서드들이 정의 및 설정돼있는 메서드들을 모아 둔 디렉토리

--------------------------------------
## api 주요 기능 정리

https://docs.google.com/spreadsheets/d/1ILv18z0Ckho2yMjsH23r4AeFmRbhaJ7szSSHIAQCU3U/edit#gid=0


-------------------------------------
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
