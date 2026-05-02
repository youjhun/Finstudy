/**
 * FinStudy 소크라테스식 문답법 기사 퀴즈 시스템
 * 
 * Gemini API를 이용하여 사용자의 답안을 분석하고
 * 보완점을 기술하며 추가 질문을 제시합니다.
 * 
 * 심화 1, 2 문제에만 적용됩니다.
 */

export interface SocraticQuestion {
  id: string;
  articleTitle: string;
  mainQuestion: string; // 개방형 질문
  context: string; // 기사 배경
  difficulty: 'advanced_1' | 'advanced_2';
  expectedConcepts: string[]; // 기대되는 경제 개념
  rubric: {
    excellent: string; // 우수 답안 기준
    good: string; // 양호 답안 기준
    needsImprovement: string; // 개선 필요 기준
  };
}

export interface EconomicTerm {
  term: string;
  definition: string;
  context: string;
  example: string;
}

export interface SocraticResponse {
  userAnswer: string;
  analysis: {
    score: 'excellent' | 'good' | 'needs_improvement';
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    economicTerms: EconomicTerm[];
    followUpQuestions: string[];
    conceptsCovered: string[];
    conceptsMissed: string[];
  };
}

export interface SocraticQuizData {
  questions: SocraticQuestion[];
}

/**
 * 소크라테스식 문답법 기사 퀴즈 데이터
 * 심화 1, 2 문제만 포함
 */
