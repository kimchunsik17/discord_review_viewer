// 인터넷 검색을 활용한 카테고리 분류 (LLM 없이 단순 크롤링 및 키워드 점수 매기기)
export const categorizeBySearch = async (title, producer) => {
  try {
    const query = encodeURIComponent(`${title} ${producer}`);
    // DuckDuckGo 크롤링은 차단당하기 쉬워, 무료이고 안정적인 위키백과(Wikipedia) API를 사용합니다.
    const res = await fetch(`https://ko.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&utf8=&format=json`, {
      headers: {
        'User-Agent': 'DiscordReviewBot/1.0 (Contact: user@domain.com)'
      }
    });
    
    if (!res.ok) throw new Error(`Search request failed with status: ${res.status}`);
    
    const data = await res.json();
    // 검색 결과 스니펫(요약) 텍스트를 하나로 합침
    const text = data.query.search.map(item => item.snippet).join(' ').toLowerCase();
    
    // API 호출 속도 조절 (rate limit 방지)
    await new Promise(r => setTimeout(r, 300));
    
    // 키워드 빈도수 점수 매기기
    let scores = {
      '음악': 0, '영화': 0, '도서': 0, '음식': 0, '장소': 0
    };
    
    // 🎵 음악 관련 키워드
    const musicMatches = text.match(/(음악|노래|앨범|가수|래퍼|힙합|발매|뮤직|싱글|트랙|곡|pop|song|album|music|레코드|빌보드|아티스트)/g);
    if (musicMatches) scores['음악'] += musicMatches.length;
    
    // 🎬 영화/방송 관련 키워드
    const movieMatches = text.match(/(영화|배우|감독|극장|개봉|시네마|관람객|평점|출연|movie|film|cinema|넷플릭스|드라마|에피소드)/g);
    if (movieMatches) scores['영화'] += movieMatches.length;
    
    // 📚 도서 관련 키워드
    const bookMatches = text.match(/(도서|책|소설|작가|출판|베스트셀러|독서|문학|book|author|novel|에세이|서적|출간)/g);
    if (bookMatches) scores['도서'] += bookMatches.length;
    
    // 최고 점수 카테고리 찾기
    let maxCategory = '기타';
    let maxScore = 0; // 임계값 낮춤 (위키백과 스니펫은 짧아서 키워드가 1~2번만 나와도 인정)

    for (const [cat, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        maxCategory = cat;
      }
    }

    // 만약 전혀 점수가 안 나왔다면, 입력된 텍스트 자체(제목/생산자)에 키워드가 있는지 한번 더 확인
    if (maxCategory === '기타') {
      const fallbackText = query.toLowerCase();
      if (fallbackText.includes('영화') || fallbackText.includes('감독')) return '영화';
      if (fallbackText.includes('음악') || fallbackText.includes('앨범') || fallbackText.includes('노래')) return '음악';
      if (fallbackText.includes('책') || fallbackText.includes('도서')) return '도서';
    }

    return maxCategory;
  } catch (err) {
    console.error('검색 분류 중 오류 발생:', err.message);
    return '기타'; // 검색 실패 시 기본값
  }
};

// Simulated Image Search Fetch (Returns a valid image URL for the Discord Embed)
export const getFallbackImage = (category, seed) => {
  const keywordMap = {
    '영화': 'movie',
    '음악': 'music',
    '도서': 'book',
    '음식': 'food',
    '장소': 'landscape',
    '기타': 'abstract'
  };
  const keyword = keywordMap[category] || 'random';
  const r = seed ? (seed.length % 1000) : Math.floor(Math.random() * 1000);
  
  // Using loremflickr for mock images based on keyword
  return `https://loremflickr.com/600/400/${keyword}?lock=${r}`;
};

// Helper for progress bar generation (for Stats)
export const createProgressBar = (value, total, length = 15) => {
  if (total === 0) return '░'.repeat(length);
  const filled = Math.round((value / total) * length);
  const empty = length - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
};
