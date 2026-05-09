// this is UPDATED FILE 

import React, { useEffect } from "react";
import "./styles/general.css";
import "./styles/style.css";
import "./styles/landing-fix.css";
import "./styles/queries.css";
// import OrderTracking from "./pages/OrderTracking";


export default function App() {
  useEffect(() => {
    // ------------------------------
    // MOBILE NAVIGATION TOGGLE
    // ------------------------------
    const btnNav = document.querySelector(".btn-mobile-nav");
    const header = document.querySelector(".header");

    const toggleNav = () => {
      header.classList.toggle("nav-open");
    };

    btnNav?.addEventListener("click", toggleNav);

    // ------------------------------
    // SMOOTH SCROLLING
    // ------------------------------
    const allLinks = document.querySelectorAll("a:link");

    const handleSmoothScroll = (e) => {
      const href = e.target.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      e.preventDefault();

      if (href === "#") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const sectionEl = document.querySelector(href);
        sectionEl?.scrollIntoView({ behavior: "smooth" });
      }

      if (e.target.classList.contains("main-nav-link")) {
        header.classList.remove("nav-open");
      }
    };

    allLinks.forEach((link) =>
      link.addEventListener("click", handleSmoothScroll)
    );

    return () => {
      btnNav?.removeEventListener("click", toggleNav);
      allLinks.forEach((link) =>
        link.removeEventListener("click", handleSmoothScroll)
      );
    };
  }, []);

  // ---------------------------------------------------
  //  ⭐⭐ JSX WRAPPED PROPERLY INSIDE cravvio-wrapper ⭐⭐
  // ---------------------------------------------------

  return (
    <div className="cravvio-wrapper">
      {/* HEADER */}
      <header className="header">
        <h1 className="cravvio_heading">Cravvio</h1>

        <nav className="main-nav">
          <ul className="main-nav-list">
            <li>
              <a className="main-nav-link" href="#how">
                How it works
              </a>
            </li>
            <li>
              <a className="main-nav-link" href="#meals">
                Meals
              </a>
            </li>
            <li>
              <a className="main-nav-link" href="#testimonials">
                Testimonials
              </a>
            </li>
            <li>
              <a className="main-nav-link" href="#pricing">
                Pricing
              </a>
            </li>
            <li>
              <a className="main-nav-link nav-cta" href="/login">
                Try for free
              </a>
            </li>
          </ul>
        </nav>

        <button className="btn-mobile-nav">
          <ion-icon class="icon-mobile-nav" name="menu-outline"></ion-icon>
          <ion-icon class="icon-mobile-nav" name="close-outline"></ion-icon>
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main>
        {/* HERO SECTION */}
        <section className="section-hero">
          <div className="hero">
            <div className="hero-text-box">
              <h1 className="heading-primary">
                A healthy meal delivered to your door, every single day
              </h1>
              <p className="hero-description">
                The smart 365-days-per-year food subscription that will make you
                eat healthy again.
              </p>

              <a href="#" className="btn btn--full margin-right-sm">
                Start eating well
              </a>
              <a href="#" className="btn btn--outline">
                Learn more ↓
              </a>

              <div className="delivered-meals">
                <div className="delivered-imgs">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <img
                      key={i}
                      src={`img/customers/customerIMG-${i}.png`}
                      alt="Customer"
                    />
                  ))}
                </div>
                <p className="delivered-text">
                  <span>25,000+</span> meals delivered last year!
                </p>
              </div>
            </div>

            <div className="hero-img-box">
              <img
                src="img/heroWomenFinal.png"
                className="hero-img"
                alt="Food delivery"
              />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section-how" id="how">
          <div className="container">
            <span className="subheading">How it works</span>
            <h2 className="heading-secondary">Start in 3 simple steps</h2>
          </div>

          <div className="container grid grid--2-cols grid--center-v">
            <div className="step-text-box">
              <p className="step-number">01</p>
              <h3 className="heading-tertiary">Tell us what you like</h3>
              <p className="step-description">
                Cravvio will create a personalized meal plan for you.
              </p>
            </div>

            <div className="step-img-box">
              <img src="img/app/app-screen-1.png" className="step-img" alt="" />
            </div>

            <div className="step-img-box">
              <img src="img/app/app-screen-2.png" className="step-img" alt="" />
            </div>

            <div className="step-text-box">
              <p className="step-number">02</p>
              <h3 className="heading-tertiary">
                Approve your weekly meal plan
              </h3>
              <p className="step-description">
                Modify ingredients or add your own recipes.
              </p>
            </div>

            <div className="step-text-box">
              <p className="step-number">03</p>
              <h3 className="heading-tertiary">Receive meals on time</h3>
              <p className="step-description">Fresh meals delivered daily.</p>
            </div>

            <div className="step-img-box">
              <img src="img/app/app-screen-3.png" className="step-img" alt="" />
            </div>
          </div>
        </section>

        {/* MEALS SECTION */}
        <section className="section-meals" id="meals">
          <div className="container center-text">
            <span className="subheading">Meals</span>
            <h2 className="heading-secondary">
              Cravvio AI chooses from 5,000+ recipes
            </h2>
          </div>

          <div className="container grid grid--3-cols margin-bottom-md">
            {/* Meal 1 */}
            <div className="meal">
              <img src="img/meals/meal-1.jpg" className="meal-img" alt="" />
              <div className="meal-content">
                <div className="meal-tags">
                  <span className="tag tag--vegetarian">Vegetarian</span>
                </div>
                <p className="meal-title">Japanese Gyozas</p>
                <ul className="meal-attributes">
                  <li className="meal-attribute">
                    <ion-icon name="flame-outline"></ion-icon>
                    <span>650 calories</span>
                  </li>
                  <li className="meal-attribute">
                    <ion-icon name="restaurant-outline"></ion-icon>
                    <span>NutriScore 74</span>
                  </li>
                  <li className="meal-attribute">
                    <ion-icon name="star-outline"></ion-icon>
                    <span>4.9 rating (537)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Meal 2 */}
            <div className="meal">
              <img src="img/meals/meal-2.jpg" className="meal-img" alt="" />
              <div className="meal-content">
                <div className="meal-tags">
                  <span className="tag tag--vegan">Vegan</span>
                  <span className="tag tag--paleo">Paleo</span>
                </div>
                <p className="meal-title">Avocado Salad</p>
                <ul className="meal-attributes">
                  <li className="meal-attribute">
                    <ion-icon name="flame-outline"></ion-icon>
                    <span>400 calories</span>
                  </li>
                  <li className="meal-attribute">
                    <ion-icon name="restaurant-outline"></ion-icon>
                    <span>NutriScore 92</span>
                  </li>
                  <li className="meal-attribute">
                    <ion-icon name="star-outline"></ion-icon>
                    <span>4.8 rating (441)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Diet list */}
            <div className="diets">
              <h3 className="heading-tertiary">Works with any diet</h3>
              <ul className="list">
                {[
                  "Vegetarian",
                  "Vegan",
                  "Pescatarian",
                  "Gluten-free",
                  "Lactose-free",
                  "Keto",
                  "Paleo",
                  "Low FODMAP",
                  "Kid-friendly",
                ].map((diet) => (
                  <li className="list-item" key={diet}>
                    <ion-icon name="checkmark-outline"></ion-icon>
                    <span>{diet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="container all-recipes">
            <a href="#" className="link">
              See all recipes →
            </a>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="section-testimonials" id="testimonials">
          <div className="testimonials-container">
            <span className="subheading">Testimonials</span>
            <h2 className="heading-secondary">
              Once you try it, you can't go back
            </h2>

            <div className="testimonials">
              {[
                { name: "Mehek Joshi", img: "Mehek.png" },
                { name: "Jay Shetty", img: "Jay.jpg" },
                { name: "Surbhi Singh", img: "surbhi.png" },
                { name: "Mahesh Pandey", img: "Mahesh.png" },
              ].map((t, i) => (
                <figure className="testimonial" key={i}>
                  <img
                    className="testimonial-img"
                    alt={t.name}
                    src={`img/customers/${t.img}`}
                  />
                  <blockquote className="testimonial-text">
                    Amazing service, great food, super convenient!
                  </blockquote>
                  <p className="testimonial-name">— {t.name}</p>
                </figure>
              ))}
            </div>
          </div>

          <div className="gallery">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <figure className="gallery-item" key={i}>
                <img src={`img/gallery/gallery-${i}.jpg`} alt="Food" />
              </figure>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section className="section-pricing" id="pricing">
          <div className="container">
            <span className="subheading">Pricing</span>
            <h2 className="heading-secondary">
              Eating well without breaking the bank
            </h2>
          </div>

          <div className="container grid grid--2-cols margin-bottom-md">
            {/* Starter */}
            <div className="pricing-plan pricing-plan--starter">
              <header className="plan-header">
                <p className="plan-name">Starter</p>
                <p className="plan-price">
                  <span>₹</span>1299
                </p>
                <p className="plan-text">per month</p>
              </header>

              <ul className="list">
                <li className="list-item">
                  <ion-icon name="checkmark-outline"></ion-icon>
                  <span>1 meal per day</span>
                </li>
                <li className="list-item">
                  <ion-icon name="checkmark-outline"></ion-icon>
                  <span>Order 11am–9pm</span>
                </li>
                <li className="list-item">
                  <ion-icon name="checkmark-outline"></ion-icon>
                  <span>Delivery included</span>
                </li>
                <li className="list-item">
                  <ion-icon name="close-outline"></ion-icon>
                  <span>No access to new recipes</span>
                </li>
              </ul>

              <div className="plan-sing-up">
                <a href="#" className="btn btn--full">
                  Start eating well
                </a>
              </div>
            </div>

            {/* Complete */}
            <div className="pricing-plan pricing-plan--complete">
              <header className="plan-header">
                <p className="plan-name">Complete</p>
                <p className="plan-price">
                  <span>₹</span>2999
                </p>
                <p className="plan-text">per month</p>
              </header>

              <ul className="list">
                <li className="list-item">
                  <ion-icon name="checkmark-outline"></ion-icon>
                  <span>2 meals per day</span>
                </li>
                <li className="list-item">
                  <ion-icon name="checkmark-outline"></ion-icon>
                  <span>Order 24/7</span>
                </li>
                <li className="list-item">
                  <ion-icon name="checkmark-outline"></ion-icon>
                  <span>Delivery included</span>
                </li>
                <li className="list-item">
                  <ion-icon name="checkmark-outline"></ion-icon>
                  <span>Access to new recipes</span>
                </li>
              </ul>

              <div className="plan-sing-up">
                <a href="#" className="btn btn--full">
                  Start eating well
                </a>
              </div>
            </div>
          </div>

          <div className="container grid">
            <aside className="plan-details">
              Prices include all taxes. Cancel anytime. Both plans include
              everything ❗
            </aside>
          </div>

          <div className="container grid grid--4-cols">
            {[
              { icon: "infinite-outline", title: "Never cook again!" },
              { icon: "nutrition-outline", title: "Local and organic" },
              { icon: "leaf-outline", title: "No waste" },
              { icon: "pause-outline", title: "Pause anytime" },
            ].map((f, i) => (
              <div className="feature" key={i}>
                <ion-icon class="feature-icon" name={f.icon}></ion-icon>
                <p className="feature-title">{f.title}</p>
                <p className="feature-text">High-quality meals guaranteed.</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container grid grid--footer">
          <div className="logo-col">
            <a href="/">
              <h2 className="footer-cravvio">Cravvio</h2>
            </a>
            <ul className="social-links">
              <li>
                <a className="footer-link" href="#">
                  <ion-icon
                    class="social-icon"
                    name="logo-instagram"
                  ></ion-icon>
                </a>
              </li>
              <li>
                <a className="footer-link" href="#">
                  <ion-icon class="social-icon" name="logo-facebook"></ion-icon>
                </a>
              </li>
              <li>
                <a className="footer-link" href="#">
                  <ion-icon class="social-icon" name="logo-twitter"></ion-icon>
                </a>
              </li>
            </ul>
            <p className="copyright">Copyright © 2027 Cravvio, Inc.</p>
          </div>

          <div className="address-col">
            <p className="footer-heading">Contact us</p>
            <address className="contacts">
              <p className="address">623 Harding Road, Mirpur Cantt, Kanpur</p>
              <p>
                <a className="footer-link" href="tel:415-201-6370">
                  415-201-6370
                </a>
                <br />
                <a className="footer-link" href="mailto:hello@Cravvio.com">
                  hello@Cravvio.com
                </a>
              </p>
            </address>
          </div>

          <nav className="nav-col">
            <p className="footer-heading">Account</p>
            <ul className="footer-nav">
              <li>
                <a className="footer-link" href="#">
                  Create account
                </a>
              </li>
              <li>
                <a className="footer-link" href="#">
                  Sign in
                </a>
              </li>
              <li>
                <a className="footer-link" href="#">
                  iOS app
                </a>
              </li>
              <li>
                <a className="footer-link" href="#">
                  Android app
                </a>
              </li>
            </ul>
          </nav>

          <nav className="nav-col">
            <p className="footer-heading">Company</p>
            <ul className="footer-nav">
              <li>
                <a className="footer-link" href="#">
                  About Cravvio
                </a>
              </li>
              <li>
                <a className="footer-link" href="#">
                  For Business
                </a>
              </li>
              <li>
                <a className="footer-link" href="#">
                  Cooking partners
                </a>
              </li>
              <li>
                <a className="footer-link" href="#">
                  Careers
                </a>
              </li>
            </ul>
          </nav>

          <nav className="nav-col">
            <p className="footer-heading">Resources</p>
            <ul className="footer-nav">
              <li>
                <a className="footer-link" href="#">
                  Recipe directory
                </a>
              </li>
              <li>
                <a className="footer-link" href="#">
                  Help center
                </a>
              </li>
              <li>
                <a className="footer-link" href="#">
                  Privacy & terms
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}