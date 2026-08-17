import { mockReviews } from './mockData';

// Simulated AI Categorization
export const categorizeText = (text) => {
  const t = text.toLowerCase();
  if (t.includes('영화') || t.includes('배우') || t.includes('감독') || t.includes('극장')) return '영화';
  if (t.includes('노래') || t.includes('음악') || t.includes('신곡') || t.includes('비트')) return '음악';
  if (t.includes('책') || t.includes('도서') || t.includes('소설') || t.includes('작가')) return '도서';
  if (t.includes('맛집') || t.includes('맛') || t.includes('먹') || t.includes('식당')) return '음식';
  if (t.includes('여행') || t.includes('장소') || t.includes('풍경') || t.includes('바다') || t.includes('카페')) return '장소';
  return '기타';
};

// Simulated Image Search Fetch
export const getFallbackImage = (category, seed) => {
  // Using a stable image placeholder service based on category to simulate "fetching from internet"
  const keywordMap = {
    '영화': 'movie',
    '음악': 'music',
    '도서': 'book',
    '음식': 'food',
    '장소': 'landscape',
    '기타': 'abstract'
  };
  const keyword = keywordMap[category] || 'random';
  // generate a reproducible random number based on seed
  const r = Math.floor(Math.random() * 1000);
  return `https://loremflickr.com/600/400/${keyword}?lock=${r}`; 
};

// Helper to format review to Discord Embed
const formatReviewToEmbed = (review) => {
  // If no image_url, simulate internet search to get one based on category
  const actualCategory = review.category || categorizeText(review.content);
  const imageUrl = review.image_url || getFallbackImage(actualCategory, review.id);

  return {
    author: {
      name: `${review.username} 님의 리뷰`,
      icon_url: `https://ui-avatars.com/api/?name=${review.username}&background=random`
    },
    title: `[${actualCategory}] 리뷰`,
    description: review.content,
    fields: [
      { name: '평점', value: '⭐'.repeat(review.rating) + '☆'.repeat(5 - review.rating) },
      { name: '카테고리', value: actualCategory }
    ],
    image: { url: imageUrl },
    footer: { text: new Date(review.post_date).toLocaleString('ko-KR') }
  };
};

// Main Command Processor
export const processCommand = (commandStr) => {
  const args = commandStr.trim().split(' ');
  const cmd = args[0].toLowerCase();
  
  if (cmd === '/search') {
    const targetUser = args[1];
    if (!targetUser) return { content: '❌ 사용자 이름을 입력해주세요. 예) `/search dydeo`' };
    
    const results = mockReviews.filter(r => r.username.toLowerCase() === targetUser.toLowerCase());
    
    if (results.length === 0) {
      return { content: `⚠️ '${targetUser}' 님의 리뷰를 찾을 수 없습니다.` };
    }
    
    return {
      content: `🔍 **${targetUser}** 님의 리뷰를 ${results.length}개 찾았습니다!`,
      embeds: results.map(formatReviewToEmbed)
    };
  }

  if (cmd === '/all') {
    return {
      content: `전체 리뷰 목록입니다. 총 ${mockReviews.length}개`,
      embeds: mockReviews.map(formatReviewToEmbed)
    };
  }
  
  if (cmd === '/stats') {
    const targetUser = args[1];
    if (!targetUser) return { content: '❌ 사용자 이름을 입력해주세요. 예) `/stats dydeo`' };
    
    // Check if user exists in mock
    const hasUser = mockReviews.some(r => r.username.toLowerCase() === targetUser.toLowerCase());
    
    if (!hasUser && targetUser !== 'all') {
      return { content: `⚠️ '${targetUser}' 님의 데이터를 찾을 수 없습니다.` };
    }

    return {
      content: `📊 **${targetUser}** 님의 통계를 불러왔습니다.`,
      statsFor: targetUser
    };
  }

  // Not a recognized command
  return {
    content: "알 수 없는 명령어입니다. `/search`, `/stats`, `/all` 명령어를 사용해보세요."
  };
};
