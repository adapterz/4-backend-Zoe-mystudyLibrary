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
![image](https://user-images.githubusercontent.com/98700133/160259245-610fa7b2-04cb-4c93-afce-14249e816c9e.png)

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

### **기존 상태**

![image](https://user-images.githubusercontent.com/98700133/160259242-de01af36-704e-402e-b43e-bae03c813965.png)

위의 패턴으로 프로그램 구조를 짜줬습니다.

model에는 쿼리문을 통해 직접으로 DB에 접근하는 코드들을 작성해줬습니다. 

controller에서는 model의 메서드를 호출해줘서 그 결과값을 바탕으로 분기처리를 해서 클라이언트에게 응답하도록 코드를 작성했습니다.

### **원하는 것**

model에서 쿼리 명령문을 실행해주는  mysql 모듈의 query 메서드를 실행해줬습니다. SELECT 쿼리 명령어를 사용했을 때 DB에서 select해온 값에 따른 상태 메세지를 controller에 동기적으로 전달하고 싶었습니다. 

### **문제**

그런데 아래와 모델에서 query 메서드 실행 결과를 컨트롤러에 return 해서 클라이언트에게 응답해줬을 때 오류가 발생했습니다.

```jsx
// 모델
async function exampleModel() {
  // 쿼리문
  const query = "SELECT * FROM BOARD";
  // mysql 모듈을 사용한 쿼리 메서드
  const results = await db.pool.query(query, async function (err, results) {
    return results;
  });
  return results;
}

```

```jsx
// 컨트롤러
const exampleController = async function (req, res) {
  const model_results = await board_model.exampleModel();
	console.log(model_results);
  res.status(200).json(model_results);
};
```

![오류](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/99402d47-d88e-457d-a5c9-8624e81ab102/Untitled.png)


오류

### 문제 원인 파악

async/await이 잘 작동하지 않는 건가 싶어서 controller에서 model_results 의 로그를 출력해봤습니다.

async/await이 작동하지 않는 것이라면 undefined가 떠야합니다.

하지만 console.log(model_results)의 결과값은 아래와 같았습니다.

![console.log(model_results); 의 출력값](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/a183e5ac-c52d-4ab3-ac31-d133de692f9e/Untitled.png)

console.log(model_results); 의 출력값

즉,  전달된 값은 모델에서 작성한 query 메서드의 결과값이 아니라 query메서드 자체의 정보에 관한 것이라는 것을 알 수 있었습니다. 

### 문제해결

async/await을 사용해서 SELECT 쿼리문의 실행 결과값을 받아줄 수 있는 mysql2 모듈을 사용해줬습니다. 아래와 같이 쿼리메서드가 끝난 후 results 변수를 따로 받아 controller로 결과값을 return 해줬습니다. 

```jsx
// 모델
async function exampleModel(board_index, user_index, ip) {
    // 쿼리문
    const query = "SELECT userIndex FROM BOARD";
		 // mysql2 모듈을 사용한 쿼리 메서드 
		const [results,fields] = await db.db_connect.query(query);
	return results;
  });
}
```

### 2

### **문제**

게시글에 접근한 것 만으로도 조회수를 올려준다면 새로고침을 계속 누르는 행위로 조회수를 계속 올릴 수 있게 됩니다. 이는 커뮤니티 사용자들이 읽고 싶은 글을 선택하는데 장애가 될 것입니다.

또한 인기게시글을 따로 모아둔 카테고리를 따로 기획하지는 않았지만 추후 서비스 확장 가능성을 염두해서 조회수 조작 가능성을 막고 싶었습니다.

 따라서  게시글을 조회할때마다 조회수가 증가하는 것을 방지하기 위한 고민을 했습니다.

### **해결**

조회수를 관리해주는 VIEWPOST 라는 테이블을 추가해줬습니다.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/8297a8fb-e119-428b-90ba-d206d3dcced8/Untitled.png)

로그인한 유저가 게시글을 조회할 때  해당 VIEWPOST 테이블에  중복되는 ip나 userIndex로 조회한 적이 있는지 탐색해주도록 코드를 작성했습니다.  로그인하지 않은 유저가 게시글을 조회할 때 중복되는 ip로 조회한 적이 있는지 탐색해주도록 코드를 작성했습니다. 또한 기존에 테이블에 데이터가 없으면 조회수를 증가시켜주고 해당 데이터를 VIEWPOST 테이블에 추가해줬습니다. 또한 기존에 해당 게시글을 똑같은 유저가 조회한 기록이 있으면 조회수가 증가하지 않도록 코드를 작성했습니다.
