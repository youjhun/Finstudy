/**
 * Gemini API 클라이언트 및 퀴즈 생성 유틸리티
 * 여러 뉴스 기사를 한 번의 API 호출로 처리하여 쿼터 효율성 극대화
 * v1beta 엔드포인트 + 다중 모델 폴백 지원
 */

import { CrawledArticle } from './news-crawler';

export interface QuizQuestion {
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isPremium: boolean; // 프리미엄 해설 여부
}

export interface GeneratedArticle {
  id: string;
  title: string;
  summary: string;
  category: '머니/재테크' | '산업/트렌드' | '갓생/라이프' | '글로벌 이슈' | '기타';
  readTime: string;
  source: string;
  keyPoints: string[];
  terms: string[];
  quiz: QuizQuestion[];
  url: string;
  generatedAt: string;
}

// Gemini API 모델 목록 (우선순위 순서)
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-3-flash-preview',
  'gemini-2.5-pro',
];

/**
 * 여러 기사를 한 번의 API 호출로 배치 처리합니다.
 * 각 기사별로 요약, 주요 포인트, 경제 용어, 10문제 퀴즈를 생성합니다.
 * High demand 오류 시 보조 모델로 자동 재시도합니다.
 * 
 * @param articles - 처리할 기사 배열
 * @param apiKey - Gemini API 키
 * @returns 생성된 기사 배열
 */