export const socraticQuizzes: SocraticQuizData = {
  questions: [
    {
      id: 'socratic_advanced_1_1',
      articleTitle: '한국은행, 기준금리 3.5%로 인상... 인플레이션 억제 vs 경기 둔화 우려',
      mainQuestion: '기준금리 인상이 소비자와 기업에 미치는 영향을 설명하고, 이것이 인플레이션 억제와 경기 둔화 사이의 트레이드오프를 어떻게 해결할 수 있을지 분석해보세요.',
      context: '2024년 한국은행이 기준금리를 3.5%로 인상했습니다. 이는 인플레이션 억제를 목표로 하지만, 동시에 기업 투자와 소비 위축으로 인한 경기 둔화 우려를 낳고 있습니다.',
      difficulty: 'advanced_1',
      expectedConcepts: [
        '통화정책의 파급 효과',
        '금리와 소비의 관계',
        '금리와 투자의 관계',
        '인플레이션과 경기의 트레이드오프',
        '스태그플레이션',
      ],
      rubric: {
        excellent: '금리 인상의 메커니즘(대출 비용 증가 → 소비/투자 감소)을 명확히 설명하고, 소비자와 기업에 미치는 구체적 영향을 제시하며, 트레이드오프 해결 방안(예: 선별적 금리 인상, 재정정책 병행 등)을 제시한 답안',
        good: '금리 인상의 영향을 소비와 투자 중 하나만 설명하거나, 트레이드오프를 인식하지만 해결 방안이 불완전한 답안',
        needsImprovement: '금리 인상의 영향을 단편적으로만 설명하거나, 인플레이션 억제와 경기 둔화의 관계를 이해하지 못한 답안',
      },
    },
    {
      id: 'socratic_advanced_1_2',
      articleTitle: '한국 수출 10% 증가, 반도체 주도... 글로벌 경기 회복 신호?',
      mainQuestion: '반도체 수출 증가가 한국 경제 전체에 미치는 긍정적 영향과 부정적 위험요소를 분석하고, 이를 바탕으로 한국이 추구해야 할 경제 정책 방향을 제시해보세요.',
      context: '2024년 1월 한국의 수출액이 전년도 같은 기간 대비 10% 증가했으며, 반도체 수출이 25% 증가하며 주도했습니다. 하지만 이는 특정 산업에 대한 과도한 의존도를 보여줍니다.',
      difficulty: 'advanced_1',
      expectedConcepts: [
        '산업 구조와 경제 성장',
        '수출 의존도와 위험',
        '산업 다각화',
        '비교 우위 이론',
        '경제 구조 조정',
      ],
      rubric: {
        excellent: '반도체 수출 증가의 긍정적 영향(고용, GDP 기여, 외화 수입)과 부정적 위험(산업 편중, 글로벌 경기 변동성 노출)을 균형있게 분석하고, 산업 다각화, 기술 혁신, 인력 양성 등 구체적 정책을 제시한 답안',
        good: '긍정적 영향과 부정적 위험을 모두 언급하지만, 정책 제시가 불완전하거나 일반적인 답안',
        needsImprovement: '수출 증가의 긍정적 측면만 강조하거나, 산업 편중의 위험을 인식하지 못한 답안',
      },
    },
    {
      id: 'socratic_advanced_2_1',
      articleTitle: '미국 기준금리 vs 한국 기준금리... 환율 급등, 수출 경쟁력 위협',
      mainQuestion: '미국과 한국의 금리 차이가 환율에 미치는 영향을 설명하고, 이것이 한국 수출 기업의 경쟁력에 어떻게 영향을 미치는지 분석한 후, 한국이 취할 수 있는 정책 대응 방안을 제시해보세요.',
      context: '미국의 기준금리(4.25%)가 한국(3.5%)보다 높아지면서 달러 강세가 지속되고 있습니다. 이는 원화 약세로 이어져 한국 수출 기업의 가격 경쟁력을 약화시키고 있습니다.',
      difficulty: 'advanced_2',
      expectedConcepts: [
        '금리 차이와 환율의 관계',
        '구매력 평가설 (PPP)',
        '국제 자본 흐름',
        '수출 경쟁력',
        '환율 정책',
        '국제 협력',
      ],
      rubric: {
        excellent: '금리 차이가 환율에 미치는 메커니즘(금리 높은 국가로 자본 유입 → 통화 강세)을 명확히 설명하고, 환율 변화가 수출 기업의 가격 경쟁력에 미치는 구체적 영향을 제시하며, 통화정책, 환율 개입, 구조 개혁 등 다층적 정책 대응을 제시한 답안',
        good: '금리와 환율의 관계를 설명하고 수출 영향을 언급하지만, 정책 대응이 단편적이거나 불완전한 답안',
        needsImprovement: '금리와 환율의 관계를 이해하지 못하거나, 수출 경쟁력 영향을 설명하지 못한 답안',
      },
    },
    {
      id: 'socratic_advanced_2_2',
      articleTitle: '인플레이션 원인별 분석: 에너지 40%, 식품 35%, 기타 25%... 정책 방향은?',
      mainQuestion: '인플레이션의 원인별 기여도를 분석하고, 각 원인에 대응하기 위한 통화정책과 재정정책의 장단점을 비교한 후, 한국이 추구해야 할 최적의 정책 조합을 정당화해보세요.',
      context: '2024년 한국의 인플레이션 원인을 분석하면 에너지(40%), 식품(35%), 기타(25%)로 구성되어 있습니다. 이는 공급 충격 중심의 인플레이션으로, 수요 측 정책만으로는 해결하기 어렵습니다.',
      difficulty: 'advanced_2',
      expectedConcepts: [
        '수요 인플레이션 vs 공급 인플레이션',
        '공급 충격 (Supply Shock)',
        '통화정책의 한계',
        '재정정책과 구조정책',
        '스태그플레이션',
        '정책 조합 (Policy Mix)',
      ],
      rubric: {
        excellent: '에너지와 식품이 공급 충격 중심임을 파악하고, 통화정책만으로는 한계가 있음을 설명한 후, 재정정책(예: 에너지 보조금), 구조정책(예: 재정 에너지 전환), 국제 협력 등 다층적 정책을 제시하고 각각의 장단점을 비교 분석한 답안',
        good: '공급 충격을 인식하고 통화정책의 한계를 언급하지만, 대안 정책이 불완전하거나 장단점 비교가 부족한 답안',
        needsImprovement: '인플레이션의 원인을 이해하지 못하거나, 정책 대응이 단순히 금리 인상/인하만 제시한 답안',
      },
    },
  ],
};

