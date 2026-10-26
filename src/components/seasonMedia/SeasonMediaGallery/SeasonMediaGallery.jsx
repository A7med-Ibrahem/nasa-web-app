import { useState } from "react";
import "./SeasonMediaGallery.css";

import { CalendarIcon, ExternalLinkIcon } from "../../common/Icons/Icons";
import { isHttpUrl, splitParagraphs } from "../../../utils/apiContent";
import { toImageSrc } from "../../../utils/image";

/**
 * One season-media card.
 *
 * Only API fields are rendered: image, title, description, season, optional
 * mediaType and link. The link becomes a button only when it is an absolute
 * http(s) URL; every other value is ignored rather than turned into an unsafe
 * anchor. No media is embedded — every record is shown as an image card.
 */
function MediaCard({ item, linkLabel, newTabHint }) {
  const { mediaId, title, description, season, image, link, mediaType } = item;
  const [imageFailed, setImageFailed] = useState(false);

  const imageSrc = toImageSrc(image);
  const paragraphs = splitParagraphs(description);
  const safeLink = isHttpUrl(link) ? link.trim() : null;
  const headingId = mediaId ? `event-title-${mediaId}` : undefined;

  return (
    <li className="event-media" data-reveal-item>
      <article className="event-card" aria-labelledby={headingId}>
        <div className="event-media-frame">
          {imageSrc && !imageFailed ? (
            <img
              className="event-image"
              src={imageSrc}
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="event-media-placeholder" aria-hidden="true">
              <CalendarIcon size={34} />
            </div>
          )}

          {season ? <span className="event-year-badge">{season}</span> : null}
        </div>

        <div className="event-body">
          {mediaType ? <p className="event-type">{mediaType}</p> : null}

          {title ? (
            <h3 className="event-title" id={headingId}>
              {title}
            </h3>
          ) : null}

          {paragraphs.length > 0 ? (
            <div className="event-description">
              {paragraphs.map((paragraph, index) => (
                <p key={`event-description-${index}`}>{paragraph}</p>
              ))}
            </div>
          ) : null}

          {safeLink ? (
            <a
              className="btn btn--ghost-light event-link"
              href={safeLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {linkLabel}
              <ExternalLinkIcon size={16} />
              {newTabHint ? (
                <span className="visually-hidden">{newTabHint}</span>
              ) : null}
            </a>
          ) : null}
        </div>
      </article>
    </li>
  );
}

/**
 * Season-media cards, in the order supplied by the page.
 *
 * Presentational and shared by the homepage Previous Events band and the full
 * Season Media page. The page owns ordering, grouping and the link copy.
 */
export default function SeasonMediaGallery({
  items,
  linkLabel,
  newTabHint,
  className = "",
}) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const classes = ["season-media-gallery", className].filter(Boolean).join(" ");

  return (
    <ul className={classes}>
      {items.map((item, index) => (
        <MediaCard
          key={item.mediaId ?? `event-${index}`}
          item={item}
          linkLabel={linkLabel}
          newTabHint={newTabHint}
        />
      ))}
    </ul>
  );
}
