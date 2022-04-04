// 내부모듈
import { moment } from "./DateTime";
/*
 * 1. 조회수/좋아요 수 단위 바꿔주는 메서드
 * 2. 도서관 후기 평균 평점 정보 가공
 * 3. 도서관 정보 가공(전체도서관/ 지역도서관)
 * 4. 도서관 정보 가공(특정 인덱스 도서관정보)
 * 5. 평점만큼 별 개수 출력하는 문자열로 가공하는 메서드
 * 6. 삭제된 닉네임 일 경우 null -> 삭제된 유저입니다로 변경
 * 7. 게시글 제목 25글자 단위로 줄바꿈
 * 8. 게시글 내용 50글자 단위로 줄바꿈
 * 9. 댓글 내용 50글자 단위로 줄바꿈
 * 10. 후기 내용 50글자 단위로 줄바꿈
 */
// 조회수/좋아요 수 단위 바꿔주는 메서드
export async function changeUnit(viewOrFavoriteCount) {
	const length = viewOrFavoriteCount.toString().length;
	// 1억이상일 때
	if (viewOrFavoriteCount >= 100000000) {
		// 천만 단위 숫자가 0일 때
		if (viewOrFavoriteCount.toString().substring(length - 8, length - 7) === "0") {
			return viewOrFavoriteCount.toString().substring(0, length - 8) + "억 ";
		}
		// 천만 단위 숫자가 1 이상일 때
		else if (viewOrFavoriteCount.toString().substring(length - 8, length - 7) !== "0") {
			return (
				viewOrFavoriteCount.toString().substring(0, length - 8) +
				"억 " +
				viewOrFavoriteCount.toString().substring(length - 8, length - 7) +
				"천만"
			);
		}
	}
	// 1억 이하 1000만 이상일 때
	else if (viewOrFavoriteCount < 100000000 && viewOrFavoriteCount >= 10000000) {
		// 백만 단위 숫자가 0일 때
		if (viewOrFavoriteCount.toString().substring(length - 7, length - 6) === "0") {
			return viewOrFavoriteCount.toString().substring(0, length - 7) + "천만 ";
		}
		// 백만 단위 숫자가 1 이상일 때
		else if (viewOrFavoriteCount.toString().substring(length - 8, length - 7) !== "0") {
			return (
				viewOrFavoriteCount.toString().substring(0, length - 7) +
				"천 " +
				viewOrFavoriteCount.toString().substring(length - 7, length - 6) +
				"백만"
			);
		}
	}
	// 1000만 이하 100만 이상일 때
	else if (viewOrFavoriteCount < 10000000 && viewOrFavoriteCount >= 1000000) {
		// 십만 단위 숫자가 0일 때
		if (viewOrFavoriteCount.toString().substring(length - 6, length - 5) === "0") {
			return viewOrFavoriteCount.toString().substring(0, length - 6) + "백만 ";
		}
		// 십만 단위 숫자가 1 이상일 때
		else if (viewOrFavoriteCount.toString().substring(length - 6, length - 5) !== "0") {
			return (
				viewOrFavoriteCount.toString().substring(0, length - 6) +
				"백 " +
				viewOrFavoriteCount.toString().substring(length - 6, length - 5) +
				"십만"
			);
		}
	}
	// 100만 이하 10만 이상일 때
	else if (viewOrFavoriteCount < 1000000 && viewOrFavoriteCount >= 100000) {
		// 만 단위 숫자가 0일 때
		if (viewOrFavoriteCount.toString().substring(length - 5, length - 4) === "0") {
			return viewOrFavoriteCount.toString().substring(0, length - 5) + "십만 ";
		}
		// 만 단위 숫자가 1 이상일 때
		else if (viewOrFavoriteCount.toString().substring(length - 5, length - 4) !== "0") {
			return (
				viewOrFavoriteCount.toString().substring(0, length - 5) +
				"십 " +
				viewOrFavoriteCount.toString().substring(length - 5, length - 4) +
				"만"
			);
		}
	}
	// 10만 이하 만 이상일 때
	else if (viewOrFavoriteCount < 100000 && viewOrFavoriteCount >= 10000) {
		// 천 단위 숫자가 0일 때
		if (viewOrFavoriteCount.toString().substring(length - 4, length - 3) === "0") {
			return viewOrFavoriteCount.toString().substring(0, length - 4) + "만 ";
		}
		// 천 단위 숫자가 1 이상일 때
		else if (viewOrFavoriteCount.toString().substring(length - 4, length - 3) !== "0") {
			return (
				viewOrFavoriteCount.toString().substring(0, length - 4) +
				"만 " +
				viewOrFavoriteCount.toString().substring(length - 4, length - 3) +
				"천"
			);
		}
	}
	// 만 이하 천 이상일 때
	else if (viewOrFavoriteCount < 10000 && viewOrFavoriteCount >= 1000) {
		// 천 단위 숫자가 0일 때
		if (viewOrFavoriteCount.toString().substring(length - 3, length - 2) === "0") {
			return viewOrFavoriteCount.toString().substring(0, length - 3) + "천 ";
		}
		// 천 단위 숫자가 1 이상일 때
		else if (viewOrFavoriteCount.toString().substring(length - 3, length - 2) !== "0") {
			return (
				viewOrFavoriteCount.toString().substring(0, length - 3) +
				"천 " +
				viewOrFavoriteCount.toString().substring(length - 3, length - 2) +
				"백"
			);
		}
	}
	// 천 이하는 단위변경 x
	else return viewOrFavoriteCount;
}