/**
 * Gemini API를 이용한 소크라테스식 답안 분석 프롬프트
 * 경제 용어 해설 포함
 */
export function generateSocraticAnalysisPrompt(
  question: SocraticQuestion,
  userAnswer: string
): string {
  return `당신은 경제 교육 전문가이자 소크라테스식 문답법의 마스터입니다.

학생의 답안을 평가하고 깊이 있는 질문을 통해 사고를 확장시켜야 합니다.
또한 답안에서 추출한 경제 용어에 대한 정확한 해설을 제공해야 합니다.

## 평가 대상 질문
제목: ${question.articleTitle}
난이도: ${question.difficulty}
질문: ${question.mainQuestion}

## 맥락
${question.context}

## 기대되는 경제 개념
${question.expectedConcepts.join(', ')}

## 평가 기준
우수 (Excellent): ${question.rubric.excellent}
양호 (Good): ${question.rubric.good}
개선 필요 (Needs Improvement): ${question.rubric.needsImprovement}

## 학생의 답안
"${userAnswer}"

## 평가 요청

다음 JSON 형식으로 답안을 분석해주세요:

\`\`\`json
{
  "score": "excellent|good|needs_improvement",
  "feedback": "전체적인 피드백 (2-3문장)",
  "strengths": [
    "강점 1",
    "강점 2"
  ],
  "weaknesses": [
    "약점 1",
    "약점 2"
  ],
  "conceptsCovered": ["다룬 경제 개념 1", "다룬 경제 개념 2"],
  "conceptsMissed": ["놓친 경제 개념 1", "놓친 경제 개념 2"],
  "economicTerms": [
    {
      "term": "경제 용어",
      "definition": "용어의 정확한 정의 (50-100자)",
      "context": "학생 답안에서의 사용 맥락",
      "example": "실제 경제 사례"
    }
  ],
  "followUpQuestions": [
    "추가 질문 1 - 학생의 답안을 더 깊게 탐구하는 질문",
    "추가 질문 2 - 놓친 개념을 유도하는 질문",
    "추가 질문 3 - 실제 사례를 적용하는 질문"
  ],
  "detailedFeedback": "상세 피드백 (100-200자) - 학생의 답안에 대한 구체적 분석과 개선 방향"
}
\`\`\`

## 주의사항
1. 학생의 답안을 존중하되, 부족한 부분을 명확히 지적
2. 추가 질문은 학생이 스스로 생각하도록 유도
3. 경제 개념을 명시적으로 언급
4. 실제 경제 사례를 활용한 질문 포함
5. economicTerms 배열에는 답안에서 사용된 모든 경제 용어의 정확한 해설 포함
6. 각 용어의 정의는 정확하고 구체적이어야 함
7. 한국어로 작성`
}

/**
 * 소크라테스식 문답법 퀴즈 UI 컴포넌트용 데이터 타입
 */
export interface SocraticQuizUIState {
  question: SocraticQuestion;
  userAnswer: string;
  isAnalyzing: boolean;
  response: SocraticResponse | null;
  currentFollowUpIndex: number;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

/**
 * 소크라테스식 문답법 적용 가능 여부 확인
 */
export function isSocraticQuizApplicable(difficulty: string): boolean {
  return difficulty === 'advanced_1' || difficulty === 'advanced_2';
}

/**
 * 기사 퀴즈에서 소크라테스식 문제 조회
 */
export function getSocraticQuestionById(questionId: string): SocraticQuestion | undefined {
  return socraticQuizzes.questions.find(q => q.id === questionId);
}

/**
 * 난이도별 소크라테스식 문제 조회
 */
export function getSocraticQuestionsByDifficulty(
  difficulty: 'advanced_1' | 'advanced_2'
): SocraticQuestion[] {
  return socraticQuizzes.questions.filter(q => q.difficulty === difficulty);
}
