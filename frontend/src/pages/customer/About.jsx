import { Link } from "react-router-dom";
import "./About.css";

function About() {
  return (
    <main className="about-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="about-hero">

        <div className="container">

          <span className="about-label">
            ABOUT SHOPVERSE
          </span>

          <h1>
            Shopping made
            <br />
            simple.
          </h1>

          <p>
            We believe everyday shopping should feel
            effortless, thoughtful, and enjoyable.
          </p>

        </div>

      </section>

      {/* =================================================
          STORY
      ================================================= */}

      <section className="about-story">

        <div className="container about-story-grid">

          <div>

            <span className="about-label">
              OUR STORY
            </span>

            <h2>
              Better products.
              <br />
              Better choices.
            </h2>

          </div>

          <div className="about-story-text">

            <p>
              ShopVerse was created with one simple idea:
              make online shopping easier and more enjoyable.
            </p>

            <p>
              We bring carefully selected products together
              in one place, making it easier to discover
              useful products for everyday life.
            </p>

            <p>
              From discovering a product to adding it to
              your cart, checking out, and tracking your
              order, every part of ShopVerse is designed
              around a clean and simple shopping experience.
            </p>

          </div>

        </div>

      </section>

      {/* =================================================
          VALUES
      ================================================= */}

      <section className="about-values">

        <div className="container">

          <div className="about-values-heading">

            <span className="about-label">
              WHAT WE VALUE
            </span>

            <h2>
              Designed around
              <br />
              you.
            </h2>

          </div>

          <div className="about-values-grid">

            {/* QUALITY */}

            <div className="about-value-card">

              <span className="about-value-number">
                01
              </span>

              <h3>
                Quality
              </h3>

              <p>
                We focus on products that are useful,
                reliable, and made for everyday life.
              </p>

            </div>

            {/* SIMPLICITY */}

            <div className="about-value-card">

              <span className="about-value-number">
                02
              </span>

              <h3>
                Simplicity
              </h3>

              <p>
                A clean shopping experience makes it
                easier to find exactly what you need.
              </p>

            </div>

            {/* TRUST */}

            <div className="about-value-card">

              <span className="about-value-number">
                03
              </span>

              <h3>
                Trust
              </h3>

              <p>
                We want every step of your shopping
                journey to feel secure and transparent.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          CTA
      ================================================= */}

      <section className="about-cta">

        <div className="container">

          <span className="about-label">
            START EXPLORING
          </span>

          <h2>
            Find something
            <br />
            you'll love.
          </h2>

          <Link
            to="/shop"
            className="about-shop-button"
          >
            Explore Products →
          </Link>

        </div>

      </section>

    </main>
  );
}

export default About;