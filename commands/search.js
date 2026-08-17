import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getUserReviews } from '../utils/dataStore.js';

export default {
  data: new SlashCommandBuilder()
    .setName('리뷰검색')
    .setDescription('특정 사용자의 리뷰를 검색합니다.')
    .addUserOption(option => 
      option.setName('유저')
        .setDescription('검색할 유저를 선택하세요.')
        .setRequired(true)),
        
  async execute(interaction) {
    const targetUser = interaction.options.getUser('유저');
    const reviews = getUserReviews(targetUser.username);

    if (reviews.length === 0) {
      return interaction.reply({ content: `⚠️ ${targetUser.username} 님의 리뷰를 찾을 수 없습니다.`, ephemeral: true });
    }

    let currentPage = 0;

    const generateEmbed = (page) => {
      const review = reviews[page];
      
      const embedTitle = review.title 
        ? `[${review.category}] ${review.title} - ${review.producer || '미상'}`
        : `[${review.category}] 카테고리`;
        
      return new EmbedBuilder()
        .setColor('#5865F2')
        .setAuthor({ name: `${review.username} 님의 리뷰 (${page + 1}/${reviews.length})`, iconURL: targetUser.displayAvatarURL() })
        .setTitle(embedTitle)
        .setDescription(review.content)
        .addFields(
          { name: '평점', value: `⭐ ${review.rating} / 5`, inline: true }
        )
        .setImage(review.imageUrl)
        .setTimestamp(new Date(review.post_date));
    };

    const generateButtons = (page) => {
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('이전')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('다음')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === reviews.length - 1)
        );
      return row;
    };

    const response = await interaction.reply({
      embeds: [generateEmbed(currentPage)],
      components: reviews.length > 1 ? [generateButtons(currentPage)] : [],
      fetchReply: true
    });

    if (reviews.length > 1) {
      const collector = response.createMessageComponentCollector({ time: 60000 });

      collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({ content: '명령어를 입력한 사람만 버튼을 누를 수 있습니다.', ephemeral: true });
        }

        if (i.customId === 'prev') {
          currentPage--;
        } else if (i.customId === 'next') {
          currentPage++;
        }

        await i.update({
          embeds: [generateEmbed(currentPage)],
          components: [generateButtons(currentPage)]
        });
      });

      collector.on('end', () => {
        response.edit({ components: [] }).catch(() => {});
      });
    }
  },
};
