import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Baby,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  HeartPulse,
  Hospital,
  Leaf,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrafficCone,
  X,
} from "lucide-react";
import "./styles.css";

const phoneNumber = "031-965-5775";
const naverMapUrl =
  "https://map.naver.com/p/search/%ED%99%94%EC%A0%95%EC%BD%94%EC%95%A4%ED%82%A4%ED%95%9C%EC%9D%98%EC%9B%90";

const navigationItems = [
  { label: "한의원 소개", view: "about" },
  { label: "진료 분야", view: "clinics" },
  { label: "치료/한약 안내", view: "treatment" },
  { label: "오시는 길", view: "location" },
  { label: "공지", view: "notice" },
];

const menuGroups = [
  {
    title: "한의원",
    items: [
      { label: "한의원 소개", view: "about" },
      { label: "병원 둘러보기", view: "about" },
    ],
  },
  {
    title: "진료",
    items: [
      { label: "진료 분야", view: "clinics" },
      { label: "치료/한약 안내", view: "treatment" },
    ],
  },
  {
    title: "방문",
    items: [
      { label: "오시는 길/진료시간", view: "location" },
      { label: "공지/블로그", view: "notice" },
    ],
  },
];

const clinicGroups = [
  {
    icon: HeartPulse,
    eyebrow: "호흡기 클리닉",
    title: "비염 · 축농증",
    description: "코막힘, 콧물, 재채기, 후비루처럼 반복되는 불편함을 상담합니다.",
    symptoms: ["비염", "축농증", "만성기침", "중이염"],
  },
  {
    icon: Baby,
    eyebrow: "성장/소아 클리닉",
    title: "성장 · 잦은감기",
    description: "아이 성장 흐름, 식사, 수면, 생활 리듬을 함께 살펴봅니다.",
    symptoms: ["성장부진", "성조숙", "잦은감기", "허약아"],
  },
  {
    icon: TrafficCone,
    eyebrow: "통증/교통사고",
    title: "통증 · 후유증",
    description: "목, 허리, 어깨 통증과 교통사고 후 불편함을 확인합니다.",
    symptoms: ["통증질환", "교통사고", "근육 긴장", "일상 불편"],
  },
  {
    icon: Leaf,
    eyebrow: "여성/비만/구강",
    title: "가족 건강 상담",
    description: "산후 회복, 갱년기, 체중 관리, 구내염과 구취를 상담합니다.",
    symptoms: ["산후보약", "갱년기", "비만", "구내염"],
  },
];

const principles = [
  {
    icon: Stethoscope,
    title: "증상만 보지 않는 문진",
    body: "증상 기간, 수면, 식사, 생활환경까지 함께 확인해 진료 방향을 안내합니다.",
  },
  {
    icon: ShieldCheck,
    title: "과장 없는 설명",
    body: "치료 보장보다 현재 상태와 가능한 진료 과정을 이해하기 쉽게 설명합니다.",
  },
  {
    icon: Sparkles,
    title: "아이와 가족 친화 동선",
    body: "처음 방문해도 전화, 길찾기, 진료시간을 바로 확인할 수 있게 정리했습니다.",
  },
];

const gallery = [
  {
    src: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80",
    alt: "밝고 정돈된 병원 대기 공간 참고 이미지",
    title: "편안한 대기 공간",
  },
  {
    src: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80",
    alt: "진료실과 의료 장비가 보이는 참고 이미지",
    title: "정돈된 진료 환경",
  },
  {
    src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80",
    alt: "의료진이 상담을 준비하는 참고 이미지",
    title: "차분한 상담",
  },
  {
    src: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=80",
    alt: "깨끗한 의료 공간 복도 참고 이미지",
    title: "찾기 쉬운 동선",
  },
];

const notices = [
  ["5월 24일, 25일 진료 안내", "2026-05-15"],
  ["5월 1일 휴진 안내", "2026-04-27"],
  ["3월 진료 일정 안내", "2026-02-24"],
];

