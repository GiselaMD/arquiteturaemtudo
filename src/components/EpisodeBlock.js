import React from "react"
import { Link } from "gatsby"
import "./episode.css"

const EpisodeBlock = ({ episodeInfo }) => {
  const {
    title,
    description,
    episode,
    formattedDate,
    path,
    length,
  } = episodeInfo.node.frontmatter
  return (
    <div className="page-flex-vertical banner-margin">
      <div style={{ display: "flex" }}>
        <div>
          <div className="title-wrapper">
            <h2 className="episode-title">{title}</h2>
            <p className="episode-length">{length}</p>
          </div>
          <p className="episode-date">{`${episode} | ${formattedDate}`}</p>
          <p>{description}</p>
        </div>
      </div>
      <Link to={path}>
        <button className="button button-border">Ouvir</button>
      </Link>
    </div>
  )
}

export default EpisodeBlock
