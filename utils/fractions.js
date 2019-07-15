const fractions = [
  {
    numerator: 1,
    denominator: 8,
    character: "⅛"
  },
  {
    numerator: 1,
    denominator: 4,
    character: "¼"
  },
  {
    numerator: 1,
    denominator: 3,
    character: "⅓"
  },
  {
    numerator: 2,
    denominator: 3,
    character: "⅔"
  },
  {
    numerator: 3,
    denominator: 4,
    character: "¾"
  },
  {
    numerator: 1,
    denominator: 2,
    character: "½"
  },
  {
    numerator: 1,
    denominator: 6,
    character: "⅙"
  }
]
  .map(fraction => ({
    ...fraction,
    value: fraction.numerator / fraction.denominator
  }))
  .sort((a, b) => a.value - b.value);

const toFraction = input => {
  let minDelta = 1;
  let match = "";
  fractions.forEach(({ value, character }) => {
    const delta = Math.abs(value - input);
    if (delta < minDelta) {
      minDelta = delta;
      match = character;
    }
  });
  return match;
};

const entities = {};
fractions.forEach(
  ({ numerator, denominator, character }) =>
    (entities["frac" + numerator + denominator] = character)
);

const entity = /&(\w+);/g;
const replaceEntities = string =>
  string.replace(entity, (match, name) => entities[name]);

module.exports = {
  replaceEntities,
  toFraction
};