function App() {
  const [activeView, setActiveView] = useState(() => {
    const view = window.location.hash.replace("#", "");
    return ["about", "clinics", "treatment", "location", "notice"].includes(view) ? view : "home";
  });

  const navigateTo = (view) => {
    setActiveView(view);
    const nextUrl = view === "home" ? window.location.pathname : `#${view}`;
    window.history.pushState(null, "", nextUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <SiteHeader activeView={activeView} onNavigate={navigateTo} />
      <main>
        {activeView === "home" ? (
          <HomePage onNavigate={navigateTo} />
        ) : (
          <SubPage activeView={activeView} onNavigate={navigateTo} />
        )}
      </main>
      <SiteFooter />
      <BottomCTA onNavigate={navigateTo} />
    </>
  );
}

function SiteHeader({ activeView, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);
  const handleNavigate = (event, view) => {
    event.preventDefault();
    closeMenu();
    onNavigate(view);
  };

  return (
    <header className="site-header">
      <a
        className="brand"
        href="/konki-webdesign/"
        aria-label="화정코앤키한의원 홈"
        onClick={(event) => handleNavigate(event, "home")}
      >
        <span className="brand-mark">K</span>
        <span>
          <strong>화정코앤키한의원</strong>
          <small>HWAJEONG KONKIUM</small>
        </span>
      </a>
      <nav className="desktop-nav" aria-label="주요 메뉴">
        {navigationItems.map((item) => (
          <a
            href={`#${item.view}`}
            key={item.view}
            className={activeView === item.view ? "is-active" : ""}
            onClick={(event) => handleNavigate(event, item.view)}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="header-actions">
        <a className="header-phone" href={`tel:${phoneNumber}`}>
          <Phone size={18} aria-hidden="true" />
          <span>{phoneNumber}</span>
        </a>
        <button
          className="menu-button"
          type="button"
          aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </div>
      <div
        className={`mobile-menu ${isMenuOpen ? "is-open" : ""}`}
        id="mobile-menu"
        aria-hidden={!isMenuOpen}
      >
        <nav aria-label="모바일 주요 메뉴">
          <a href="/konki-webdesign/" onClick={(event) => handleNavigate(event, "home")}>
            홈
            <ChevronRight size={18} aria-hidden="true" />
          </a>
          {menuGroups.map((group) => (
            <div className="mobile-menu-group" key={group.title}>
              <strong>{group.title}</strong>
              {group.items.map((item) => (
                <a
                  href={`#${item.view}`}
                  key={`${group.title}-${item.label}`}
                  onClick={(event) => handleNavigate(event, item.view)}
                >
                  {item.label}
                  <ChevronRight size={18} aria-hidden="true" />
                </a>
              ))}
            </div>
          ))}
        </nav>
        <div className="mobile-menu-actions">
          <a className="btn btn-primary" href={`tel:${phoneNumber}`} onClick={closeMenu}>
            <Phone size={19} aria-hidden="true" />
            전화하기
          </a>
          <a
            className="btn btn-secondary"
            href={naverMapUrl}
            target="_blank"
            rel="noreferrer"
            onClick={closeMenu}
          >
            <MapPin size={19} aria-hidden="true" />
            길찾기
          </a>
        </div>
      </div>
    </header>
  );
}

function HomePage({ onNavigate }) {
  return (
    <>
      <Hero />
      <QuickClinics onNavigate={onNavigate} compact />
      <LandingVisitSummary onNavigate={onNavigate} />
    </>
  );
}

function SubPage({ activeView, onNavigate }) {
  const content = {
    about: (
      <>
        <PageIntro
          eyebrow="한의원 소개"
          title="처음 방문해도 편안한 가족 한의원"
          body="진료 방향, 공간 사진, 실제 사진 교체 예정 영역을 한 곳에서 확인할 수 있습니다."
        />
        <TrustSection />
        <AboutSection />
        <GallerySection />
      </>
    ),
    clinics: (
      <>
        <PageIntro
          eyebrow="진료 분야"
          title="증상 중심으로 빠르게 찾는 진료 안내"
          body="비염, 성장, 잦은감기, 통증처럼 환자가 실제로 찾는 불편함을 중심으로 정리했습니다."
        />
        <QuickClinics onNavigate={onNavigate} />
      </>
    ),
    treatment: (
      <>
        <PageIntro
          eyebrow="치료/한약 안내"
          title="상태를 확인하고 필요한 진료를 안내합니다"
          body="치료 보장을 암시하기보다 문진, 진료 방향, 내원 전 상담 흐름을 차분하게 설명합니다."
        />
        <TreatmentSection />
      </>
    ),
    location: <LocationSection />,
    notice: <NoticeSection />,
  };

  return <>{content[activeView] || content.about}</>;
}

function PageIntro({ eyebrow, title, body }) {
  return (
    <section className="page-intro" aria-labelledby={`${title}-title`}>
      <p className="eyebrow">{eyebrow}</p>
      <h1 id={`${title}-title`}>{title}</h1>
      <p>{body}</p>
    </section>
  );
}

function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero-bg" role="img" aria-label="아이와 가족을 위한 밝은 진료 공간 이미지" />
      <div className="hero-content">
        <p className="eyebrow">화정역 3번 출구 인근 · 가족 한방 진료</p>
        <h1 id="hero-title">화정코앤키한의원</h1>
        <p className="hero-copy">
          아이와 가족의 호흡, 성장, 건강을 함께 살피는 한의원입니다. 비염, 축농증,
          성장, 잦은감기, 통증과 교통사고 후유증을 차분히 상담합니다.
        </p>
        <div className="hero-actions" aria-label="빠른 문의">
          <a className="btn btn-primary" href={`tel:${phoneNumber}`}>
            <Phone size={19} aria-hidden="true" />
            전화하기
          </a>
          <a className="btn btn-secondary" href={naverMapUrl} target="_blank" rel="noreferrer">
            <MapPin size={19} aria-hidden="true" />
            길찾기
          </a>
        </div>
        <div className="hero-hours" aria-label="진료시간 요약">
          <Clock3 size={20} aria-hidden="true" />
          <span>평일 AM 10:00 - PM 7:30</span>
          <strong>목요일 정기휴진</strong>
        </div>
      </div>
    </section>
  );
}

function QuickClinics({ onNavigate, compact = false }) {
  return (
    <section
      id="clinics"
      className={`section section-tight ${compact ? "landing-clinics" : ""}`}
      aria-labelledby="clinics-title"
    >
      <div className="section-heading">
        <p className="eyebrow">빠른 진료 선택</p>
        <h2 id="clinics-title">어떤 불편함으로 오셨나요?</h2>
        <p>
          복잡한 메뉴 대신 환자가 찾는 증상 중심으로 진료 분야를 묶었습니다.
        </p>
      </div>
      <div className="clinic-grid">
        {(compact ? clinicGroups.slice(0, 2) : clinicGroups).map((clinic) => (
          <article className="clinic-card" key={clinic.title}>
            <clinic.icon className="card-icon" size={34} aria-hidden="true" />
            <span className="card-eyebrow">{clinic.eyebrow}</span>
            <h3>{clinic.title}</h3>
            <p>{clinic.description}</p>
            <div className="tag-row">
              {clinic.symptoms.map((symptom) => (
                <span key={symptom}>{symptom}</span>
              ))}
            </div>
            <a
              className="text-link"
              href="#location"
              onClick={(event) => {
                event.preventDefault();
                onNavigate("location");
              }}
            >
              상담 문의
              <ChevronRight size={17} aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>
      {compact ? (
        <button className="text-link landing-more-link" type="button" onClick={() => onNavigate("clinics")}>
          전체 진료 분야 보기
          <ChevronRight size={17} aria-hidden="true" />
        </button>
      ) : null}
    </section>
  );
}

function LandingVisitSummary({ onNavigate }) {
  return (
    <section className="section landing-summary" aria-labelledby="landing-summary-title">
      <div className="section-heading">
        <p className="eyebrow">방문 전 핵심 정보</p>
        <h2 id="landing-summary-title">전화, 위치, 진료시간만 빠르게 확인하세요</h2>
      </div>
      <div className="summary-grid">
        <article className="info-card">
          <Clock3 size={22} aria-hidden="true" />
          <div>
            <h3>진료시간</h3>
            <p>평일 AM 10:00 - PM 7:30</p>
            <strong>목요일 정기휴진</strong>
          </div>
        </article>
        <article className="info-card">
          <MapPin size={22} aria-hidden="true" />
          <div>
            <h3>오시는 길</h3>
            <p>화정역 3번 출구 인근, 새롬프라자 2층</p>
          </div>
        </article>
      </div>
      <div className="landing-summary-actions">
        <a className="btn btn-primary" href={`tel:${phoneNumber}`}>
          <Phone size={19} aria-hidden="true" />
          전화하기
        </a>
        <button className="btn btn-secondary" type="button" onClick={() => onNavigate("location")}>
          <CalendarDays size={19} aria-hidden="true" />
          자세히 보기
        </button>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="section trust-band" aria-labelledby="trust-title">
      <div className="section-heading">
        <p className="eyebrow">진료 방향</p>
        <h2 id="trust-title">처음 방문해도 이해하기 쉽게</h2>
      </div>
      <div className="principle-grid">
        {principles.map((item) => (
          <article className="principle-card" key={item.title}>
            <item.icon size={30} aria-hidden="true" />
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="section about-layout" aria-labelledby="about-title">
      <div className="about-media">
        <img
          src="https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1100&q=80"
          alt="보호자가 아이와 진료 상담을 준비하는 참고 이미지"
        />
      </div>
      <div className="about-copy">
        <p className="eyebrow">한의원 소개</p>
        <h2 id="about-title">지역에서 편하게 상담할 수 있는 가족 한의원</h2>
        <p>
          화정코앤키한의원은 아이와 가족이 반복적으로 겪는 호흡기, 성장, 소아 건강,
          통증 불편함을 생활 맥락과 함께 살피는 진료를 지향합니다.
        </p>
        <ul className="check-list">
          <li>
            <CheckCircle2 size={19} aria-hidden="true" />
            화정역 인근, 방문 전 전화 상담이 쉬운 위치
          </li>
          <li>
            <CheckCircle2 size={19} aria-hidden="true" />
            아이 증상과 보호자 걱정을 함께 듣는 상담 흐름
          </li>
          <li>
            <CheckCircle2 size={19} aria-hidden="true" />
            통이미지가 아닌 실제 텍스트 기반 안내 구조
          </li>
        </ul>
      </div>
    </section>
  );
}

function TreatmentSection() {
  return (
    <section id="treatment" className="section treatment-section" aria-labelledby="treatment-title">
      <div className="section-heading">
        <p className="eyebrow">치료/한약 안내</p>
        <h2 id="treatment-title">상태를 확인하고 필요한 진료를 안내합니다</h2>
        <p>
          진료 전후 설명을 분명히 하고, 아이와 가족의 생활 리듬을 함께 살펴볼 수 있는
          구조로 바꿉니다.
        </p>
      </div>
      <div className="treatment-list">
        <article>
          <Hospital size={28} aria-hidden="true" />
          <h3>문진과 확인</h3>
          <p>증상 기간, 수면, 식사, 생활환경을 확인합니다.</p>
        </article>
        <article>
          <Leaf size={28} aria-hidden="true" />
          <h3>한방 진료 방향</h3>
          <p>개인 상태에 맞춰 한약, 침, 뜸, 부항 등 필요한 방향을 안내합니다.</p>
        </article>
        <article>
          <MessageCircle size={28} aria-hidden="true" />
          <h3>내원 전 상담</h3>
          <p>전화로 진료시간과 방문 가능 여부를 먼저 확인할 수 있습니다.</p>
        </article>
      </div>
    </section>
  );
}

function GallerySection() {
  return (
    <section className="section gallery-section" aria-labelledby="gallery-title">
      <div className="section-heading">
        <p className="eyebrow">병원 둘러보기</p>
        <h2 id="gallery-title">실제 공간 사진 중심으로 신뢰감을 만듭니다</h2>
        <p>외관, 입구, 대기실, 진료실 사진을 우선 배치하는 구조입니다.</p>
      </div>
      <div className="photo-grid">
        {gallery.map((photo) => (
          <figure key={photo.title}>
            <img src={photo.src} alt={photo.alt} />
            <figcaption>{photo.title}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function LocationSection() {
  return (
    <section id="location" className="section location-section" aria-labelledby="location-title">
      <div className="location-copy">
        <p className="eyebrow">진료시간 / 오시는 길</p>
        <h2 id="location-title">방문 전 전화로 진료시간을 확인하세요</h2>
        <p>
          화정역 3번 출구 인근 새롬프라자 2층입니다. 모바일에서는 전화와 길찾기를
          하단에서도 바로 누를 수 있습니다.
        </p>
        <div className="location-actions">
          <a className="btn btn-primary" href={`tel:${phoneNumber}`}>
            <Phone size={19} aria-hidden="true" />
            {phoneNumber}
          </a>
          <a className="btn btn-secondary" href={naverMapUrl} target="_blank" rel="noreferrer">
            <MapPin size={19} aria-hidden="true" />
            네이버 지도
          </a>
        </div>
      </div>
      <div className="info-stack">
        <article className="info-card">
          <Clock3 size={22} aria-hidden="true" />
          <div>
            <h3>진료시간</h3>
            <p>평일 AM 10:00 - PM 7:30</p>
            <p>토요일 AM 10:00 - PM 5:00</p>
            <p>일/공휴일 AM 10:00 - PM 2:00</p>
            <strong>목요일 정기휴진</strong>
          </div>
        </article>
        <article className="info-card">
          <MapPin size={22} aria-hidden="true" />
          <div>
            <h3>주소</h3>
            <p>경기 고양시 덕양구 화정동 969-1</p>
            <p>새롬프라자 2층</p>
          </div>
        </article>
      </div>
    </section>
  );
}

function NoticeSection() {
  return (
    <section id="notice" className="section notice-section" aria-labelledby="notice-title">
      <div className="section-heading">
        <p className="eyebrow">공지/블로그</p>
        <h2 id="notice-title">최근 진료 안내</h2>
      </div>
      <div className="notice-list">
        {notices.map(([title, date]) => (
          <a href="#notice" key={title}>
            <span>{title}</span>
            <time>{date}</time>
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        ))}
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <strong>화정코앤키한의원</strong>
        <p>경기 고양시 덕양구 화정동 969-1 새롬프라자 2층</p>
      </div>
      <a href={`tel:${phoneNumber}`}>{phoneNumber}</a>
    </footer>
  );
}

function BottomCTA({ onNavigate }) {
  return (
    <nav className="bottom-cta" aria-label="빠른 연락">
      <a href={`tel:${phoneNumber}`}>
        <Phone size={20} aria-hidden="true" />
        전화
      </a>
      <a href={naverMapUrl} target="_blank" rel="noreferrer">
        <MapPin size={20} aria-hidden="true" />
        길찾기
      </a>
      <a
        href="#location"
        onClick={(event) => {
          event.preventDefault();
          onNavigate("location");
        }}
      >
        <CalendarDays size={20} aria-hidden="true" />
        진료시간
      </a>
    </nav>
  );
}

createRoot(document.getElementById("root")).render(<App />);
