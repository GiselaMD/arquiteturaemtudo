import React from "react"
import SEO from "../components/seo"
import PageHeader from "../components/PageHeader"
import Footer from "../components/Footer"
import "./pages.css"

const ContactPage = () => (
  <div className="page">
    <SEO title="Arquitetura em Tudo Podcast" />
    <PageHeader />

    <main>
      <div className="page-banner">
        <h1>Contato</h1>
      </div>
      <h2>Entre em contato!</h2>
      <p>
        Fique a vontade para nos enviar um feedback ou para tirar quaisquer
        dúvidas! Mande um e-mail para{" "}
        <a href="mailto:arquiteturaemtudo.podcast@gmail.com">
          arquiteturaemtudo.podcast@gmail.com
        </a>
      </p>
    </main>
    <Footer />
  </div>
)

export default ContactPage
