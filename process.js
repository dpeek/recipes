const fetch = require("isomorphic-unfetch");
const { parse } = require("recipe-ingredient-parser");
const pluralize = require("pluralize");
const convert = require("convert-units");

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

const toFraction = input =>
  fractions.find(({ value, character }) => value >= input).character;

const entities = {};
fractions.forEach(
  ({ numerator, denominator, character }) =>
    (entities["frac" + numerator + denominator] = character)
);

const entity = /&(\w+);/g;
const replaceEntities = string =>
  string.replace(entity, (match, name) => entities[name]);

const parseLines = html =>
  html
    .split(/<br ?\/?>/)
    .map(replaceEntities)
    .map(line => line.toLowerCase().trim())
    .filter(line => line.length > 0);

const parseIngredients = lines =>
  lines.map(line => {
    let { quantity, unit, ingredient } = parse(line);
    quantity = parseFloat(quantity || "1");
    if (ingredient.indexOf("of ") === 0) ingredient = ingredient.substr(3);
    if (unit === "pinch") {
      quantity = 0.125;
      unit = "teaspoon";
    }
    return { quantity, unit, ingredient };
  });

const printIngredients = (ingredients, scale) =>
  ingredients.map(({ quantity, unit, ingredient }) => {
    quantity *= scale;
    if (!unit) {
      return quantity + " " + pluralize(ingredient, quantity);
    } else {
      if (unit === "teaspoon" && quantity >= 3) {
        unit = "tablespoon";
        quantity /= 3;
      }
      if (unit === "tablespoon" && quantity >= 4) {
        unit = "cup";
        quantity /= 16;
      }
      const whole = Math.floor(quantity);
      const fraction = quantity - whole;
      if (quantity > 1) unit = pluralize(unit);
      const value =
        (whole > 0 ? whole : "") + (fraction > 0 ? toFraction(fraction) : "");
      return value + " " + unit + " of " + ingredient;
    }
  });

(async () => {
  const api = "http://recipes.peek.ws/api";
  const id = 910; // waffles
  // const id = 908;
  const recipe = await fetch(`${api}/recipes/${id}`).then(res => res.json());
  const lines = parseLines(recipe.ingredients);
  console.log(lines);
  console.log("--------");
  const ingredients = parseIngredients(lines);
  console.log(ingredients);
  console.log("--------");
  const output = printIngredients(ingredients, 2);
  console.log(output);
})();
