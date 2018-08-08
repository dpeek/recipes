import { withRouter } from "next/router";
import { Component } from "react";
import fetch from "isomorphic-unfetch";

import Layout from "../components/Layout.js";
import TagLink from "../components/TagLink";

const renderTags = tags => tags.map((tag, i) => <TagLink key={i} {...tag} />);

const Page = ({ title, name, added, tags, ingredients, method }) => {
  return (
    <Layout>
      <div>
        <h1 dangerouslySetInnerHTML={{ __html: title }} />
        <div>
          Added by {name} on {added}
        </div>
        <div>{renderTags(tags)}</div>
        <div dangerouslySetInnerHTML={{ __html: ingredients }} />
        <div dangerouslySetInnerHTML={{ __html: method }} />
      </div>
    </Layout>
  );
};

Page.getInitialProps = async ({ req, query: { id } }) => {
  const api = process.env.API;
  return await fetch(`${api}/recipes/${id}`).then(res => res.json());
};

export default withRouter(Page);
