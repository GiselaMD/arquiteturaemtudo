import React from "react"
import { Link, graphql } from "gatsby"
import PageHeader from "../components/PageHeader"
import Footer from "../components/Footer"
// import Player from "../components/Player"

import SEO from "../components/seo"

export default function Template({ data }) {
  const {
    title,
    description,
    formattedDate,
    episode,
    length,
    path,
    id,
  } = data.markdownRemark.frontmatter
  const { html } = data.markdownRemark

  const episodeInfo = {
    title: title,
    description: description,
  }

  return (
    <div>
      <SEO episodeInfo={episodeInfo} />
      <PageHeader />
      <main>
        {/* <Player
          title={title}
          description={description}
          formattedDate={formattedDate}
          episode={episode}
          length={length}
          path={path}
          isEpisodeHeader={true}
        /> */}
        <iframe
          src={`https://open.spotify.com/embed-podcast/episode/${id}`}
          width="50%"
          height="232"
          frameborder="0"
          allowtransparency="true"
          allow="encrypted-media"
        ></iframe>
        <Link to="/episodes">
          <button className="button button-border">Voltar aos episódios</button>
        </Link>
        <p
          dangerouslySetInnerHTML={{
            __html: html,
          }}
        />
      </main>
      <Footer />
    </div>
  )
}

export const postQuery = graphql`
  query BlogPostByPath($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        path
        title
        formattedDate
        episode
        length
        description
        id
      }
    }
  }
`
