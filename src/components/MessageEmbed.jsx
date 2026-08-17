import React from 'react';

const MessageEmbed = ({ embed }) => {
  if (!embed) return null;

  return (
    <div className="embed">
      {/* Author Line */}
      <div className="embed-author">
        {embed.author?.icon_url && <img src={embed.author.icon_url} alt="author icon" />}
        <span>{embed.author?.name || 'Review'}</span>
      </div>

      {/* Title */}
      {embed.title && <div className="embed-title">{embed.title}</div>}

      {/* Description (Review text) */}
      {embed.description && <div className="embed-description">{embed.description}</div>}

      {/* Fields (Rating, Category) */}
      {embed.fields && embed.fields.length > 0 && (
        <div className="embed-fields">
          {embed.fields.map((field, idx) => (
            <div key={idx} className="embed-field">
              <span className="embed-field-name">{field.name}</span>
              <span className="embed-field-value">{field.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Image */}
      {embed.image?.url && (
        <img className="embed-image" src={embed.image.url} alt="Review attachment" />
      )}

      {/* Footer (Date) */}
      {embed.footer && (
        <div className="embed-footer">
          {embed.footer.text}
        </div>
      )}
    </div>
  );
};

export default MessageEmbed;
