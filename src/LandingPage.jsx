const people = [
  "https://www.insolutions.in/wp-content/uploads/2024/02/Devesh-Ji.png",
  "https://www.insolutions.in/wp-content/uploads/2024/02/Yogesh-Ji.png",
  "https://media.licdn.com/dms/image/v2/C4D03AQHfHrL9Xlf2MQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1650534809623?e=2147483647&v=beta&t=mz_8whZzlk5MvYb0mJh-fM1DdyciIKYYjUFp3842DMk",
  "https://sinhapartners.com/admin_dCSWDrPNHpZyy2rx/uploads/img_2361_aniket-jain-thumb.jpeg"
];

const projects = [
  {
    category: "Environment",
    title: "Renewable Energy Access",
    description: "Building affordable clean energy solutions for rural communities.",
    contributors: "0 contributors",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1000&q=85"
  },
  {
    category: "Education",
    title: "Open Learning for All",
    description: "Creating free, high-quality learning resources for underserved regions.",
    contributors: "0 contributors",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=85"
  },
  {
    category: "Health",
    title: "Low-Cost Medical Devices",
    description: "Designing accessible healthcare tools for emerging markets.",
    contributors: "0 contributors",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=85"
  }
];

const Arrow = ({ direction = "right", size = 16 }) => {
  const path =
    direction === "left"
      ? "M19 12H5M11 18l-6-6 6-6"
      : direction === "up"
      ? "M7 17 17 7M7 7h10v10"
      : "M5 12h14M13 6l6 6-6 6";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
};

const Icon = ({ type, size = 28 }) => {
  const paths = {
    users:
      "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    folder:
      "M3 7h6l2 2h10v10H3V7ZM3 7V5h6l2 2",
    chart:
      "M4 20V10M10 20V5M16 20v-7M22 20V3",
    globe:
      "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20",
    file:
      "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6M8 13h8M8 17h5",
    zap:
      "m13 2-9 12h7l-1 8 9-12h-7l1-8",
    search:
      "m21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    send:
      "m22 2-7 20-4-9-9-4 20-7Z"
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[type]} />
    </svg>
  );
};

function Logo() {
  return (
    <span className="logo">
      <span className="logo-icon">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span>BuildOne</span>
    </span>
  );
}

