import React from "react"
import { Link } from "gatsby"
import logo from "../images/brand/logo_dark.png"
import "./header.css"

const Header = () => (
  <header className="header page-header">
    <div className="header-content-wrapper">
      <Link to="/">
        <img className="logo" src={logo} alt="Ladybug Podcast" />
      </Link>
      <nav className="nav">
        <Link to="episodes" activeStyle={{ borderBottom: "2px solid #291464" }}>
          Episódios
        </Link>
        <Link to="contact" activeStyle={{ borderBottom: "2px solid #291464" }}>
          Contato
        </Link>
      </nav>
    </div>
  </header>
)

export default Header
