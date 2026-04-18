// searchTerm 함수 개선 코드
const improved = `
export function searchTerm(query: string): EconomicTerm | undefined {
  const trimmedQuery = query.trim();
  
  // 정확한 매칭
  const exactMatch = economicTermsDatabase.find(
    term => term.term === trimmedQuery
  );
  if (exactMatch) return exactMatch;
  
  // 부분 매칭 - 단어 경계(공백) 기준으로 매칭
  // 1. 정확한 단어 매칭 (검색어가 단독 단어로 존재)
  const exactWordMatches = economicTermsDatabase.filter(term => {
    const words = term.term.split(' ');
    return words.some(word => word === trimmedQuery);
  });
  
  if (exactWordMatches.length > 0) {
    // 정확 단어 매칭이 있으면 길이가 가장 짧은 것 반환
    return exactWordMatches.reduce((shortest, current) => 
      current.term.length < shortest.term.length ? current : shortest
    );
  }
  
  // 2. 부분 단어 매칭 (검색어로 시작하는 단어)
  const partialMatches = economicTermsDatabase.filter(term => {
    const words = term.term.split(' ');
    return words.some(word => word.startsWith(trimmedQuery));
  });
  
  if (partialMatches.length > 0) {
    // 길이가 가장 짧은 것 반환
    return partialMatches.reduce((shortest, current) => 
      current.term.length < shortest.term.length ? current : shortest
    );
  }
  
  return undefined;
}
`;

console.log(improved);
