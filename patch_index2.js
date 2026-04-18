const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/(tabs)/index.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// useEffect 수정
const oldUseEffect = `  useEffect(() => {
    void loadProgress();
    void loadLessons();
  }, []);`;

const newUseEffect = `  useEffect(() => {
    void loadProgress();
    void loadLessons();
    void loadApiKey();
  }, []);

  async function loadApiKey() {
    try {
      const key = await AsyncStorage.getItem('gemini-api-key');
      if (key) setApiKey(key);
    } catch (err) {
      console.error('Failed to load API key:', err);
    }
  }

  function handleTermPress(term: string) {
    const economicTerm = searchTerm(term);
    if (economicTerm) {
      setSelectedTerm(economicTerm);
      setShowTermModal(true);
    }
  }

  async function handleAskQuestion(question: string): Promise<string> {
    if (!apiKey) {
      throw new Error('API 키가 설정되지 않았습니다.');
    }
    return askQuestionAboutArticle(
      question,
      selectedLesson.title,
      selectedLesson.summary,
      apiKey
    );
  }`;

content = content.replace(oldUseEffect, newUseEffect);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Functions added successfully');