export async function processArticlesBatch(
  articles: CrawledArticle[],
  apiKey: string
): Promise<GeneratedArticle[]> {
  if (!apiKey) {
    throw new Error('Gemini API 키가 설정되지 않았습니다. 설정 화면에서 API 키를 입력해주세요.');
  }

  if (articles.length === 0) {
    return [];
  }

  // 기사 리스트 포맷팅
  const articlesText = articles
    .map((article, idx) => `${idx + 1}. 제목: ${article.title}\n내용: ${article.content}`)
    .join('\n\n---\n\n');

  const prompt = `당신은 경제 교육 전문가이자 시험 출제 전문가입니다. 다음은 ${articles.length}개의 뉴스 기사 리스트입니다.
각 기사별로 [요약, 주요포인트 3-4개, 경제용어 3-5개, 카테고리, 퀴즈 10문제]를 생성해서 하나의 거대한 JSON 배열 형식으로 응답해주세요.

[기사 리스트]
${articlesText}

**경제용어 추출 시 필수 규칙:**
- 경제용어는 반드시 "재정경제부_시사경제용어 정보" 데이터베이스에 정확히 존재하는 용어만 추출합니다.
- 부분 매칭이 아닌 "정확한 용어명"으로만 추출합니다.
- 예: "실적" 검색 시 "실적 공사비" 같은 다른 용어를 추출하지 않습니다.
- 예: "고용" 검색 시 "고령자고용촉진장려금제도" 같은 다른 용어를 추출하지 않습니다.
- 기사에서 추출한 용어들을 먼저 정리한 후, 경제용어사전에 정확히 존재하는 것만 최종 선택합니다.
- 만약 기사의 용어가 경제용어사전에 없으면, 그 용어는 포함하지 않습니다.

**요구사항:**
1. 각 기사마다 정확히 10개의 퀴즈를 생성합니다.
2. 각 퀴즈는 4개의 선택지를 가집니다. 선택지는 모두 그럴듯해야 하며, 정답과 오답의 차이가 명확해야 합니다.
3. 퀴즈 구성 및 난이도 (반드시 데이터에 포함):
   - 문제 1-2: 기사 내용 직접 이해 (난이도: "easy")
   - 문제 3-5: 기사 내용을 바탕으로 한 논리적 추론 (난이도: "medium")
   - 문제 6-8: 기사 내용의 경제적 파급효과 분석 (난이도: "hard")
   - 문제 9-10: 거시경제 관점에서의 종합 판단 및 정책 함의 (난이도: "hard")
4. 논리적 추론, 경제적 파급효과, 거시경제 관점 문제는 기사에 없는 지표나 현상을 설명할 수 있는 문제를 내야 합니다.
   예: "만약 금리가 추가로 인상된다면?", "국제 유가 상승이 미칠 영향은?", "이 정책의 장기적 파급효과는?"
5. 각 퀴즈마다 정답 인덱스(0-3)와 해설을 포함합니다.
   - 해설은 최소 50자 이상, 최대 200자 이내여야 합니다.
   - 해설에는 왜 정답인지, 왜 다른 선택지는 틀렸는지 간결하게 설명해야 합니다.
   - 경제 개념이나 용어가 있으면 추가 설명을 포함하세요.
6. 난이도는 "easy", "medium", "hard" 중 하나입니다 (반드시 문자열로).
7. 모든 해설은 프리미엄 콘텐츠입니다 (isPremium: true).
8. 요약은 3-4문장입니다.
9. 주요 포인트와 경제 용어는 배열 형식입니다.
10. 선택지는 모두 한국어로 작성하고, 비슷한 길이를 유지하세요.
11. 기사 내용을 절대 임의로 수정하지 마세요. 기사에 있는 사실만 사용하세요.
12. 카테고리는 다음 중 하나입니다:
    - "머니/재테크": 금리, 환율, 주식, 부동산, 가상자산 등 실제 자산 형성과 직결된 뉴스
    - "산업/트렌드": 반도체, AI, 모빌리티, K-콘텐츠 등 세상을 바꾸는 기업과 기술 뉴스
    - "갓생/라이프": 소비 트렌드, 연금, 세금(연말정산), 청약 등 사회 초년생 필수 상식
    - "글로벌 이슈": 미국 대선, 전쟁, 국제 유가 등 거시(Macro) 경제 흐름을 보여주는 뉴스
    - "기타": 위에 해당하지 않는 경제 뉴스

**응답 형식 (JSON 배열만 응답, 다른 텍스트는 포함하지 마세요):**
[
  {
    "title": "기사 제목",
    "summary": "3-4문장 요약",
    "category": "머니/재테크",
    "keyPoints": ["포인트1", "포인트2", "포인트3"],
    "terms": ["용어1", "용어2", "용어3"],
    "quiz": [
      {
        "question": "질문 텍스트",
        "choices": ["선택지1", "선택지2", "선택지3", "선택지4"],
        "answer": 0,
        "explanation": "50-200자 범위의 간결하고 명확한 해설",
        "difficulty": "easy",
        "isPremium": true
      }
    ]
  }
]`;

  // 모델별 재시도 로직
  for (const model of GEMINI_MODELS) {
    try {
      console.log(`📤 Gemini API 호출: ${model} 모델로 ${articles.length}개 기사 배치 처리 중...`);
      
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
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
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.error?.message || response.statusText;
        
        if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota')) {
          console.warn(`⚠️ ${model} 쿼터 초과, 다음 모델로 재시도...`);
          continue;
        }
        
        throw new Error(`Gemini API 오류: ${errorMessage}`);
      }

      const data = await response.json();
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        throw new Error('Gemini API 응답이 비어있습니다.');
      }

      // JSON 파싱 (마크다운 코드 블록 제거)
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\[([\s\S]*)\]/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;

      let parsedData;
      try {
        parsedData = JSON.parse(jsonStr);
      } catch (e) {
        console.error('JSON 파싱 오류:', e);
        console.error('응답 내용:', content.substring(0, 500));
        throw new Error('Gemini API 응답을 JSON으로 파싱할 수 없습니다.');
      }

      if (!Array.isArray(parsedData)) {
        throw new Error('Gemini API 응답이 배열이 아닙니다.');
      }

      // 응답 검증 및 변환
      const generatedArticles: GeneratedArticle[] = parsedData.map((item: any, idx: number) => {
        // 난이도 검증
        const validateDifficulty = (diff: any): 'easy' | 'medium' | 'hard' => {
          if (typeof diff === 'string' && ['easy', 'medium', 'hard'].includes(diff)) {
            return diff as 'easy' | 'medium' | 'hard';
          }
          return 'easy';
        };

        // 카테고리 검증
        const validateCategory = (cat: any): GeneratedArticle['category'] => {
          const validCategories = ['머니/재테크', '산업/트렌드', '갓생/라이프', '글로벌 이슈', '기타'];
          if (typeof cat === 'string' && validCategories.includes(cat)) {
            return cat as GeneratedArticle['category'];
          }
          return '기타';
        };

        const quiz = (item.quiz || []).map((q: any) => ({
          question: q.question || '',
          choices: q.choices || [],
          answer: q.answer ?? 0,
          explanation: q.explanation || '',
          difficulty: validateDifficulty(q.difficulty),
          isPremium: q.isPremium !== false,
        }));

        if (quiz.length !== 10) {
          console.warn(`⚠️ 기사 ${idx + 1}: 퀴즈 개수가 ${quiz.length}개입니다 (예상: 10개)`);
        }

        return {
          id: `article-${Date.now()}-${idx}`,
          title: item.title || '',
          summary: item.summary || '',
          category: validateCategory(item.category),
          readTime: '5분',
          source: '경제 뉴스',
          keyPoints: item.keyPoints || [],
          terms: item.terms || [],
          quiz,
          url: articles[idx]?.url || '',
          generatedAt: new Date().toISOString(),
        };
      });

      console.log(`✅ Gemini API 성공: ${generatedArticles.length}개 기사 생성됨`);
      return generatedArticles;
    } catch (error) {
      console.error(`❌ ${model} 오류:`, error);
      continue;
    }
  }

  throw new Error('모든 Gemini 모델 시도가 실패했습니다. 나중에 다시 시도해주세요.');
}

/**
 * 단일 기사를 처리합니다 (호환성 유지)
 */
export async function processArticleWithGemini(
  article: CrawledArticle,
  apiKey: string
): Promise<GeneratedArticle> {
  const results = await processArticlesBatch([article], apiKey);
  return results[0];
}
