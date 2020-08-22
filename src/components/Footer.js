import React from "react"
import { Link } from "gatsby"
import spotify from "../images/footer/spotify.svg"
import soundcloud from "../images/footer/soundcloud.svg"
import itunes from "../images/footer/itunes.svg"
import "./footer.css"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <section className="footer-find-episodes">
        <p>
          <span role="img" aria-label="Headphones">
            🎧{" "}
          </span>
          Escute o podcast onde preferir!{" "}
          <span role="img" aria-label="Headphones">
            🎧
          </span>
        </p>
        <address className="footer-icons">
          <a
            href="https://open.spotify.com/show/4EJKFhKayQp6Bv6ERxvbmz?si=XiKVwCKPTrOyRvUM8H99Jw"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={spotify} alt="Spotify" />
          </a>
          <a
            href="https://podcasts.apple.com/br/podcast/arquitetura-em-tudo/id1478816922"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={itunes} alt="Apple Podcasts" />
          </a>
          <a
            href="https://soundcloud.com/arquitetura-em-tudo"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={soundcloud} alt="SoundCloud" />
          </a>
        </address>
      </section>
      <div className="footer-links">
        <Link to="/contact">Nos Patrocine</Link>
        <a
          href="https://forms.gle/TfoYqTJC8TN5rJQRA"
          target="_blank"
          rel="noopener noreferrer"
        >
          Indique um convidado
        </a>
        <a
          href="https://forms.gle/uR7K3i7YpRrnYeZU8"
          target="_blank"
          rel="noopener noreferrer"
        >
          Peça um episódio
        </a>
      </div>
      <p className="footer-copyright">
        {`© Arquitetura em Tudo Podcast ${currentYear}. Produzido por`}{" "}
        <a href="http://giselamirandadifini.com/" target="_blank">
          Gisela Miranda Difini.
        </a>
      </p>
    </footer>
  )
}

export default Footer