// DateTime yyyy-mm-dd 형태로 변경해주는 메서드
export async function changeDateTimeForm(dateTime) {
	let tempDateTime = moment(dateTime, "YYYY-MM-DD").toDate();
	const stringDateTime =
		tempDateTime.getFullYear().toString() +
		"년 " +
		(tempDateTime.getMonth() + 1).toString() +
		"월 " +
		tempDateTime.getDate().toString() +
		"일";
	return stringDateTime;
}

/*
 * 도서관 후기 평균 평점 정보 가공
 * 1. 후기 없을 때
 * 2. 후기가 있는데 평균 평점이 정수로 딱 떨어질 때
 * 3. 후기가 있고 평균 평점이 정수가 아닐 때
 */
export async function changeGradeForm(grade) {
	// 1. 후기가 없을 때
	if (grade === 0) return "⭐ 후기없음";
	// 2. 평균 평점이 정수로 딱 떨어질 때 ".0" 붙여주기
	else if (grade.toString().length === 1) return "⭐ " + grade.toString() + ".0 / 5 점";
	// 3. 평균 평점이 정수가 아닐 때 소수점 1의자리까지 문자열화
	else return "⭐ " + grade.toString() + " / 5점";
}

// 도서관 정보 가공(전체도서관/ 지역도서관)
export async function changeLibrarysDataForm(libraryData) {
	// 도서관명이 15글자 이상일 때 자르고 ... 붙이기
	if (libraryData.libraryName.length >= 15) {
		libraryData.libraryName = libraryData.libraryName.substring(0, 15) + "...";
	}
	// 도서관 유형이 10글자 이상일때 자르고 ... 붙이기
	if (libraryData.libraryType.length >= 10) {
		libraryData.libraryType = libraryData.libraryType.substring(0, 10) + "...";
	}
	// 휴관일이 15글자 이상일때 자르고 ... 붙이기
	if (libraryData.closeDay.length >= 15) {
		libraryData.closeDay = libraryData.closeDay.substring(0, 15) + "...";
	}
	// 시작, 종료시간 5글자까지일떄 자르기(00:00:00 -> 00:00 형태)
	libraryData.openWeekday = libraryData.openWeekday.toString().substring(0, 5);
	libraryData.endWeekday = libraryData.endWeekday.toString().substring(0, 5);
	libraryData.openSaturday = libraryData.openSaturday.toString().substring(0, 5);
	libraryData.endSaturday = libraryData.endSaturday.toString().substring(0, 5);
	libraryData.openHoliday = libraryData.openHoliday.toString().substring(0, 5);
	libraryData.endHoliday = libraryData.endHoliday.toString().substring(0, 5);

	// 주소 20글자까지 자르고 ... 붙이기
	if (libraryData.address.length >= 20) {
		libraryData.address = libraryData.address.substring(0, 20) + "...";
	}
	// 연락처 문자열이 비어있을 때
	if (libraryData.libraryContact === "") libraryData.libraryContact = "연락처 없음";
	return libraryData;
}