function People({ small = false }) {
  return (
    <span className={`people ${small ? "people-small" : ""}`}>
      {people.map((person, index) => (
        <img
          key={index}
          src={person}
          alt=""
          loading="lazy"
        />
      ))}
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="page">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap");

        :root {
          --black: #090909;
          --white: #ffffff;
          --soft: #f8f8f6;
          --muted: #676762;
          --border: #dfdfda;
          --display: "Manrope", sans-serif;
          --body: "DM Sans", sans-serif;
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          color: var(--black);
          background: var(--white);
          font-family: var(--body);
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        button,
        input {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        img {
          display: block;
          max-width: 100%;
        }

        .page {
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          background: #fff;
        }

        .container {
          width: min(1400px, calc(100% - 100px));
          margin: 0 auto;
        }

        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          height: 70px;
          background: rgba(255, 255, 255, 0.97);
          border-bottom: 1px solid #e8e8e4;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .header-inner {
          height: 100%;
          display: flex;
          align-items: center;
        }

        .logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--display);
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.065em;
          white-space: nowrap;
        }

        .logo-icon {
          position: relative;
          width: 23px;
          height: 23px;
          display: block;
        }

        .logo-icon i {
          position: absolute;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--black);
        }

        .logo-icon i:nth-child(1) {
          top: 0;
          left: 7px;
        }

        .logo-icon i:nth-child(2) {
          left: 0;
          bottom: 1px;
        }

        .logo-icon i:nth-child(3) {
          right: 0;
          bottom: 1px;
        }

        .logo-icon i:nth-child(4) {
          top: 7px;
          left: 7px;
          width: 10px;
          height: 10px;
          background: #fff;
          border: 2px solid var(--black);
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 27px;
          margin-left: 32px;
        }

        .nav a {
          position: relative;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
        }

        .nav a::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -5px;
          width: 0;
          height: 1px;
          background: #090909;
          transition: width 0.2s ease;
        }

        .nav a:hover::after {
          width: 100%;
        }

        .header-tools {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-left: auto;
        }

        .search {
          width: 205px;
          height: 34px;
          display: flex;
          align-items: center;
          gap: 7px;
          color: #73736e;
          border-bottom: 1px solid #deded9;
        }

        .search input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          font-size: 10px;
        }

        .search input::placeholder {
          color: #999994;
        }

        .login {
          font-size: 11px;
          font-weight: 600;
        }

        .button {
          min-height: 43px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 19px;
          border: 1px solid var(--black);
          border-radius: 7px;
          font-size: 11px;
          font-weight: 700;
          transition:
            transform 0.2s ease,
            background 0.2s ease,
            color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .button:hover {
          transform: translateY(-2px);
        }

        .button-black {
          color: #fff;
          background: #090909;
        }

        .button-black:hover {
          background: #1c1c1c;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.16);
        }

        .button-white {
          color: #080808;
          background: #fff;
        }

        .button-white:hover {
          background: #f1f1ef;
        }

        .button-outline {
          color: #080808;
          background: transparent;
        }

        .button-outline:hover {
          background: #090909;
          color: #fff;
        }

        .hero {
          position: relative;
          isolation: isolate;
          min-height: 590px;
          overflow: hidden;
          background-color: #171717;
          background-image:
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.98) 0%,
              rgba(255, 255, 255, 0.95) 17%,
              rgba(255, 255, 255, 0.76) 31%,
              rgba(255, 255, 255, 0.28) 48%,
              rgba(255, 255, 255, 0.04) 64%,
              rgba(0, 0, 0, 0.08) 100%
            ),
            url("https://i.pinimg.com/736x/02/4e/c1/024ec14bec852b1cc2b070999e2e1e8c.jpg");
          background-position: center center;
          background-size: cover;
          background-repeat: no-repeat;
        }

        .hero::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background:
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.03) 0%,
              rgba(255, 255, 255, 0) 55%,
              rgba(0, 0, 0, 0.16) 100%
            );
        }

        .hero-inner {
          position: relative;
          z-index: 2;
          min-height: 590px;
          display: grid;
          grid-template-columns: minmax(450px, 1fr) 320px;
          align-items: center;
          gap: 55px;
        }

        .hero-content {
          position: relative;
          z-index: 3;
          padding: 50px 0;
        }

        .eyebrow,
        .label {
          margin: 0 0 14px;
          color: #454541;
          font-size: 10px;
          line-height: 1;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .hero-title {
          max-width: 650px;
          margin: 0;
          color: #050505;
          font-family: var(--display);
          font-size: clamp(64px, 7.4vw, 96px);
          font-weight: 800;
          line-height: 0.88;
          letter-spacing: -0.085em;
        }

        .hero-description {
          max-width: 490px;
          margin: 27px 0 0;
          color: #111;
          font-size: 14px;
          line-height: 1.58;
          font-weight: 500;
        }

        .hero-actions {
          display: flex;
          gap: 14px;
          margin-top: 26px;
        }

        .community {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-top: 24px;
        }

        .people {
          display: flex;
          flex-shrink: 0;
        }

        .people img {
          width: 31px;
          height: 31px;
          margin-left: -5px;
          border: 2px solid #fff;
          border-radius: 50%;
          object-fit: cover;
          filter: grayscale(1);
        }

        .people img:first-child {
          margin-left: 0;
        }

        .people-small img {
          width: 22px;
          height: 22px;
        }

        .community-copy {
          max-width: 205px;
          color: #151515;
          font-size: 9px;
          line-height: 1.5;
          font-weight: 500;
        }

        .hero-note {
          display: none;
        }

        .capabilities {
          position: relative;
          z-index: 5;
          display: grid;
          gap: 7px;
        }

        .capability {
          min-height: 77px;
          display: grid;
          grid-template-columns: 39px 1fr;
          align-items: center;
          gap: 10px;
          padding: 12px 15px;
          border: 1px solid rgba(255, 255, 255, 0.68);
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.90);
          box-shadow:
            0 12px 30px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition:
            transform 0.22s ease,
            background 0.22s ease,
            box-shadow 0.22s ease;
        }

        .capability:hover {
          transform: translateX(-5px);
          background: rgba(255, 255, 255, 0.97);
          box-shadow:
            0 18px 38px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.95);
        }

        .capability-title {
          margin: 0 0 4px;
          font-size: 11px;
          font-weight: 700;
        }

        .capability-text {
          margin: 0;
          color: #50504c;
          font-size: 9px;
        }

        .stats {
          border-bottom: 1px solid #e4e4e0;
          background: #fff;
        }

        .stats-grid {
          min-height: 83px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }

        .stat {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 15px 28px;
        }

        .stat:first-child {
          padding-left: 0;
        }

        .stat:not(:last-child)::after {
          content: "";
          position: absolute;
          top: 25%;
          right: 0;
          width: 1px;
          height: 50%;
          background: #cfcfca;
        }

        .stat-title {
          display: block;
          margin-bottom: 3px;
          font-size: 10px;
          font-weight: 700;
        }

        .stat-copy {
          color: #686863;
          font-size: 9px;
        }

        .projects {
          padding: 63px 0 72px;
          background: #fff;
        }

        .projects-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 55px;
        }

        .section-title {
          margin: 0;
          font-family: var(--display);
          font-size: 38px;
          font-weight: 800;
          line-height: 0.96;
          letter-spacing: -0.065em;
        }

        .section-copy {
          max-width: 250px;
          margin: 15px 0 0;
          color: #484844;
          font-size: 11px;
          line-height: 1.55;
        }

        .text-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 28px;
          font-size: 10px;
          font-weight: 700;
          transition: gap 0.2s ease;
        }

        .text-link:hover {
          gap: 11px;
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 17px;
        }

        .filters {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .filters::-webkit-scrollbar {
          display: none;
        }

        .filter {
          height: 30px;
          flex-shrink: 0;
          padding: 0 12px;
          border: 1px solid #deded9;
          border-radius: 20px;
          background: #f8f8f6;
          font-size: 8px;
          transition:
            background 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease;
        }

        .filter:hover {
          border-color: #090909;
          background: #fff;
        }

        .filter:first-child {
          color: #fff;
          border-color: #090909;
          background: #090909;
        }

        .toolbar-arrows {
          display: flex;
          gap: 7px;
        }

        .circle {
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid #d3d3ce;
          border-radius: 50%;
          background: #fff;
          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .circle:hover {
          color: #fff;
          background: #090909;
          transform: translateY(-2px);
        }

        .project-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 15px;
        }

        .project-card {
          overflow: hidden;
          border: 1px solid #deded9;
          border-radius: 9px;
          background: #fff;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .project-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 35px rgba(0, 0, 0, 0.08);
        }

        .project-image {
          position: relative;
          height: 122px;
          overflow: hidden;
          background: #ddd;
        }

        .project-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(1);
          transition: transform 0.35s ease;
        }

        .project-card:hover .project-image img {
          transform: scale(1.05);
        }

        .category {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 5px 9px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.92);
          font-size: 8px;
        }

        .project-body {
          padding: 12px;
        }

        .project-title {
          margin: 0;
          font-family: var(--display);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .project-copy {
          min-height: 32px;
          margin: 7px 0 13px;
          color: #666;
          font-size: 8.5px;
          line-height: 1.45;
        }

        .project-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .contributors {
          display: flex;
          align-items: center;
        }

        .contributors-count {
          margin-left: 7px;
          color: #4f4f4b;
          font-size: 8px;
          white-space: nowrap;
        }

        .how {
          padding: 63px 0 70px;
          background: #fafaf8;
          border-top: 1px solid #e5e5e1;
          border-bottom: 1px solid #e5e5e1;
        }

        .how-layout {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 55px;
        }

        .handwritten {
          margin-top: 22px;
          font-family: "Segoe Print", "Comic Sans MS", cursive;
          font-size: 13px;
          line-height: 1.22;
          transform: rotate(-5deg);
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }

        .step {
          position: relative;
          min-height: 125px;
          padding: 3px 20px;
          border-right: 1px solid #ddd;
        }

        .step:first-child {
          padding-left: 0;
        }

        .step:last-child {
          border-right: 0;
        }

        .step:not(:last-child)::after {
          content: "→";
          position: absolute;
          top: -3px;
          right: -10px;
          font-size: 19px;
        }

        .step-icon {
          margin-bottom: 18px;
        }

        .step-title {
          margin-bottom: 7px;
          font-size: 12px;
          font-weight: 700;
        }

        .step-copy {
          max-width: 150px;
          margin: 0;
          color: #666;
          font-size: 8.5px;
          line-height: 1.5;
        }

        .voices {
          padding: 63px 0 65px;
          background: #fff;
        }

        .voices-layout {
          display: grid;
          grid-template-columns: 310px 1fr;
          gap: 60px;
          align-items: center;
        }

        .testimonials {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .testimonial {
          min-height: 170px;
          padding: 17px;
          border: 1px solid #e0e0dc;
          border-radius: 9px;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .testimonial:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.06);
        }

        .testimonial-top {
          display: flex;
          gap: 12px;
        }

        .testimonial-image {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border-radius: 50%;
          object-fit: cover;
          filter: grayscale(1);
        }

        .testimonial-quote {
          margin: 1px 0 17px;
          color: #41413e;
          font-size: 9.5px;
          line-height: 1.55;
        }

        .testimonial-person {
          padding-top: 10px;
          border-top: 1px solid #e3e3df;
        }

        .testimonial-name {
          display: block;
          font-size: 8.5px;
          font-weight: 700;
        }

        .testimonial-role {
          display: block;
          margin-top: 3px;
          color: #70706b;
          font-size: 7.5px;
        }

        .cta {
          color: #fff;
          background:
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.99) 0%,
              rgba(0, 0, 0, 0.93) 35%,
              rgba(0, 0, 0, 0.60) 65%,
              rgba(0, 0, 0, 0.32) 100%
            ),
            url("https://i.pinimg.com/736x/eb/9c/9c/eb9c9c5baf8c9717ded152cc6068b6d8.jpg")
              center/cover;
        }

        .cta-inner {
          min-height: 260px;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 70px;
          align-items: center;
        }

        .cta .label {
          color: #ddd;
        }

        .cta-title {
          max-width: 500px;
          margin: 0;
          font-family: var(--display);
          font-size: 42px;
          line-height: 0.96;
          letter-spacing: -0.065em;
          font-weight: 800;
        }

        .cta-copy {
          max-width: 420px;
          margin: 0 0 20px;
          color: #eee;
          font-size: 11px;
          line-height: 1.55;
        }

        .cta-actions {
          display: flex;
          gap: 12px;
        }

        .cta .button-outline {
          color: #fff;
          border-color: rgba(255, 255, 255, 0.75);
        }

        .cta .button-outline:hover {
          color: #090909;
          background: #fff;
        }

        .footer {
          padding: 47px 0 22px;
          background: #fff;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 0.7fr 0.7fr 0.7fr 1.1fr;
          gap: 45px;
        }

        .footer-description {
          max-width: 270px;
          margin: 18px 0;
          color: #555;
          font-size: 8.5px;
          line-height: 1.65;
        }

        .footer-heading {
          margin: 0 0 13px;
          font-size: 10px;
        }

        .footer-column a {
          display: block;
          margin-bottom: 8px;
          color: #555;
          font-size: 8.5px;
          transition: color 0.2s ease;
        }

        .footer-column a:hover {
          color: #000;
        }

        .newsletter-copy {
          max-width: 180px;
          margin: 0 0 9px;
          color: #555;
          font-size: 8.5px;
          line-height: 1.45;
        }

        .newsletter {
          display: flex;
          height: 34px;
        }

        .newsletter input {
          width: 100%;
          min-width: 0;
          padding: 0 9px;
          border: 1px solid #d7d7d3;
          border-radius: 5px 0 0 5px;
          outline: 0;
          font-size: 8px;
        }

        .newsletter button {
          width: 37px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          border: 0;
          border-radius: 0 5px 5px 0;
          background: #090909;
          transition: background 0.2s ease;
        }

        .newsletter button:hover {
          background: #292929;
        }

        .consent {
          display: flex;
          align-items: flex-start;
          gap: 5px;
          margin-top: 7px;
          color: #777;
          font-size: 6.5px;
        }

        .consent input {
          margin: 0;
        }

        .footer-bottom {
          display: flex;
          align-items: center;
          gap: 25px;
          margin-top: 35px;
          padding-top: 17px;
          border-top: 1px solid #deded9;
          color: #555;
          font-size: 7.5px;
        }

        .tagline {
          display: flex;
          align-items: center;
          gap: 15px;
          flex: 1;
        }

        .tagline::after {
          content: "";
          height: 1px;
          flex: 1;
          background: #aaa;
        }

        @media (max-width: 1100px) {
          .container {
            width: calc(100% - 60px);
          }

          .nav {
            gap: 17px;
            margin-left: 25px;
          }

          .search {
            width: 150px;
          }

          .hero {
            background-image:
              linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.97) 0%,
                rgba(255, 255, 255, 0.91) 20%,
                rgba(255, 255, 255, 0.63) 38%,
                rgba(255, 255, 255, 0.18) 55%,
                rgba(0, 0, 0, 0.08) 100%
              ),
              url("https://i.pinimg.com/736x/02/4e/c1/024ec14bec852b1cc2b070999e2e1e8c.jpg");
          }

          .hero-inner {
            grid-template-columns: minmax(420px, 1fr) 275px;
            gap: 35px;
          }

          .capability {
            min-height: 72px;
          }
        }

        @media (max-width: 850px) {
          .container {
            width: calc(100% - 40px);
          }

          .nav,
          .header-tools {
            display: none;
          }

          .header-inner::after {
            content: "☰";
            margin-left: auto;
            font-size: 21px;
          }

          .hero {
            min-height: 650px;
            background-position: 63% center;
            background-image:
              linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.98) 0%,
                rgba(255, 255, 255, 0.91) 37%,
                rgba(255, 255, 255, 0.55) 63%,
                rgba(0, 0, 0, 0.08) 100%
              ),
              url("/hero-boardroom.jpg");
          }

          .hero-inner {
            min-height: 650px;
            grid-template-columns: 1fr;
            align-items: center;
          }

          .hero-content {
            padding: 70px 0;
          }

          .capabilities,
          .hero-note {
            display: none;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stat:first-child {
            padding-left: 15px;
          }

          .stat:nth-child(2)::after {
            display: none;
          }

          .stat:nth-child(n + 3) {
            border-top: 1px solid #e5e5e1;
          }

          .projects-layout,
          .how-layout,
          .voices-layout {
            grid-template-columns: 1fr;
            gap: 35px;
          }

          .project-grid {
            grid-template-columns: repeat(3, 230px);
            overflow-x: auto;
            padding-bottom: 8px;
          }

          .cta-inner {
            grid-template-columns: 1fr 1fr;
          }

          .footer-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .footer-grid > :first-child {
            grid-column: span 3;
          }
        }

        @media (max-width: 600px) {
          .container {
            width: calc(100% - 28px);
          }

          .header {
            height: 62px;
          }

          .hero {
            min-height: 690px;
            background-position: 66% center;
            background-image:
              linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.98) 0%,
                rgba(255, 255, 255, 0.92) 45%,
                rgba(255, 255, 255, 0.58) 72%,
                rgba(0, 0, 0, 0.12) 100%
              ),
              url("/hero-boardroom.jpg");
          }

          .hero-inner {
            min-height: 690px;
          }

          .hero-title {
            font-size: 55px;
          }

          .hero-description {
            font-size: 12px;
            max-width: 400px;
          }

          .hero-actions {
            flex-direction: column;
          }

          .hero-actions .button {
            width: 100%;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stat {
            padding: 14px 9px;
            gap: 8px;
          }

          .stat:first-child {
            padding-left: 9px;
          }

          .stat svg {
            width: 21px;
            height: 21px;
          }

          .toolbar-arrows {
            display: none;
          }

          .steps {
            grid-template-columns: 1fr;
          }

          .step,
          .step:first-child {
            min-height: auto;
            padding: 20px 0;
            border-right: 0;
            border-bottom: 1px solid #ddd;
          }

          .step:last-child {
            border-bottom: 0;
          }

          .step:not(:last-child)::after {
            display: none;
          }

          .testimonials {
            grid-template-columns: 1fr;
          }

          .cta-inner {
            min-height: auto;
            grid-template-columns: 1fr;
            gap: 30px;
            padding: 55px 0;
          }

          .cta-title {
            font-size: 39px;
          }

          .cta-actions {
            flex-direction: column;
          }

          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .footer-grid > :first-child,
          .footer-grid > :last-child {
            grid-column: span 2;
          }

          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
          }

          .tagline {
            width: 100%;
            flex-direction: column;
            align-items: flex-start;
          }

          .tagline::after {
            width: 100%;
          }
        }
      `}</style>

      <header className="header">
        <div className="container header-inner">
          <a href="/" aria-label="BuildOne home">
            <Logo />
          </a>

          <nav className="nav" aria-label="Primary navigation">
            <a href="#projects">Projects</a>
            <a href="#marketplace">Marketplace</a>
            <a href="#challenges">Challenges</a>
            <a href="#funding">Funding</a>
            <a href="#community">Community</a>
            <a href="#resources">Resources</a>
          </nav>

          <div className="header-tools">
            <label className="search">
              <Icon type="search" size={15} />
              <input
                type="search"
                placeholder="Search projects, skills, or opportunities..."
                aria-label="Search projects, skills, or opportunities"
              />
            </label>

            <a href="/login" className="login">
              Log in
            </a>

            <a href="/register" className="button button-black">
              Get Started
              <Arrow size={13} />
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="container hero-inner">
            <div className="hero-content">
              <p className="eyebrow">Projects bring people together</p>

              <h1 className="hero-title" id="hero-title">
                Solve Real
                <br />
                Gaps.
              </h1>

              <p className="hero-description">
                A project-centered platform to find people, services,
                resources, funding and partners — all in one place.
                Turn your ideas into real progress, with the right people
                by your side.
              </p>

              <div className="hero-actions">
                <a href="/register" className="button button-black">
                  Start Your Project
                  <Arrow size={13} />
                </a>

                <a href="#projects" className="button button-outline">
                  Explore Projects
                </a>
              </div>

              <div className="community">
                <People />

                <span className="community-copy">
                  A growing community of builders, creators, and problem
                  solvers.
                </span>
              </div>
            </div>

            <div className="capabilities">
              <article className="capability">
                <Icon type="users" size={27} />

                <div>
                  <h2 className="capability-title">People</h2>
                  <p className="capability-text">Find the right talent.</p>
                </div>
              </article>

              <article className="capability">
                <Icon type="folder" size={27} />

                <div>
                  <h2 className="capability-title">Services</h2>
                  <p className="capability-text">Get work done</p>
                </div>
              </article>

              <article className="capability">
                <Icon type="folder" size={27} />

                <div>
                  <h2 className="capability-title">Resources</h2>
                  <p className="capability-text">Access what you need</p>
                </div>
              </article>

              <article className="capability">
                <Icon type="chart" size={27} />

                <div>
                  <h2 className="capability-title">Funding</h2>
                  <p className="capability-text">
                    Connect with investors.
                  </p>
                </div>
              </article>

              <article className="capability">
                <Icon type="users" size={27} />

                <div>
                  <h2 className="capability-title">Collaboration</h2>
                  <p className="capability-text">Build together</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section
          className="stats"
          aria-label="BuildOne platform highlights"
        >
          <div className="container stats-grid">
            <div className="stat">
              <Icon type="file" size={28} />

              <div>
                <strong className="stat-title">Projects</strong>
                <span className="stat-copy">across industries</span>
              </div>
            </div>

            <div className="stat">
              <Icon type="users" size={28} />

              <div>
                <strong className="stat-title">
                  Builders & Contributors
                </strong>
                <span className="stat-copy">worldwide</span>
              </div>
            </div>

            <div className="stat">
              <Icon type="globe" size={28} />

              <div>
                <strong className="stat-title">Opportunities</strong>
                <span className="stat-copy">in one place</span>
              </div>
            </div>

            <div className="stat">
              <Icon type="chart" size={28} />

              <div>
                <strong className="stat-title">
                  A global community
                </strong>
                <span className="stat-copy">growing every day</span>
              </div>
            </div>
          </div>
        </section>

        <section
          className="projects"
          id="projects"
          aria-labelledby="projects-title"
        >
          <div className="container projects-layout">
            <div>
              <p className="label">Explore</p>

              <h2 className="section-title" id="projects-title">
                Projects
                <br />
                Making an Impact
              </h2>

              <p className="section-copy">
                Discover real projects from a global community of builders.
                Join, contribute, or start your own.
              </p>

              <a href="/projects" className="text-link">
                View all projects
                <Arrow size={12} />
              </a>
            </div>

            <div>
              <div className="toolbar">
                <div className="filters">
                  <button className="filter">All</button>
                  <button className="filter">Technology</button>
                  <button className="filter">Social Impact</button>
                  <button className="filter">Environment</button>
                  <button className="filter">Health</button>
                  <button className="filter">Education</button>
                  <button className="filter">More⌄</button>
                </div>

                <div className="toolbar-arrows">
                  <button
                    className="circle"
                    aria-label="Previous projects"
                  >
                    <Arrow direction="left" size={13} />
                  </button>

                  <button
                    className="circle"
                    aria-label="Next projects"
                  >
                    <Arrow size={13} />
                  </button>
                </div>
              </div>

              <div className="project-grid">
                {projects.map((project) => (
                  <article
                    className="project-card"
                    key={project.title}
                  >
                    <div className="project-image">
                      <img
                        src={project.image}
                        alt={`${project.title} project`}
                        loading="lazy"
                      />

                      <span className="category">
                        {project.category}
                      </span>
                    </div>

                    <div className="project-body">
                      <h3 className="project-title">
                        {project.title}
                      </h3>

                      <p className="project-copy">
                        {project.description}
                      </p>

                      <div className="project-footer">
                        <div className="contributors">
                          <People small />

                          <span className="contributors-count">
                            {project.contributors}
                          </span>
                        </div>

                        <a
                          href="/projects"
                          className="circle"
                          aria-label={`Open ${project.title}`}
                        >
                          <Arrow direction="up" size={13} />
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className="how"
          id="marketplace"
          aria-labelledby="how-title"
        >
          <div className="container how-layout">
            <div>
              <p className="label">How it works</p>

              <h2 className="section-title" id="how-title">
                From Idea to
                <br />
                Impact
              </h2>

              <div className="handwritten">
                Different people.
                <br />
                Different skills.
                <br />
                A bigger tomorrow.
              </div>
            </div>

            <div className="steps">
              <article className="step">
                <Icon type="file" size={30} />

                <div className="step-title">
                  1. Create
                </div>

                <p className="step-copy">
                  Share your project and requirements.
                </p>
              </article>

              <article className="step">
                <Icon type="users" size={30} />

                <div className="step-title">
                  2. Connect
                </div>

                <p className="step-copy">
                  Find people, services, resources or funding.
                </p>
              </article>

              <article className="step">
                <Icon type="zap" size={30} />

                <div className="step-title">
                  3. Collaborate
                </div>

                <p className="step-copy">
                  Work together with the right partners.
                </p>
              </article>

              <article className="step">
                <Icon type="chart" size={30} />

                <div className="step-title">
                  4. Make an Impact
                </div>

                <p className="step-copy">
                  Turn ideas into real world outcomes.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="voices"
          id="community"
          aria-labelledby="voices-title"
        >
          <div className="container voices-layout">
            <div>
              <p className="label">
                Voices from our community
              </p>

              <h2 className="section-title" id="voices-title">
                Built by people,
                <br />
                for a better tomorrow.
              </h2>
            </div>

            <div className="testimonials">
              <article className="testimonial">
                <div className="testimonial-top">
                  <img
                    className="testimonial-image"
                    src={people[0]}
                    alt="BuildOne community member"
                    loading="lazy"
                  />

                  <blockquote className="testimonial-quote">
                    “BuildOne Idea is Best I support the Team BuildOne for future Development also”
                  </blockquote>
                </div>

                <div className="testimonial-person">
                  <strong className="testimonial-name">
                    Devesh Garg
                  </strong>

                  <span className="testimonial-role">
                    Founder, Inventive Solutions Pvt ltd Noida
                  </span>
                </div>
              </article>

              <article className="testimonial">
                <div className="testimonial-top">
                  <img
                    className="testimonial-image"
                    src={people[1]}
                    alt="BuildOne community member"
                    loading="lazy"
                  />

                  <blockquote className="testimonial-quote">
                    “This Platform i hope will help to connect people and their ideas to make a better world.”
                  </blockquote>
                </div>

                <div className="testimonial-person">
                  <strong className="testimonial-name">
                    Simerdeep Singh
                  </strong>

                  <span className="testimonial-role">
                    Project Lead, Freelancer Developer
                  </span>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section
          className="cta"
          id="funding"
          aria-labelledby="cta-title"
        >
          <div className="container cta-inner">
            <div>
              <p className="label">Ready to build?</p>

              <h2 className="cta-title" id="cta-title">
                Your next opportunity starts here.
              </h2>
            </div>

            <div>
              <p className="cta-copy">
                Join a global community of builders, creators and
                changemakers. Bring your ideas to life with the right
                people, tools and support.
              </p>

              <div className="cta-actions">
                <a
                  href="/register"
                  className="button button-white"
                >
                  Get Started
                  <Arrow size={13} />
                </a>

                <a
                  href="/marketplace"
                  className="button button-outline"
                >
                  Explore Marketplace
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer" id="resources">
        <div className="container">
          <div className="footer-grid">
            <div>
              <a href="/" aria-label="BuildOne home">
                <Logo />
              </a>

              <p className="footer-description">
                A project-centered platform connecting people, projects,
                services, resources and funding — for a more collaborative
                and impactful world.
              </p>
            </div>

            <div className="footer-column">
              <h3 className="footer-heading">
                Platform
              </h3>

              <a href="/projects">Projects</a>
              <a href="/marketplace">Marketplace</a>
              <a href="/challenges">Challenges</a>
              <a href="/funding">Funding</a>
              <a href="/community">Community</a>
              <a href="/resources">Resources</a>
            </div>

            <div className="footer-column">
              <h3 className="footer-heading">
                Support
              </h3>

              <a href="/help">Help Center</a>
              <a href="/contact">Contact Us</a>
              <a href="/safety">Safety</a>
              <a href="/guidelines">Community Guidelines</a>
              <a href="/report">Report a Problem</a>
            </div>

            <div className="footer-column">
              <h3 className="footer-heading">
                Company
              </h3>

              <a href="/about">About</a>
              <a href="/careers">Careers</a>
              <a href="/blog">Blog</a>
              <a href="/press">Press</a>
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
            </div>

            <div className="footer-column">
              <h3 className="footer-heading">
                Stay Updated
              </h3>

              <p className="newsletter-copy">
                Get the latest projects, opportunities and platform
                updates.
              </p>

              <form
                className="newsletter"
                onSubmit={(event) => event.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  aria-label="Email address"
                />

                <button
                  type="submit"
                  aria-label="Subscribe"
                >
                  <Icon type="send" size={12} />
                </button>
              </form>

              <label className="consent">
                <input type="checkbox" />
                <span>
                  I agree to receive updates from BuildOne.
                </span>
              </label>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="tagline">
              Real Projects. Real People. A Better Tomorrow.
            </div>

            <span>
              © 2026 BuildOne. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}