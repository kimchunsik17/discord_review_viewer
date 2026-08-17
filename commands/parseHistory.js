import { SlashCommandBuilder } from 'discord.js';
import { saveReview, getUserReviews } from '../utils/dataStore.js';
import { categorizeBySearch, getFallbackImage } from '../utils/smartHelper.js';

export default {
  data: new SlashCommandBuilder()
    .setName('기록불러오기')
    .setDescription('현재 채널의 모든 과거 채팅 기록을 100개씩 순차적으로 끝까지 조회해 파싱합니다.'),
        
  async execute(interaction) {
    // 디스코드 API 응답 지연 방지
    await interaction.deferReply();
    
    try {
      // 1. 메시지 가져오기 (100개씩 순차적으로 전체 채널 히스토리 조회)
      const channel = interaction.channel;
      const batchSize = 100;
      let lastId = null;
      let fetchedAll = false;
      let parsedCount = 0;
      let duplicateCount = 0;
      let errorCount = 0;

      // 정규식 패턴: [제목 - 생산자] 평점/5
      // 예: [LOVE ALL SERVE ALL - Fujii Kaze] 4/5
      const reviewRegex = /\[(.*?)\s*-\s*(.*?)\]\s*([0-9.]+)\/5/i;

      while (!fetchedAll) {
        const fetchOptions = { limit: batchSize };
        if (lastId) fetchOptions.before = lastId;
        const batch = await channel.messages.fetch(fetchOptions);
        if (batch.size === 0) {
          fetchedAll = true;
          break;
        }
        // Process each message in the batch
        for (const [id, msg] of batch) {
          // 봇 메시지 무시
          if (msg.author.bot) continue;

          const match = msg.content.match(reviewRegex);
          if (match) {
            const title = match[1].trim();
            const producer = match[2].trim();
            const rating = parseFloat(match[3]);
            const lines = msg.content.split('\\n');
            const contentStr = lines.filter(line => !line.match(reviewRegex)).join('\\n').trim();
            const existingReviews = getUserReviews(msg.author.username);
            const isDuplicate = existingReviews.some(r => r.content === contentStr && r.title === title);
            if (isDuplicate) {
              duplicateCount++;
            } else {
              const category = await categorizeBySearch(title, producer);
              let imageUrl = null;
              const attachment = msg.attachments.first();
              if (attachment && attachment.contentType?.startsWith('image/')) {
                imageUrl = attachment.url;
              } else {
                imageUrl = getFallbackImage(category, title);
              }
              const reviewData = {
                userId: msg.author.id,
                username: msg.author.username,
                title,
                producer,
                content: contentStr || "내용 없음",
                rating,
                category,
                imageUrl,
                post_date: msg.createdAt.toISOString()
              };
              saveReview(reviewData);
              parsedCount++;
            }
          }
        }
        // Prepare for next batch
        lastId = batch.last().id;
      }

      // 전체 처리 결과 보고 (총 탐색된 메시지 수는 알 수 없으나, 저장된 리뷰와 중복 수를 반환)
      await interaction.editReply(`✅ 과거 메시지 파싱 완료!\n- **${parsedCount}**개의 리뷰 DB 저장\n- **${duplicateCount}**개의 중복 리뷰 제외`);
    } catch (error) {
      console.error(error);
      await interaction.editReply('과거 메시지를 파싱하는 도중 오류가 발생했습니다. 봇의 권한을 확인해주세요.');
    }
  },
};
