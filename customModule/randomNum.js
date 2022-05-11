// 랜덤한 값 뽑는 메서드
export async function randomNum(min, max) {
  const randNum = Math.floor(Math.random() * (max - min + 1)) + min;
  return randNum;
}
