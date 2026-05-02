import { ScrollView, Text, View, Pressable, Modal } from 'react-native';
import { useState, useMemo } from 'react';
import { ScreenContainer } from './screen-container';

export interface OnboardingResult {
  level: 'LEVEL 1' | 'LEVEL 2' | 'LEVEL 3';
  score: number;
  interests: string[];
}

export interface OnboardingQuizProps {
  visible: boolean;
  onComplete: (result: OnboardingResult) => void;
}

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: '어떤 선택으로 인해 포기하게 된 다른 기회들 중 가장 큰 가치를 뜻하는 말은?',
    category: '경제 개념 인지',
    choices: ['매몰비용', '기회비용', '가성비', '한계효용'],
    answer: 1,
    level: 1,
  },
  {
    id: 2,
    question: '물가가 지속적으로 상승하여 화폐 가치가 떨어지는 현상을 무엇이라 하나요?',
    category: '경제 개념 인지',
    choices: ['디플레이션', '스태그플레이션', '인플레이션', '리플레이션'],
    answer: 2,
    level: 1,
  },
  {
    id: 3,
    question:
      "한국은행이 '기준금리 인상'을 결정했을 때, 시장에서 일어날 변화로 적절하지 않은 것은?",
    category: '뉴스 문해력',
    choices: [
      '은행 대출 이자가 오른다.',
      '시중의 자금 유동성이 줄어든다.',
      '예금 금리가 낮아진다.',
      '물가 상승 압력이 완화될 수 있다.',
    ],
    answer: 2,
    level: 2,
  },
  {
    id: 4,
    question: "기사에서 'GDP 성장률이 예상보다 낮았다'는 문구를 봤을 때, 이는 무엇을 의미하나요?",
    category: '뉴스 문해력',
    choices: [
      '국가의 총 인구가 줄어들었다.',
      '국가 전체의 생산 활동 규모가 기대만큼 커지지 않았다.',
      '개인의 소득 격차가 줄어들었다.',
      '수출보다 수입이 많아졌다.',
    ],
    answer: 1,
    level: 2,
  },
  {
    id: 5,
    question: '대출 금리를 결정할 때, 기준금리에 개인의 신용도 등에 따라 덧붙이는 금리를 무엇이라 하나요?',
    category: '심화 금융 상식',
    choices: ['실효금리', '변동금리', '가산금리(Spread)', '고정금리'],
    answer: 2,
    level: 3,
  },
  {
    id: 6,
    question: "부동산 뉴스에서 나오는 'LTV'라는 용어는 무엇과 관련이 있나요?",
    category: '심화 금융 상식',
    choices: [
      '세금 납부 비율',
      '집값 대비 대출 가능 한도',
      '주택 청약 당첨 확률',
      '전세 자금 보호 한도',
    ],
    answer: 1,
    level: 3,
  },
];

const INTERESTS = ['주식/투자', '부동산/청약', '거시경제(금리, 물가)', '트렌드/소비', '세금/재테크 기초'];

