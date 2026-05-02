/**
 * 뉴스 기사 크롤링 유틸리티
 * 주어진 URL에서 기사 제목, 본문, 메타데이터를 추출합니다.
 * 
 * CORS 문제를 피하기 위해 서버 사이드 크롤링을 사용합니다.
 */

export interface CrawledArticle {
  title: string;
  content: string;
  source: string;
  url: string;
  publishedAt?: string;
}

/**
 * 서버 사이드 크롤링 API를 호출합니다
 * 실제 환경에서는 백엔드에서 이 엔드포인트를 구현해야 합니다.
 */
async function callServerCrawlApi(url: string): Promise<CrawledArticle> {
  // 개발 환경에서는 로컬 서버 사용
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${apiUrl}/api/crawl-article`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      `서버 크롤링 실패: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 클라이언트 사이드 폴백 크롤링 (제한된 기능)
 * 서버가 없을 때만 사용됩니다.
 */
async function clientSideCrawl(url: string): Promise<CrawledArticle> {
  try {
    // URL 유효성 검증
    const urlObj = new URL(url);

    // CORS 프록시 사용 (공개 프록시 - 프로덕션에서는 자체 프록시 사용 권장)
    const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

    const response = await fetch(corsProxyUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // 기본적인 HTML 파싱
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '제목 없음';

    // Open Graph 메타데이터 추출
    const ogDescriptionMatch = html.match(
      /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i
    );

    // 본문 추출
    let content = '';

    // article 태그 찾기
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
      content = articleMatch[1];
    } else {
      // main 태그 찾기
      const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
      if (mainMatch) {
        content = mainMatch[1];
      } else {
        // 가장 큰 div 찾기
        const divMatches = html.match(
          /<div[^>]*class=["']([^"']*content[^"']*)["'][^>]*>([\s\S]{500,}?)<\/div>/i
        );
        if (divMatches) {
          content = divMatches[2];
        }
      }
    }

    // HTML 태그 제거
    content = content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // 최대 2000자까지만 추출
    if (content.length > 2000) {
      content = content.substring(0, 2000) + '...';
    }

    // 내용이 너무 짧으면 og:description 사용
    if (content.length < 100 && ogDescriptionMatch) {
      content = ogDescriptionMatch[1];
    }

    // 내용이 여전히 비어있으면 에러
    if (content.length < 50) {
      throw new Error('기사 내용을 추출할 수 없습니다. 다른 URL을 시도해주세요.');
    }

    // 소스 추출
    const source = urlObj.hostname.replace('www.', '');

    return {
      title,
      content,
      source,
      url,
      publishedAt: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(
      `클라이언트 크롤링 실패: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * URL에서 기사 내용을 크롤링합니다
 * 먼저 서버 사이드 크롤링을 시도하고, 실패하면 클라이언트 사이드 폴백을 사용합니다.
 */
export async function crawlArticle(url: string): Promise<CrawledArticle> {
  // URL 유효성 검증
  try {
    new URL(url);
  } catch {
    throw new Error('유효하지 않은 URL입니다. https://로 시작하는 URL을 입력해주세요.');
  }

  // 먼저 서버 사이드 크롤링 시도
  try {
    return await callServerCrawlApi(url);
  } catch (serverError) {
    console.warn('서버 크롤링 실패, 클라이언트 폴백 사용:', serverError);
    
    // 서버가 없으면 클라이언트 사이드 폴백 사용
    try {
      return await clientSideCrawl(url);
    } catch (clientError) {
      // 둘 다 실패하면 더 자세한 에러 메시지 제공
      throw new Error(
        `기사 크롤링 실패: ${clientError instanceof Error ? clientError.message : String(clientError)}\n\n` +
        '💡 팁: 뉴스 사이트의 URL을 입력해주세요 (예: 네이버 뉴스, 다음 뉴스 등)'
      );
    }
  }
}

/**
 * 여러 URL을 동시에 크롤링합니다
 */
export async function crawlMultipleArticles(urls: string[]): Promise<CrawledArticle[]> {
  const results = await Promise.allSettled(urls.map((url) => crawlArticle(url)));

  return results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => (result as PromiseFulfilledResult<CrawledArticle>).value);
}
