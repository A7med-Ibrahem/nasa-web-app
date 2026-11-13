/* ==========================================================================
   API content helpers
   --------------------------------------------------------------------------
   Small, deterministic, React-free transforms shared by the challenge,
   sponsor and season-media UI. They never invent values: an empty or malformed
   input produces an empty result, and every string is treated as plain text.
   ========================================================================== */

/** True only for absolute http(s) URLs; javascript:, mailto:, relative paths
 *  and malformed strings are all rejected. */
export function isHttpUrl(value) {
  if (typeof value !== "string") {
    return false;
  }

  const candidate = value.trim();
  if (!candidate) {
    return false;
  }

  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Splits plain text into paragraphs on blank lines. Single newlines inside a
 *  paragraph are preserved and rendered by CSS `white-space: pre-line`. */
export function splitParagraphs(text) {
  if (typeof text !== "string") {
    return [];
  }

  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** A one-line excerpt clipped at a word boundary, with an ellipsis. */
export function toExcerpt(text, maxLength = 160) {
  if (typeof text !== "string") {
    return "";
  }

  const normalised = text.replace(/\s+/g, " ").trim();
  if (normalised.length <= maxLength) {
    return normalised;
  }

  const clipped = normalised.slice(0, maxLength);
  const boundary = clipped.lastIndexOf(" ");
  const withoutPartialWord = boundary > 0 ? clipped.slice(0, boundary) : clipped;

  return `${withoutPartialWord.replace(/[\s,.;:!?]+$/, "")}…`;
}

function textValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function orderRank(value) {
  if (value === null || value === undefined || value === "") {
    return Number.POSITIVE_INFINITY;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : Number.POSITIVE_INFINITY;
}

function compareByOrderThenName(a, b) {
  const orderA = orderRank(a.displayOrder);
  const orderB = orderRank(b.displayOrder);

  if (orderA !== orderB) {
    return orderA < orderB ? -1 : 1;
  }

  return textValue(a.name).localeCompare(textValue(b.name), undefined, {
    sensitivity: "base",
  });
}

/**
 * Groups active sponsors by their tier.
 *
 * - tiers are ordered by `priority` ascending (the contract's direction),
 *   then by name for ties
 * - sponsors inside a tier are ordered by `displayOrder`, then name
 * - sponsors with no nested tier still render, in one unnamed group placed
 *   last, so missing tier metadata can never hide a sponsor
 * - duplicate tier ids are merged into one group
 */
export function groupSponsorsByTier(sponsors) {
  if (!Array.isArray(sponsors)) {
    return [];
  }

  const groups = new Map();

  sponsors.forEach((sponsor) => {
    if (!sponsor || typeof sponsor !== "object" || sponsor.active === false) {
      return;
    }

    const tier =
      sponsor.tier && typeof sponsor.tier === "object" ? sponsor.tier : null;
    const tierId = tier?.tierId ?? sponsor.tierId ?? null;
    const name = textValue(tier?.name);
    const key = tierId === null ? "__no_tier" : `tier:${tierId}`;

    if (!groups.has(key)) {
      groups.set(key, {
        tierId,
        name,
        priority: orderRank(tier?.priority),
        bannerEnabled: tier?.bannerEnabled === true,
        sponsors: [],
      });
    }

    const group = groups.get(key);
    group.sponsors.push(sponsor);

    /* A duplicate tier object may fill in metadata the first one omitted. */
    if (!group.name && name) {
      group.name = name;
    }
    if (group.priority === Number.POSITIVE_INFINITY) {
      group.priority = orderRank(tier?.priority);
    }
    if (!group.bannerEnabled) {
      group.bannerEnabled = tier?.bannerEnabled === true;
    }
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      sponsors: [...group.sponsors].sort(compareByOrderThenName),
    }))
    .sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority < b.priority ? -1 : 1;
      }
      if (!a.name !== !b.name) {
        return a.name ? -1 : 1;
      }
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
}

function seasonYear(season) {
  const match = String(season ?? "").match(/(?:19|20)\d{2}/);
  return match ? Number(match[0]) : null;
}

function compareMedia(a, b) {
  const yearA = seasonYear(a.season);
  const yearB = seasonYear(b.season);

  if (yearA !== null && yearB !== null && yearA !== yearB) {
    return yearB - yearA;
  }
  if (yearA !== null && yearB === null) {
    return -1;
  }
  if (yearA === null && yearB !== null) {
    return 1;
  }

  const seasonA = textValue(a.season);
  const seasonB = textValue(b.season);
  if (seasonA !== seasonB) {
    return seasonB.localeCompare(seasonA, undefined, { sensitivity: "base" });
  }

  const orderA = orderRank(a.displayOrder);
  const orderB = orderRank(b.displayOrder);
  if (orderA !== orderB) {
    return orderA < orderB ? -1 : 1;
  }

  return textValue(a.title).localeCompare(textValue(b.title), undefined, {
    sensitivity: "base",
  });
}

const CORE_TEAM_ROLE_RANKS = new Map([
  ["local lead", 0],
  ["highboard", 1],
  ["developer", 2],
  ["mentor", 3],
  ["media", 4],
  ["marketing", 5],
  ["pr", 6],
  ["organizer", 7],
]);

function coreTeamRoleRank(memberType) {
  const key = textValue(memberType).toLowerCase();
  return CORE_TEAM_ROLE_RANKS.has(key)
    ? CORE_TEAM_ROLE_RANKS.get(key)
    : Number.POSITIVE_INFINITY;
}

/**
 * Normalises the public core-team response without inventing members.
 *
 * Records without a usable name are dropped rather than rendered with
 * placeholder identities; a missing photo or member type simply removes that
 * element. Members are ordered by role priority, then by name.
 */
export function normaliseCoreTeamMembers(members) {
  if (!Array.isArray(members)) {
    return [];
  }

  return members
    .filter((member) => member && typeof member === "object")
    .map((member, index) => ({
      key:
        member.staffId === null || member.staffId === undefined
          ? `member-${index}`
          : `staff-${member.staffId}`,
      staffId: member.staffId ?? null,
      name: textValue(member.fullName ?? member.name),
      memberType: textValue(member.memberType ?? member.role),
      photo: member.photo ?? member.image ?? null,
    }))
    .filter((member) => member.name)
    .sort((a, b) => {
      const rankA = coreTeamRoleRank(a.memberType);
      const rankB = coreTeamRoleRank(b.memberType);

      if (rankA !== rankB) {
        if (rankA === Number.POSITIVE_INFINITY) {
          return 1;
        }
        if (rankB === Number.POSITIVE_INFINITY) {
          return -1;
        }
        return rankA - rankB;
      }

      return a.name.localeCompare(b.name, undefined, {
        sensitivity: "base",
      });
    });
}

/** Orders season media newest season first, then by `displayOrder` ascending. */
export function orderSeasonMedia(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item && typeof item === "object" && item.active !== false)
    .slice()
    .sort(compareMedia);
}
