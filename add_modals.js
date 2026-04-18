const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/(tabs)/index.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 모달 추가
const oldEnd = `      </Modal>
    </ScreenContainer>
  );
}`;

const newEnd = `      </Modal>

      <TermDetailModal
        visible={showTermModal}
        term={selectedTerm}
        onClose={() => setShowTermModal(false)}
      />
      <AskQuestionModal
        visible={showAskModal}
        articleTitle={selectedLesson.title}
        onClose={() => setShowAskModal(false)}
        onSubmit={handleAskQuestion}
      />
    </ScreenContainer>
  );
}`;

content = content.replace(oldEnd, newEnd);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Modals added successfully');