export function OnboardingQuiz({ visible, onComplete }: OnboardingQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showInterestSelection, setShowInterestSelection] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === QUIZ_QUESTIONS.length - 1;

  const progress = useMemo(() => {
    return Math.round(((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100);
  }, [currentQuestionIndex]);

  const score = useMemo(() => {
    return answers.filter((answer, idx) => answer === QUIZ_QUESTIONS[idx].answer).length;
  }, [answers]);

  const level = useMemo(() => {
    if (score <= 1) return 'LEVEL 1';
    if (score <= 4) return 'LEVEL 2';
    return 'LEVEL 3';
  }, [score]);

  const handleAnswer = (choiceIndex: number) => {
    const newAnswers = [...answers, choiceIndex];
    setAnswers(newAnswers);

    if (isLastQuestion) {
      setShowInterestSelection(true);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else if (selectedInterests.length < 2) {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleComplete = () => {
    onComplete({
      level: level as 'LEVEL 1' | 'LEVEL 2' | 'LEVEL 3',
      score,
      interests: selectedInterests,
    });
  };

  if (!visible) return null;

  if (showInterestSelection) {
    return (
      <Modal visible={true} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <ScreenContainer className="justify-center px-6">
            <View className="bg-white rounded-3xl p-8">
              {/* 결과 배지 */}
              <View className="items-center mb-8">
                <View className="w-24 h-24 rounded-full bg-primary items-center justify-center mb-4">
                  <Text className="text-4xl">
                    {level === 'LEVEL 1' ? '🌱' : level === 'LEVEL 2' ? '📈' : '🚀'}
                  </Text>
                </View>
                <Text className="text-3xl font-bold text-foreground mb-2">
                  당신은 '{level}' 경제 브레인입니다!
                </Text>
                <Text className="text-lg text-primary font-bold mb-4">{score}/6 정답</Text>
                <Text className="text-sm text-muted text-center">
                  {level === 'LEVEL 1'
                    ? '기초 경제 개념부터 시작해보세요!'
                    : level === 'LEVEL 2'
                      ? '거시경제 흐름을 잘 이해하고 있습니다!'
                      : '상위 15% 경제 전문가 수준입니다!'}
                </Text>
              </View>

              {/* 관심사 선택 */}
              <View className="mb-8">
                <Text className="text-lg font-bold text-foreground mb-4">
                  가장 관심 있는 경제 분야는? (최대 2개)
                </Text>
                <View className="gap-3">
                  {INTERESTS.map((interest) => (
                    <Pressable
                      key={interest}
                      onPress={() => handleInterestToggle(interest)}
                      style={({ pressed }) => [
                        {
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: selectedInterests.includes(interest) ? '#0a7ea4' : '#E5E7EB',
                          backgroundColor: selectedInterests.includes(interest) ? '#E3F2FD' : '#FFFFFF',
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <View className="flex-row items-center gap-3">
                        <Text className="text-lg">
                          {selectedInterests.includes(interest) ? '✓' : '○'}
                        </Text>
                        <Text
                          className={`text-sm font-semibold ${
                            selectedInterests.includes(interest) ? 'text-primary' : 'text-foreground'
                          }`}
                        >
                          {interest}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* 완료 버튼 */}
              <Pressable
                onPress={handleComplete}
                style={({ pressed }) => [
                  {
                    backgroundColor: '#0a7ea4',
                    paddingVertical: 14,
                    borderRadius: 12,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text className="text-center text-base font-bold text-white">
                  시작하기 (첫 포인트 +100)
                </Text>
              </Pressable>
            </View>
          </ScreenContainer>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={true} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <ScreenContainer className="justify-center px-6">
          <View className="bg-white rounded-3xl p-8">
            {/* 진행률 */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs font-semibold text-muted">
                  {currentQuestionIndex + 1}/{QUIZ_QUESTIONS.length}
                </Text>
                <Text className="text-xs font-semibold text-primary">{progress}% 완료</Text>
              </View>
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View
                  style={{ width: `${progress}%` }}
                  className="h-full bg-primary rounded-full"
                />
              </View>
            </View>

            {/* 카테고리 */}
            <View className="flex-row items-center gap-2 mb-4">
              <View className="w-1 h-1 rounded-full bg-primary" />
              <Text className="text-xs font-bold text-primary uppercase tracking-wide">{currentQuestion.category}</Text>
            </View>

            {/* 질문 */}
            <Text className="text-2xl font-bold text-black mb-8 leading-8">
              {currentQuestion.question}
            </Text>

            {/* 선택지 */}
            <View className="gap-4">
              {currentQuestion.choices.map((choice, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleAnswer(index)}
                  style={({ pressed }) => [
                    {
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      borderRadius: 14,
                      borderWidth: 2,
                      borderColor: '#0a7ea4',
                      backgroundColor: '#F0F9FF',
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text className="text-base text-black font-semibold">
                    <Text className="font-bold text-primary text-lg">
                      {String.fromCharCode(65 + index)}.{' '}
                    </Text>
                    {choice}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* 안내 문구 */}
            <Text className="text-sm text-black text-center mt-8 font-medium">
              ⏱️ 30초면 수준 파악 끝! 계속 진행해주세요.
            </Text>
          </View>
        </ScreenContainer>
      </View>
    </Modal>
  );
}