// 도서관 정보 가공(특정 인덱스 도서관정보)
export async function changeLibraryDataForm(libraryData) {
	// 연락처가 빈문자열일 때 연락처 없다고 표기해주기
	if (libraryData.libraryContact === "") {
		libraryData.libraryContact = "연락처 없음";
	}
	// 휴관일 25글자 단위로 잘라서 줄바꿈 기호 넣어주기
	const closeDayLength = libraryData.closeDay.length;
	const closeDayLoopCount = Math.ceil(closeDayLength / 25);
	// 휴관일 데이터를 임시로 저장할 변수
	let tempCloseDay = ``;
	for (let count = 0; count < closeDayLoopCount; ++count) {
		tempCloseDay += `${libraryData.closeDay.substring(count * 25, (count + 1) * 25)}
		`;
	}
	libraryData.closeDay = tempCloseDay;

	// 주소 25글자 단위로 잘라서 줄바꿈 기호 넣어주기
	const addressLength = libraryData.address.length;
	const addressLoopCount = Math.ceil(addressLength / 25);
	// 주소 데이터 임시로 저장할 변수
	let tempAddress = ``;
	for (let count = 0; count < addressLoopCount; ++count) {
		tempAddress += `${libraryData.address.substring(count * 25, (count + 1) * 25)}
		`;
	}
	libraryData.address = tempAddress;
	return libraryData;
}

/*
 * 평점만큼 별 개수 출력하는 문자열로 가공하는 메서드
 * 예시: 5점 일경우 ⭐⭐⭐⭐⭐ 5
 * 예시: 2점 일경우 ⭐⭐☆☆☆ 2
 */
export async function changeGradeStarForm(reviewData) {
	// 평점만큼 별 개수 출력하게 하기
	let tempStar = "";
	for (let i = 1; i <= 5; ++i) {
		if (i <= reviewData.grade) tempStar += "⭐";
		else tempStar += "☆";
	}
	tempStar += " " + reviewData.grade;

	reviewData.grade = tempStar;
	return reviewData;
}
// 삭제된 닉네임 일 경우 null -> 삭제된 유저입니다로 변경
export async function checkExistUser(nickname) {
	// 닉네임이 null이면 삭제된 닉네임 취급
	if (nickname === null) return "삭제된 유저입니다.";
	return nickname;
}

// 게시글 제목 25글자 단위로 줄바꿈
export async function newLinePostTitle(boardData) {
	// 제목 25글자 단위로 잘라서 줄바꿈 기호 넣어주기
	const postTitleLength = boardData.postTitle.length;
	const postTitleLoopCount = Math.ceil(postTitleLength / 25);
	// 제목 데이터를 임시로 저장할 변수
	let tempPostTitle = ``;
	for (let count = 0; count < postTitleLoopCount; ++count) {
		tempPostTitle += `${boardData.postTitle.substring(count * 25, (count + 1) * 25)}
		`;
	}
	boardData.postTitle = tempPostTitle;
	return boardData.postTitle;
}

// 게시글 내용 50글자 단위로 줄바꿈
export async function newLinePostContent(boardData) {
	// 내용 50글자 단위로 잘라서 줄바꿈 기호 넣어주기
	const postContentLength = boardData.postContent.length;
	const postContentLoopCount = Math.ceil(postContentLength / 50);
	// 내용 데이터를 임시로 저장할 변수
	let tempPostContent = ``;
	for (let count = 0; count < postContentLoopCount; ++count) {
		tempPostContent += `${boardData.postContent.substring(count * 50, (count + 1) * 50)}
		`;
	}
	boardData.postContent = tempPostContent;
	return boardData.postContent;
}

// 댓글 내용 50글자 단위로 줄바꿈
export async function newLineCommentContent(commentData) {
	// 내용 50글자 단위로 잘라서 줄바꿈 기호 넣어주기
	const commentContentLength = commentData.commentContent.length;
	const commentContentLoopCount = Math.ceil(commentContentLength / 50);
	// 내용 데이터를 임시로 저장할 변수
	let tempCommentContent = ``;
	for (let count = 0; count < commentContentLoopCount; ++count) {
		tempCommentContent += `${commentData.commentContent.substring(count * 50, (count + 1) * 50)}
		`;
	}
	commentData.commentContent = tempCommentContent;
	return commentData.commentContent;
}

// 후기 내용 25글자 단위로 줄바꿈
export async function newLineReviewContent(reviewData) {
	// 내용 50글자 단위로 잘라서 줄바꿈 기호 넣어주기
	const reviewContentLength = reviewData.reviewContent.length;
	const reviewContentLoopCount = Math.ceil(reviewContentLength / 50);
	// 내용 데이터를 임시로 저장할 변수
	let tempReviewContent = ``;
	for (let count = 0; count < reviewContentLoopCount; ++count) {
		tempReviewContent += `${reviewData.reviewContent.substring(count * 25, (count + 1) * 25)}
		`;
	}
	reviewData.reviewContent = tempReviewContent;
	return reviewData.reviewContent;
}
