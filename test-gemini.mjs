import fetch from 'node-fetch';

// 테스트 기사 데이터
const crawledArticle = {
  title: "한국, 올해 1% 성장 그쳐…'스태그플레이션' 직면할 것",
  content: `미국·이란 전쟁 여파로 올해 한국의 실질 국내총생산(GDP) 성장률은 1%로 떨어지지만 물가는 치솟는 '스태그플레이션'에 직면할 수 있다고 프랑스의 투자은행(IB) 나틱시스가 전망했다.

13일 연합뉴스 등에 따르면 나틱시스는 최근 한국의 올해 경제성장률 전망치를 기존 1.8%에서 1.0% 하향했다. 블룸버그 집계에 포함된 국내외 기관 중 한국의 올해 성장률 전망치를 1%대 초반으로 제시한 건 나틱시스가 처음이다.

나틱시스는 지난 2일 발표한 보고서에서 "(한국을 포함한) 신흥 아시아 국가들이 중앙은행들이 도울 수 없는 스태그플레이션 환경에 직면할 것으로 예상한다"며 "아시아에서 최악의 시나리오가 전개되고 있다"고 말했다.

스태그플레이션은 경기가 침체된 상황에서 물가까지 높은 현상을 말한다. 인플레이션 때문에 중앙은행은 침체된 경기를 살리기 위한 부양에 나서지 못한다.

나틱시스는 올해 한국의 소비자물가 상승률이 4.2%에 달할 것으로 예상했다.

앞서 나틱시스는 "한국은 경상수지 흑자에도 수입 에너지에 대한 높은 의존 때문에 GDP에 상당한 충격을 받게 될 것"이라며 "한국을 비롯해 태국, 싱가포르, 대만 등은 에너지 비용 상승에 가장 크게 노출돼 있다"고 지난달 18일 발간한 보고서를 통해 지적했다.`,
  source: '연합뉴스',
  url: 'https://example.com/article'
};

// Gemini API 설정
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
  console.log('사용법: GEMINI_API_KEY=your_key node test-gemini.mjs');
  process.exit(1);
}

console.log('🚀 Gemini API 테스트 시작...');
console.log(`📰 기사 제목: ${crawledArticle.title}`);
console.log(`📝 기사 길이: ${crawledArticle.content.length} 자`);
console.log(`🔑 API 엔드포인트: ${GEMINI_API_BASE}`);
console.log('---');

