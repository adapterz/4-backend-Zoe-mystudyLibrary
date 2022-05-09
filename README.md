# 4-backend-Zoe-mytudyLibrary
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

aquerytool 사이트를 이용해서 테이블 설계 

:clipboard: [테이블과 테이블 구성요소](https://closed-glade-095.notion.site/myStudyLibrary-DB-6bc5bd5da4f9483ab37bf6af83cf3e55)

-------------------------------------
## :green_book: 프로젝트 구조
![image](https://user-images.githubusercontent.com/98700133/166647004-e903aab2-f4ed-44db-9cac-f97b5b3e5cd0.png)

:clipboard: [출처](https://developer.mozilla.org/ko/docs/Learn/Server-side/Express_Nodejs/routes)

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
## :blue_book: 주요 기능(보류)
<details>
    <summary> 회원가입 </summary>
 
 
 
* 회원가입을 위해 아이디, 비밀번호, 비밀번호 확인, 이름, 전화번호, 닉네임, 성별 정보 필요
  * 유저가 회원가입 요청한 아이디, 닉네임이 기존에 존재하는지 DB 조회해서 중복여부 확인
  * 비밀번호와 비밀번호 확인이 일치하지 않은지 확인
* bcrypt 모듈을 이용해 비밀번호를 암호화해서 DB에 저장 

<!-- summary 아래 한칸 공백 두고 내용 삽입 -->

</details>


:clipboard: [전체 api 스프레드시트](https://docs.google.com/spreadsheets/d/1ILv18z0Ckho2yMjsH23r4AeFmRbhaJ7szSSHIAQCU3U/edit#gid=0)

-------------------------------------
## :closed_book: 개발 스택

+ 사용언어: JS ES6 + 일부 commonJS(orm model 정의 부분)
+ 그 밖의 스택: Node.js + Express, MySQL, GitHub

--------------------------------------
## :orange_book: 서버 설계
![image](https://user-images.githubusercontent.com/98700133/167326809-4190651f-756b-4330-a46e-f40a17ba8baa.png)


:clipboard: [해당 사이트 url](mystudylibrary.pe.kr) 

--------------------------------------
## 문제사항과 해결방안

### 1

첫번째 문제/해결방안 링크: 
https://closed-glade-095.notion.site/myStudyLibrary-23cd8182b9674678a7025ce443f11df7

### 2

두번째 문제/해결방안 링크:
https://closed-glade-095.notion.site/myStudyLibrary-2-ec21cf5b53b0428f9bce3c5fa2ff9736
