const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/(tabs)/index.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Import 추가
const oldImports = `import { ScreenContainer } from '@/components/screen-container';
import { PremiumExplanation } from '@/components/premium-explanation';
import { defaultProgress, lessons, type ArticleLesson, type ProgressState } from '@/lib/finstudy-data';
import { haptic } from '@/lib/haptics';`;

const newImports = `import { ScreenContainer } from '@/components/screen-container';
import { PremiumExplanation } from '@/components/premium-explanation';
import { TermDetailModal } from '@/components/term-detail-modal';
import { AskQuestionModal } from '@/components/ask-question-modal';
import { defaultProgress, lessons, type ArticleLesson, type ProgressState } from '@/lib/finstudy-data';
import { haptic } from '@/lib/haptics';
import { searchTerm, type EconomicTerm } from '@/lib/economic-terms';
import { askQuestionAboutArticle } from '@/lib/gemini-question';
import AsyncStorage from '@react-native-async-storage/async-storage';`;

content = content.replace(oldImports, newImports);

// 2. State 추가
const oldState = `  const [isLoaded, setIsLoaded] = useState(true);
  const [allLessons, setAllLessons] = useState<ArticleLesson[]>(lessons);
  const [isRefreshing, setIsRefreshing] = useState(false);`;

const newState = `  const [isLoaded, setIsLoaded] = useState(true);
  const [allLessons, setAllLessons] = useState<ArticleLesson[]>(lessons);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<EconomicTerm | null>(null);
  const [showTermModal, setShowTermModal] = useState(false);
  const [showAskModal, setShowAskModal] = useState(false);
  const [apiKey, setApiKey] = useState('');`;

content = content.replace(oldState, newState);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Patch applied successfully');
