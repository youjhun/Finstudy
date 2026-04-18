import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { ScreenContainer } from './screen-container';
import { cn } from '@/lib/utils';
import {
  SocraticQuestion,
  SocraticResponse,
  generateSocraticAnalysisPrompt,
} from '@/lib/socratic-quiz-system';
import { generateDynamicSocraticAnalysisPrompt } from '@/lib/dynamic-socratic-question';

export interface SocraticQuizProps {
  question: SocraticQuestion;
  onComplete: (response: SocraticResponse) => void;
  onClose: () => void;
}

export function SocraticQuiz({ question, onComplete, onClose }: SocraticQuizProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [response, setResponse] = useState<SocraticResponse | null>(null);
  const [currentFollowUpIndex, setCurrentFollowUpIndex] = useState(0);

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      alert('답변을 입력해주세요.');
      return;
    }

    setIsAnalyzing(true);
    try {
      // 동적 질문인 경우 동적 프롬프트 생성, 아니면 기존 프롬프트 사용
      const prompt = question.id.startsWith('dynamic_')
        ? generateDynamicSocraticAnalysisPrompt(question, userAnswer)
        : generateSocraticAnalysisPrompt(question, userAnswer);
      
      // Gemini API 호출 (환경변수에서 API 키 사용)
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API 키가 설정되지 않았습니다.');
      }

      // 모델 폴백: gemini-2.5-flash 시도 후 실패하면 gemini-3.0-flash 사용
      const models = ['gemini-2.5-flash', 'gemini-3.0-flash'];
      let apiResponse: Response | null = null;
      let lastError: Error | null = null;

      for (const model of models) {
        try {
          console.log(`Gemini API 호출 시도: ${model}`);
          apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
            }),
          });

          if (!apiResponse.ok) {
            const errorData = await apiResponse.json().catch(() => ({}));
            console.error(`${model} 호출 실패:`, apiResponse.status, errorData);
            lastError = new Error(`${model} 호출 실패: ${apiResponse.status}`);
            continue; // 다음 모델 시도
          }

          const data = await apiResponse.json();
          
          // API 응답 구조 검증 (Gemini API는 candidates 배열 사용)
          if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            console.error(`${model} 응답 구조 오류:`, data);
            lastError = new Error(`${model} 응답 구조가 올바르지 않습니다.`);
            continue; // 다음 모델 시도
          }

          const analysisText = data.candidates[0].content.parts[0].text;
          
          // JSON 파싱
          const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            console.error(`${model} JSON 파싱 실패. 응답 텍스트:`, analysisText);
            lastError = new Error(`${model} 응답 파싱 실패: JSON을 찾을 수 없습니다.`);
            continue; // 다음 모델 시도
          }

          const analysis = JSON.parse(jsonMatch[0]);
          const socraticResponse: SocraticResponse = {
            userAnswer,
            analysis: {
              score: analysis.score,
              feedback: analysis.feedback,
              strengths: analysis.strengths || [],
              weaknesses: analysis.weaknesses || [],
              economicTerms: analysis.economicTerms || [],
              followUpQuestions: analysis.followUpQuestions || [],
              conceptsCovered: analysis.conceptsCovered || [],
              conceptsMissed: analysis.conceptsMissed || [],
            },
          };

          console.log(`${model} 성공`);
          setResponse(socraticResponse);
          onComplete(socraticResponse);
          return; // 성공하면 루프 탈출
        } catch (error) {
          console.error(`${model} 처리 중 오류:`, error);
          lastError = error instanceof Error ? error : new Error(String(error));
          // 다음 모델 시도
        }
      }

      // 모든 모델 실패
      throw lastError || new Error('모든 모델 호출 실패');
    } catch (error) {
      console.error('답안 분석 실패:', error);
      alert('답안 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (response) {
    return (
      <ScreenContainer className="p-4">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="gap-6">
            {/* 점수 */}
            <View className="items-center gap-2">
              <Text className="text-3xl font-bold text-primary">
                {response.analysis.score}/100
              </Text>
              <Text className="text-sm text-muted">점수</Text>
            </View>

            {/* 피드백 */}
            <View className="bg-surface rounded-lg p-4 gap-2">
              <Text className="font-semibold text-foreground">피드백</Text>
              <Text className="text-sm text-foreground leading-relaxed">
                {response.analysis.feedback}
              </Text>
            </View>

            {/* 강점 */}
            {response.analysis.strengths.length > 0 && (
              <View className="gap-2">
                <Text className="font-semibold text-foreground">✓ 강점</Text>
                {response.analysis.strengths.map((strength, i) => (
                  <Text key={i} className="text-sm text-success ml-2">
                    • {strength}
                  </Text>
                ))}
              </View>
            )}

            {/* 약점 */}
            {response.analysis.weaknesses.length > 0 && (
              <View className="gap-2">
                <Text className="font-semibold text-foreground">⚠ 약점</Text>
                {response.analysis.weaknesses.map((weakness, i) => (
                  <Text key={i} className="text-sm text-warning ml-2">
                    • {weakness}
                  </Text>
                ))}
              </View>
            )}

            {/* 경제 용어 */}
            {response.analysis.economicTerms.length > 0 && (
              <View className="gap-2">
                <Text className="font-semibold text-foreground">📚 경제 용어</Text>
                {response.analysis.economicTerms.map((term, i) => (
                  <View key={i} className="bg-blue-50 rounded p-3 gap-1">
                    <Text className="font-semibold text-blue-900">{term.term}</Text>
                    <Text className="text-xs text-blue-700">{term.definition}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* 추가 질문 */}
            {response.analysis.followUpQuestions.length > 0 && (
              <View className="gap-2">
                <Text className="font-semibold text-foreground">💡 추가 질문</Text>
                <Text className="text-sm text-foreground bg-yellow-50 p-3 rounded">
                  {response.analysis.followUpQuestions[currentFollowUpIndex]}
                </Text>
                {response.analysis.followUpQuestions.length > 1 && (
                  <Pressable
                    onPress={() =>
                      setCurrentFollowUpIndex(
                        (currentFollowUpIndex + 1) % response.analysis.followUpQuestions.length
                      )
                    }
                    className="bg-primary p-2 rounded"
                  >
                    <Text className="text-center text-white text-sm">다음 질문</Text>
                  </Pressable>
                )}
              </View>
            )}

            {/* 종료 버튼 */}
            <Pressable
              onPress={onClose}
              className="bg-primary p-3 rounded-lg mt-4"
            >
              <Text className="text-center text-white font-semibold">종료</Text>
            </Pressable>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* 질문 */}
          <View className="gap-2">
            <Text className="text-lg font-bold text-foreground">
              {question.mainQuestion}
            </Text>
            <Text className="text-sm text-muted">{question.context}</Text>
          </View>

          {/* 답변 입력 */}
          <TextInput
            placeholder="답변을 입력하세요..."
            value={userAnswer}
            onChangeText={setUserAnswer}
            multiline
            numberOfLines={6}
            className="border border-border rounded-lg p-3 text-foreground"
            editable={!isAnalyzing}
          />

          {/* 제출 버튼 */}
          <Pressable
            onPress={handleSubmitAnswer}
            disabled={isAnalyzing || !userAnswer.trim()}
            className={cn(
              'p-3 rounded-lg',
              isAnalyzing || !userAnswer.trim() ? 'bg-gray-300' : 'bg-primary'
            )}
          >
            {isAnalyzing ? (
              <View className="flex-row items-center justify-center gap-2">
                <ActivityIndicator color="white" />
                <Text className="text-white font-semibold">분석 중...</Text>
              </View>
            ) : (
              <Text className="text-center text-white font-semibold">답안 제출</Text>
            )}
          </Pressable>

          {/* 닫기 버튼 */}
          <Pressable onPress={onClose} className="p-2">
            <Text className="text-center text-primary text-sm">닫기</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