// 퀴즈 생성 함수
async function generateQuizFromArticle(articleText, articleTitle, apiKey) {
  const prompt = `당신은 경제 교육 전문가입니다. 다음 뉴스 기사를 읽고, 한국 고등학생 수준의 경제 개념을 학습할 수 있는 객관식 퀴즈 5문제를 생성해주세요.

**기사 제목:** ${articleTitle}

**기사 내용:**
${articleText}

**요구사항:**
1. 퀴즈는 정확히 5문제여야 합니다.
2. 각 문제는 4개의 선택지를 가져야 합니다.
3. 각 문제마다 정답 인덱스(0-3)와 상세한 해설을 포함해야 합니다.
4. 난이도는 easy, medium, hard 중 하나여야 합니다.
5. 모든 해설은 프리미엄 콘텐츠입니다 (isPremium: true).

**문제 구성:**
- 문제 1-2: 기사에 직접 나타난 내용 기반 (논리적 추론 포함)
- 문제 3-4: 기사 내용을 바탕으로 연쇄 경제 효과를 추론하는 문제
- 문제 5: 기사 내용의 거시경제적 영향을 종합적으로 판단하는 문제

**응답 형식 (JSON):**
[
  {
    "question": "질문 텍스트",
    "choices": ["선택지1", "선택지2", "선택지3", "선택지4"],
    "answer": 0,
    "explanation": "상세한 해설 (프리미엄 콘텐츠)",
    "difficulty": "easy",
    "isPremium": true
  },
  ...
]

JSON 배열만 응답해주세요. 다른 텍스트는 포함하지 마세요.`;

  try {
    console.log('📤 Gemini API 호출 중...');
    const response = await fetch(`${GEMINI_API_BASE}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API 오류: ${error.error?.message || '알 수 없는 오류'}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('Gemini API로부터 응답을 받지 못했습니다.');
    }

    console.log('✅ API 응답 수신 완료');
    console.log('📋 응답 내용 (원본):');
    console.log(content);
    console.log('---');

    // JSON 파싱
    const quiz = JSON.parse(content);

    if (!Array.isArray(quiz) || quiz.length !== 5) {
      throw new Error(`생성된 퀴즈가 정확히 5문제여야 합니다. (현재: ${quiz.length}문제)`);
    }

    console.log('✅ JSON 파싱 성공');
    console.log(`✅ 퀴즈 5문제 생성 완료`);
    console.log('---');

    // 퀴즈 검증
    quiz.forEach((q, idx) => {
      if (!q.question || !Array.isArray(q.choices) || q.choices.length !== 4) {
        throw new Error(`퀴즈 ${idx + 1}의 형식이 올바르지 않습니다.`);
      }
      if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3) {
        throw new Error(`퀴즈 ${idx + 1}의 정답 인덱스가 유효하지 않습니다.`);
      }
      if (!q.explanation) {
        throw new Error(`퀴즈 ${idx + 1}의 해설이 없습니다.`);
      }
      if (q.isPremium === undefined) {
        q.isPremium = true;
      }
    });

    return quiz;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Gemini API 응답을 JSON으로 파싱할 수 없습니다.');
    }
    throw error;
  }
}

// 요약 함수
async function summarizeArticle(articleText, apiKey) {
  const prompt = `다음 뉴스 기사를 한국 고등학생이 이해할 수 있도록 3-4문장으로 요약해주세요. 경제 개념을 명확하게 설명해주세요.

**기사 내용:**
${articleText}

요약만 응답해주세요.`;

  const response = await fetch(`${GEMINI_API_BASE}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API 오류: ${error.error?.message || '알 수 없는 오류'}`);
  }

  const data = await response.json();
  const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!summary) {
    throw new Error('Gemini API로부터 요약을 받지 못했습니다.');
  }

  return summary.trim();
}

// 주요 포인트 추출
async function extractKeyPoints(articleText, apiKey) {
  const prompt = `다음 뉴스 기사에서 가장 중요한 경제 개념 또는 사실 3-4개를 JSON 배열 형식으로 추출해주세요.

**기사 내용:**
${articleText}

**응답 형식:**
["포인트1", "포인트2", "포인트3"]

JSON 배열만 응답해주세요.`;

  const response = await fetch(`${GEMINI_API_BASE}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API 오류: ${error.error?.message || '알 수 없는 오류'}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    return ['주요 포인트 추출 실패'];
  }

  const points = JSON.parse(content);
  return Array.isArray(points) ? points : ['주요 포인트 추출 실패'];
}

// 경제 용어 추출
async function extractTerms(articleText, apiKey) {
  const prompt = `다음 뉴스 기사에서 언급된 경제 용어 3-5개를 JSON 배열 형식으로 추출해주세요.

**기사 내용:**
${articleText}

**응답 형식:**
["용어1", "용어2", "용어3"]

JSON 배열만 응답해주세요.`;

  const response = await fetch(`${GEMINI_API_BASE}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API 오류: ${error.error?.message || '알 수 없는 오류'}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    return ['경제용어'];
  }

  const terms = JSON.parse(content);
  return Array.isArray(terms) ? terms : ['경제용어'];
}

// 메인 테스트 함수
async function testProcessArticleWithGemini() {
  try {
    console.log('🔄 processArticleWithGemini 함수 실행 중...\n');

    // 병렬로 요약, 퀴즈, 주요 포인트, 용어 생성
    console.log('📊 병렬 처리 시작:');
    console.log('  1️⃣ 기사 요약 생성 중...');
    console.log('  2️⃣ 5문제 퀴즈 생성 중...');
    console.log('  3️⃣ 주요 포인트 추출 중...');
    console.log('  4️⃣ 경제 용어 추출 중...');
    console.log('---');

    const [summary, quiz, keyPoints, terms] = await Promise.all([
      summarizeArticle(crawledArticle.content, apiKey),
      generateQuizFromArticle(crawledArticle.content, crawledArticle.title, apiKey),
      extractKeyPoints(crawledArticle.content, apiKey),
      extractTerms(crawledArticle.content, apiKey),
    ]);

    // 읽기 시간 계산
    const wordCount = crawledArticle.content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    const generatedArticle = {
      id: `article-${Date.now()}`,
      title: crawledArticle.title,
      summary,
      category: '금융',
      readTime: `${readTime}분`,
      source: crawledArticle.source,
      keyPoints,
      terms,
      quiz,
      url: crawledArticle.url,
      generatedAt: new Date().toISOString(),
    };

    console.log('✅ 모든 처리 완료!\n');
    console.log('📄 생성된 기사 객체:');
    console.log(JSON.stringify(generatedArticle, null, 2));

    return generatedArticle;
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

// 실행
testProcessArticleWithGemini();
