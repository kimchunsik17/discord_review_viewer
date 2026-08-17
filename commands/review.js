import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { saveReview } from '../utils/dataStore.js';
import { categorizeBySearch, getFallbackImage } from '../utils/smartHelper.js';

export default {
  data: new SlashCommandBuilder()
    .setName('리뷰남기기')
    .setDescription('새로운 리뷰를 남깁니다.')
    .addStringOption(option =>
      option.setName('내용')
        .setDescription('리뷰 내용을 적어주세요.')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('평점')
        .setDescription('1점에서 5점 사이의 평점을 주세요.')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(5))
    .addAttachmentOption(option =>
      option.setName('이미지')
        .setDescription('리뷰와 관련된 이미지(선택 사항)')
        .setRequired(false)),
        
  async execute(interaction) {
    const content = interaction.options.getString('내용');
    const rating = interaction.options.getInteger('평점');
    const attachment = interaction.options.getAttachment('이미지');

    // Categorization (mocking internet search)
    const category = await categorizeBySearch(content, '');
    
    // Image handling
    let imageUrl = null;
    if (attachment && attachment.contentType?.startsWith('image/')) {
      imageUrl = attachment.url;
    } else {
      // Fetch from internet logic (mocked)
      imageUrl = getFallbackImage(category, content);
    }

    const reviewData = {
      userId: interaction.user.id,
      username: interaction.user.username,
      content,
      rating,
      category,
      imageUrl
    };

    // Save to DB
    const saved = saveReview(reviewData);

    // Create Embed response
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`[${category}] 새로운 리뷰가 등록되었습니다!`)
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setDescription(content)
      .addFields(
        { name: '평점', value: '⭐'.repeat(rating) + '☆'.repeat(5 - rating), inline: true },
        { name: '카테고리', value: category, inline: true }
      )
      .setImage(imageUrl)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
