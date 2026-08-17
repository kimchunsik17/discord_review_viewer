import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUserReviews } from '../utils/dataStore.js';
import { createProgressBar } from '../utils/smartHelper.js';

export default {
  data: new SlashCommandBuilder()
    .setName('통계')
    .setDescription('특정 사용자의 리뷰 통계를 확인합니다.')
    .addUserOption(option => 
      option.setName('유저')
        .setDescription('통계를 확인할 유저를 선택하세요.')
        .setRequired(true)),
        
  async execute(interaction) {
    const targetUser = interaction.options.getUser('유저');
    const reviews = getUserReviews(targetUser.username);

    if (reviews.length === 0) {
      return interaction.reply({ content: `⚠️ ${targetUser.username} 님의 리뷰 데이터가 없어 통계를 낼 수 없습니다.`, ephemeral: true });
    }

    // Calculate Average Rating
    const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avgRating = (totalRating / reviews.length).toFixed(1);

    // Calculate Category Distribution
    const categoryCounts = {};
    reviews.forEach(r => {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    });

    const totalReviews = reviews.length;
    let categoryStatsStr = '';
    
    // Sort categories by count descending
    const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

    for (const [category, count] of sortedCategories) {
      const percentage = Math.round((count / totalReviews) * 100);
      const progressBar = createProgressBar(count, totalReviews);
      categoryStatsStr += `**${category}** (${count}개, ${percentage}%)\n${progressBar}\n\n`;
    }

    const embed = new EmbedBuilder()
      .setColor('#EB459E')
      .setTitle(`📊 ${targetUser.username} 님의 리뷰 통계 대시보드`)
      .setThumbnail(targetUser.displayAvatarURL())
      .addFields(
        { name: '총 작성 리뷰 수', value: `${totalReviews}개`, inline: true },
        { name: '평균 평점', value: `⭐ ${avgRating} / 5.0`, inline: true },
        { name: '카테고리 분포', value: categoryStatsStr || '데이터 없음' }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
