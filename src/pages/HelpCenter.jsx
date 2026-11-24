import React from "react";

const categories = [
    ["Getting Started", "Learn how Aspira works and create your first project."],
    ["Projects", "Create, manage, join and collaborate on projects."],
    ["Marketplace", "Find services, resources and opportunities."],
    ["Challenges", "Participate in company challenges and bounties."],
    ["Funding", "Explore funding opportunities and connect with investors."],
    ["Community", "Connect with builders, contributors and partners."],
    ["Account & Security", "Manage your account, login, profile and security."]
];

const faqs = [
    "How do I create a project?",
    "How can I join a project?",
    "How do I find services?",
    "How can I get funding?",
    "How do I contact Aspira support?"
];

export default function HelpCenter() {
    return (
        <div className="help-center">
            <style>{`
        * {
          box-sizing: border-box;
        }

        .help-center {
          min-height: 100vh;
          background: #fff;
          color: #111;
          font-family: Inter, Arial, sans-serif;
        }

        .hc-header {
          height: 72px;
          padding: 0 4%;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #e5e5e5;
          background: #fff;
        }

        .hc-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #111;
          text-decoration: none;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -1px;
        }

        .hc-logo {
          width: 24px;
          height: 24px;
          position: relative;
        }

        .hc-logo span {
          position: absolute;
          width: 9px;
          height: 9px;
          background: #111;
          border-radius: 50%;
        }

        .hc-logo span:nth-child(1) {
          top: 0;
          left: 8px;
        }

        .hc-logo span:nth-child(2) {
          bottom: 1px;
          left: 1px;
        }

        .hc-logo span:nth-child(3) {
          bottom: 1px;
          right: 0;
        }

        .hc-logo span:nth-child(4) {
          top: 7px;
          left: 8px;
          width: 9px;
          height: 9px;
          background: #fff;
          border: 2px solid #111;
        }

        .hc-nav {
          display: flex;
          align-items: center;
          gap: 30px;
          margin-left: 38px;
        }

        .hc-nav a,
        .hc-login,
        .hc-home {
          color: #111;
          text-decoration: none;
          font-size: 12px;
        }

        .hc-nav a:hover,
        .hc-login:hover,
        .hc-home:hover {
          color: #555;
        }

        .hc-actions {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 22px;
        }

        .hc-home {
          padding: 10px 0;
          font-weight: 500;
        }

        .hc-login {
          font-weight: 600;
        }

        .hc-start {
          padding: 14px 20px;
          border-radius: 7px;
          background: #111;
          color: #fff;
          text-decoration: none;
          font-size: 11px;
          font-weight: 700;
        }

        .hc-hero {
          padding: 85px 20px 75px;
          text-align: center;
          background: #f5f5f3;
        }

        .hc-label {
          margin-bottom: 17px;
          font-size: 11px;
          letter-spacing: 1.6px;
          color: #555;
          font-weight: 600;
        }

        .hc-hero h1 {
          margin: 0;
          font-size: clamp(48px, 6vw, 72px);
          line-height: .95;
          letter-spacing: -3.5px;
          font-weight: 700;
        }

        .hc-hero p {
          margin: 23px auto 30px;
          color: #666;
          font-size: 13px;
        }

        .hc-search {
          width: min(650px, 100%);
          height: 52px;
          margin: auto;
          display: flex;
          background: #fff;
          border: 1px solid #d8d8d4;
          border-radius: 6px;
          overflow: hidden;
        }

        .hc-search input {
          flex: 1;
          border: 0;
          outline: 0;
          padding: 0 16px;
          color: #111;
          font-size: 12px;
        }

        .hc-search button {
          width: 55px;
          border: 0;
          background: #111;
          color: #fff;
          cursor: pointer;
        }

        .hc-content {
          width: min(1180px, calc(100% - 70px));
          margin: auto;
          padding: 70px 0 90px;
        }

        .hc-content h2 {
          margin: 0 0 28px;
          font-size: 30px;
          letter-spacing: -1.3px;
        }

        .hc-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .hc-card {
          min-height: 175px;
          padding: 28px;
          border: 1px solid #deded9;
          border-radius: 7px;
          background: #fff;
          transition: .2s ease;
        }

        .hc-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0,0,0,.06);
        }

        .hc-card h3 {
          margin: 0 0 12px;
          font-size: 16px;
        }

        .hc-card p {
          margin: 0 0 20px;
          color: #666;
          font-size: 11px;
          line-height: 1.6;
        }

        .hc-card a {
          color: #111;
          text-decoration: none;
          font-size: 11px;
          font-weight: 700;
        }

        .hc-faq {
          margin-top: 75px;
        }

        .hc-faq-list {
          border-top: 1px solid #ddd;
        }

        .hc-question {
          display: flex;
          justify-content: space-between;
          padding: 18px 5px;
          border-bottom: 1px solid #ddd;
          color: #111;
          font-size: 12px;
        }

        .hc-contact {
          margin-top: 70px;
          padding: 40px;
          border-radius: 7px;
          background: #111;
          color: #fff;
        }

        .hc-contact h2 {
          margin-bottom: 10px;
          color: #fff;
        }

        .hc-contact p {
          margin: 6px 0;
          color: #bbb;
          font-size: 11px;
        }

        .hc-contact a {
          color: #fff;
          font-size: 11px;
          font-weight: 600;
        }

        @media (max-width: 800px) {
          .hc-nav,
          .hc-login {
            display: none;
          }

          .hc-grid {
            grid-template-columns: 1fr;
          }

          .hc-content {
            width: calc(100% - 35px);
          }
        }
      `}</style>

            <header className="hc-header">
                <a href="/" className="hc-brand">
                    <div className="hc-logo">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    Aspira
                </a>

                <nav className="hc-nav">
                    <a href="/">Projects</a>
                    <a href="/">Marketplace</a>
                    <a href="/">Challenges</a>
                    <a href="/">Funding</a>
                    <a href="/">Community</a>
                    <a href="/">Resources</a>
                </nav>

                <div className="hc-actions">
                    <a href="/" className="hc-home">Home</a>
                    <a href="/login" className="hc-login">Log in</a>
                    <a href="/register" className="hc-start">Get Started →</a>
                </div>
            </header>

            <section className="hc-hero">
                <div className="hc-label">Aspira SUPPORT</div>

                <h1>How can we help?</h1>

                <p>
                    Find answers, guides and support for using Aspira.
                </p>

                <form className="hc-search">
                    <input placeholder="Search the Help Center..." />
                    <button type="submit">⌕</button>
                </form>
            </section>

            <main className="hc-content">
                <section>
                    <h2>Browse by category</h2>

                    <div className="hc-grid">
                        {categories.map(([title, text]) => (
                            <div className="hc-card" key={title}>
                                <h3>{title}</h3>
                                <p>{text}</p>
                                <a href="#">Explore →</a>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="hc-faq">
                    <h2>Frequently asked questions</h2>

                    <div className="hc-faq-list">
                        {faqs.map((question) => (
                            <div className="hc-question" key={question}>
                                <span>{question}</span>
                                <span>+</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="hc-contact">
                    <h2>Still need help?</h2>

                    <p>
                        Can't find what you're looking for? Our support team is here to help.
                    </p>

                    <p>
                        <a href="mailto:noreply@github.com">
                            Contact Support →
                        </a>
                    </p>

                    <p>
                        Shreyansh Agarwal — noreply@github.com
                    </p>
                </section>
            </main>
        </div>
    );
}