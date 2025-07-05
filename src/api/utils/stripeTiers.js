// src/api/utils/stripeTiers.js

// Real Stripe Product and Price IDs for monthly recurring donations
const TIER_AMOUNTS = {
  bronze: 10,
  silver: 50,
  gold: 100,
};

const TIER_PRICE_IDS = {
  bronze: {
    recurring: 'price_1RgLW64fOj8QAYWzMvg1LNIF', // Bronze monthly
  },
  silver: {
    recurring: 'price_1RgLVP4fOj8QAYWzSuJrCz2G', // Silver monthly
  },
  gold: {
    recurring: 'price_1RgLVR4fOj8QAYWzm701XJrO', // Gold monthly
  },
};

function getTierAmount(tier) {
  return TIER_AMOUNTS[tier] || null;
}

function getTierPriceId(tier, recurring) {
  if (!tier) return null;
  if (recurring) return TIER_PRICE_IDS[tier]?.recurring || null;
  return null; // Only recurring tiers supported for now
}

module.exports = {
  getTierAmount,
  getTierPriceId,
}; 