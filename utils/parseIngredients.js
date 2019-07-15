const { parse } = require("recipe-ingredient-parser");
const { toFraction, replaceEntities } = require("./fractions");

const parseLines = html =>
  html
    .split(/<br ?\/?>/)
    .map(replaceEntities)
    .map(line => line.toLowerCase().trim())
    .filter(line => line.length > 0);

let prepWords = [
  "or",
  "melted",
  "chopped",
  "sliced",
  "roughly",
  "finely",
  "grated"
];

let removePattern = /\b(pkt|1 x|med to large|or more of|rounded) /g;
let headingPattern = /<strong>(.+?):? *<\/strong>/;
let instructionStart = /(grated|melted|chopped|sliced|roughly|finely|to garnish|,)/;
let commentPattern = / ?\((.+?)\) ?/;

const parseIngredients = lines =>
  lines.map(line => {
    const heading = line.match(headingPattern);
    if (heading) {
      return { heading: heading[1].toUpperCase() };
    }
    line = line.replace(removePattern, "");
    let { quantity, unit, ingredient } = parse(line);
    quantity = parseFloat(quantity || "1");
    if (ingredient.indexOf("of ") === 0) ingredient = ingredient.substr(3);
    if (unit === "pinch") {
      quantity = 0.125;
      unit = "teaspoon";
    }
    let instructions = [];
    // comment preparation: [ingredient] (optional)
    let comment = ingredient.match(commentPattern);
    if (comment) {
      ingredient = ingredient.replace(commentPattern, "");
      instructions.push(comment[1]);
    }
    // prefixed preparation: finely chopped [ingredient]
    const prefix = [];
    const words = ingredient.split(" ");
    while (true) {
      if (prepWords.includes(words[0])) {
        prefix.push(words.shift());
      } else {
        break;
      }
    }
    ingredient = words.join(" ");
    if (prefix.length > 0) instructions.push(prefix.join(" "));
    // postfixed preparation: [ingredient] finely chopped
    const instruction = ingredient.match(instructionStart);
    if (instruction && instruction.index > 0) {
      let preparation = ingredient.substr(instruction.index);
      if (preparation.indexOf(", ") === 0) preparation = preparation.substr(2);
      preparation = preparation.trim();
      ingredient = ingredient.substr(0, instruction.index);
      instructions.push(preparation);
    }

    return {
      quantity,
      unit,
      ingredient: ingredient.trim(),
      preparation: instructions.join(", ")
    };
  });

module.exports = ingredients => parseIngredients(parseLines(ingredients));
