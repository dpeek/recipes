import { withRouter } from "next/router";
import { Component, Fragment } from "react";
import fetch from "isomorphic-unfetch";
import { toFraction } from "../utils/fractions";
import pluralize from "pluralize";

import Layout from "../components/Layout.js";
import TagLink from "../components/TagLink";

const renderTags = tags => tags.map((tag, i) => <TagLink key={i} {...tag} />);

const fractionUnits = ["cup", "teaspoon", "tablespoon"];

const shortUnits = {
  tablespoon: " tbsp",
  teaspoon: " tsp",
  kilogram: "kg",
  gram: "g",
  milliliter: "ml",
  liter: "l",
  cup: " cup"
};

const renderIngredient = (
  key,
  { heading, quantity, unit, ingredient, preparation },
  scale
) => {
  if (heading) return <h3>{heading}</h3>;
  quantity *= scale;
  quantity = Math.round(quantity / 0.01) * 0.01;
  if (!unit) {
    if (
      (ingredient.indexOf("salt") > -1 && ingredient.indexOf("pepper") > -1) ||
      ingredient.indexOf("s and p") > -1
    ) {
      return <div key={key}>{ingredient}</div>;
    }
    return (
      <div key={key}>
        {quantity} {pluralize(ingredient, quantity)} <i>{preparation}</i>
      </div>
    );
  } else {
    if (unit === "gram" && quantity >= 1000) {
      unit = "kilogram";
      quantity /= 1000;
    }
    if (unit === "teaspoon" && quantity >= 3) {
      unit = "tablespoon";
      quantity /= 3;
    }
    if (unit === "tablespoon" && quantity >= 8) {
      unit = "cup";
      quantity /= 16;
    }

    let value = quantity;
    if (fractionUnits.includes(unit)) {
      const whole = Math.floor(quantity);
      const fraction = quantity - whole;
      value =
        (whole > 0 ? whole : "") + (fraction > 0 ? toFraction(fraction) : "");
    }

    if (shortUnits[unit]) unit = shortUnits[unit];
    if (quantity > 1 && unit === " cup") unit = " cups";

    return (
      <div key={key}>
        {value}
        {unit} {ingredient} <i>{preparation}</i>
      </div>
    );
  }
};

class Page extends Component {
  state = {
    scale: 1
  };
  onScale = event => {
    this.setState({ scale: event.target.value });
  };
  render() {
    let {
      title,
      name,
      added,
      tags,
      ingredients,
      parsedIngredients,
      method
    } = this.props;
    const rows = parsedIngredients.map((ingredient, i) =>
      renderIngredient(i, ingredient, this.state.scale)
    );
    return (
      <Layout>
        <div>
          <h1 dangerouslySetInnerHTML={{ __html: title }} />
          <div>
            Added by {name} on {added}
          </div>
          <div>{renderTags(tags)}</div>
          <div>
            <input
              type="number"
              min={0.5}
              value={this.state.scale}
              step={0.5}
              onChange={this.onScale}
            />
          </div>
          <div
            className="ingredients1"
            dangerouslySetInnerHTML={{ __html: ingredients }}
          />
          <div className="ingredients2">{rows}</div>
          <div dangerouslySetInnerHTML={{ __html: method }} />
        </div>
        <style jsx>{`
          .ingredients1 {
            float: left;
            padding-right: 20px;
          }
        `}</style>
      </Layout>
    );
  }
}

Page.getInitialProps = async ({ req, query: { id } }) => {
  const api = process.env.API;
  return await fetch(`${api}/recipes/${id}`).then(res => res.json());
};

export default withRouter(Page);
