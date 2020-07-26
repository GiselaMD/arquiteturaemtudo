import React from "react"
import { Link } from "gatsby"
import Player from "./Player"
import HomeBackground from "./HomeBackground"
import lightLogo from "../images/brand/logo.png"
import "./header.css"

const Header = ({ latestEpisode }) => {
  const {
    title,
    description,
    length,
    formattedDate,
    path,
    episode,
    id,
  } = latestEpisode.node.frontmatter
  return (
    <header className="header header-full">
      <HomeBackground />
      <div className="header-content-wrapper">
        <Link className="home-logo" to="/">
          <img
            className="logo"
            src={lightLogo}
            alt="Arquitetura em tudo Podcast"
          />
        </Link>
        <nav className="nav">
          <Link to="episodes">Episódios</Link>
          <Link to="contact">Contato</Link>
        </nav>
      </div>

      <Player id={id} path={path} />
    </header>
  )
}

export default Header
