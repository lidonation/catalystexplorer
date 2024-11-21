import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import { createContext, useState, useEffect, useContext, useRef, forwardRef, useImperativeHandle } from "react";
import { Link, useForm, router, usePage, createInertiaApp } from "@inertiajs/react";
import { useRoute } from "ziggy-js";
import axios from "axios";
import { parse, stringify } from "qs";
import { DialogPanel, Dialog } from "@headlessui/react";
import createServer from "@inertiajs/react/server";
import ReactDOMServer from "react-dom/server";
const activeFund$1 = "Active Fund";
const articles$1 = "Articles";
const bookmarks$1 = "My Bookmarks";
const catalystAPI$1 = "Catalyst API";
const ccv4Votes$1 = "CCV4 Votes";
const charts$1 = "Charts";
const communities$1 = "Communities";
const comingSoon$1 = "Coming Soon";
const cookies$1 = "Cookies";
const copyright$1 = "© 2024 Catalyst Explorer. All rights reserved.";
const data$1 = "Data";
const dReps$1 = "DReps";
const facebook$1 = "Facebook";
const funds$1 = "Funds";
const getStarted$1 = "Get started";
const github$1 = "Github";
const groups$1 = "Groups";
const home$1 = "Home";
const jormungandr$1 = "Jormungandr";
const knowledgeBase$1 = "Knowledge Base";
const legal$1 = "Legal";
const licenses$1 = "Licenses";
const login$1 = "Login";
const linkedIn$1 = "LinkedIn";
const monthlyReports$1 = "Monthly Reports";
const numbers$1 = "Numbers";
const people$1 = "People";
const privacy$1 = "Privacy";
const reviews$1 = "Reviews";
const register$1 = "Register";
const social$1 = "Social";
const support$1 = "Support";
const terms$1 = "Terms";
const twitter$1 = "Twitter";
const votes$1 = "My Votes";
const wallets$1 = "Wallets";
const app$1 = {
  name: "Catalyst Explorer",
  contactEmail: "support@lidonation.com",
  appLogoAlt: "Catalyst Explorer logo."
};
const navigation$1 = {
  mobile: {
    sidebar: "Mobile sidebar navigation section",
    content: "Mobile navigation links"
  },
  desktop: {
    sidebar: "Sidebar navigation section"
  },
  sidebar: {
    open: "Open sidebar",
    close: "Close sidebar"
  },
  links: {
    home: "Home"
  }
};
const registration$1 = {
  alreadyRegistered: "Already registered?",
  passwordCharacters: "Must be 8 characters"
};
const searchBar$1 = {
  placeholder: "Search proposals, funds, people, articles & data",
  all_filters: "All Filters",
  variants: {
    all: "All Groups"
  }
};
const catalystIntro$1 = {
  title: {
    normalText: "Project Catalyst",
    highlightedText: "elevates collaborative innovation"
  },
  subtitle: "Catalyst drives Cardano's ecosystem growth by linking innovative ideas with funding, supported by community voting and the Cardano treasury."
};
const proposals$1 = {
  allProposals: "All proposals",
  proposals: "Proposals",
  projectVideo: "Project Video",
  providedUrl: "Provided URL",
  listSubtitle: "Proposal votes must be submitted in the official Catalyst Voting App",
  pageSubtitle: "Search proposals and challenges by title, content, or author and co-authors",
  seeMoreProposals: "See more proposals",
  proposalReviews: "Proposal Reviews",
  CSVs: "Proposal CSVs",
  errors: {
    noUrl: "No video URL provided",
    invalidYoutubeFormat: "The YouTube link format is incorrect",
    invalidVimeoFormat: "The Vimeo link format is incorrect",
    invalidUrlFormat: "Invalid URL format",
    invalidUrl: "Invalid URL format"
  }
};
const posts$1 = {
  title: "Catalysts Posts",
  subtitle: "Latest news and posts from our community"
};
const theme$1 = {
  theme: "Theme",
  options: "Theme options",
  light: "Light",
  dark: "Dark",
  voltaire: "Voltaire",
  changeMode: "Change theme to {{mode}} mode"
};
const icons$1 = {
  titles: {
    barLine: "Bar Line Chart Icon",
    blue_eye: "Blue Eye Icon",
    bookmark: "Bookmark Check Icon",
    bucket: "Bucket Icon",
    chart: "Chart Icon",
    check: "Check Icon",
    chevron_up: "Chevron Up Icon",
    chevron_down: "Chevron Down Icon",
    close: "close Icon",
    darkMode: "Dark Mode Icon",
    folder: "Folder Icon",
    home: "Home Icon",
    lightMode: "Light Mode Icon",
    logOut: "Logout Icon",
    mail: "Mail Icon",
    menu: "Menu Icon",
    note: "Note Icon",
    notificationBox: "Notification Box Icon",
    people: "People Icon",
    search: "Search Icon",
    voltaireMode: "Voltaire Mode Icon",
    register: "Register Icon",
    login: "Login Icon"
  }
};
const users = {
  editProfile: "Edit profile"
};
const enLang = {
  activeFund: activeFund$1,
  articles: articles$1,
  bookmarks: bookmarks$1,
  catalystAPI: catalystAPI$1,
  ccv4Votes: ccv4Votes$1,
  charts: charts$1,
  communities: communities$1,
  comingSoon: comingSoon$1,
  cookies: cookies$1,
  copyright: copyright$1,
  data: data$1,
  dReps: dReps$1,
  facebook: facebook$1,
  funds: funds$1,
  getStarted: getStarted$1,
  github: github$1,
  groups: groups$1,
  home: home$1,
  jormungandr: jormungandr$1,
  knowledgeBase: knowledgeBase$1,
  legal: legal$1,
  licenses: licenses$1,
  login: login$1,
  linkedIn: linkedIn$1,
  monthlyReports: monthlyReports$1,
  numbers: numbers$1,
  people: people$1,
  privacy: privacy$1,
  reviews: reviews$1,
  register: register$1,
  social: social$1,
  support: support$1,
  terms: terms$1,
  twitter: twitter$1,
  votes: votes$1,
  wallets: wallets$1,
  app: app$1,
  navigation: navigation$1,
  registration: registration$1,
  searchBar: searchBar$1,
  catalystIntro: catalystIntro$1,
  proposals: proposals$1,
  posts: posts$1,
  theme: theme$1,
  icons: icons$1,
  users
};
const activeFund = "Fonds Actif";
const articles = "Articles";
const bookmarks = "Mes Signets";
const catalystAPI = "API Catalyst";
const ccv4Votes = "Votes CCV4";
const charts = "Graphiques";
const comingSoon = "À venir";
const communities = "Communautés";
const cookies = "Cookies";
const copyright = "© 2024 Explorateur Catalyst. Tous droits réservés.";
const data = "Données";
const dReps = "DReps";
const facebook = "Facebook";
const funds = "Fonds";
const getStarted = "Commencer";
const github = "Github";
const groups = "Groupes";
const home = "Accueil";
const jormungandr = "Jormungandr";
const knowledgeBase = "Base de Connaissances";
const legal = "Légal";
const licenses = "Licences";
const linkedIn = "LinkedIn";
const login = "Se connecter";
const monthlyReports = "Rapports Mensuels";
const numbers = "Chiffres";
const people = "Personnes";
const privacy = "Confidentialité";
const proposalReviews = "Évaluations des propositions";
const proposers = "Proposeurs";
const register = "Registre";
const reviews = "Évaluations";
const social = "Social";
const twitter = "Twitter";
const support = "Support";
const terms = "Conditions Générales";
const votes = "Mes Votes";
const wallets = "Portefeuilles";
const app = {
  name: "Catalyst Explorer",
  contactEmail: "support@lidonation.com",
  appLogoAlt: "Logo de Catalyst Explore."
};
const navigation = {
  mobile: {
    sidebar: "Section de navigation de la barre latérale mobile",
    content: "Liens de navigation mobile"
  },
  desktop: {
    sidebar: "Section de navigation de la barre latérale"
  },
  sidebar: {
    open: "Ouvrir la barre latérale",
    close: "Fermer la barre latérale"
  }
};
const registration = {
  alreadyRegistered: "Déjà inscrit?",
  passwordCharacters: "Doit contenir 8 caractères"
};
const searchBar = {
  placeholder: "Rechercher des propositions, des fonds, des personnes, des articles et des données",
  all_filters: "Tous les filtres",
  variants: {
    all: "Tous les groupes"
  }
};
const catalystIntro = {
  title: {
    normalText: "Projet Catalyst",
    highlightedText: "élève l'innovation collaborative"
  },
  subtitle: "Catalyst stimule la croissance de l'écosystème Cardano en reliant des idées innovantes à un financement, soutenu par un vote communautaire et le trésor Cardano."
};
const proposals = {
  allProposals: "Toutes les propositions",
  CSVs: "CSVs de propositions",
  proposals: "Propositions",
  projectVideo: "Vidéo du projet",
  providedUrl: "URL fournie",
  listSubtitle: "Les votes des propositions doivent être soumis dans l'application officielle de vote Catalyst.",
  pageSubtitle: "Rechercher des propositions et des défis par titre, contenu ou auteur et co-auteurs.",
  seeMoreProposals: "Voir plus de propositions",
  errors: {
    noUrl: "Aucune URL vidéo fournie",
    invalidYoutubeFormat: "Le format du lien YouTube est incorrect",
    invalidVimeoFormat: "Le format du lien Vimeo est incorrect",
    invalidUrlFormat: "Format d'URL invalide",
    invalidUrl: "Format d'URL invalide"
  }
};
const posts = {
  title: "Articles des Catalysts",
  subtitle: "Dernières nouvelles et publications de notre communauté"
};
const theme = {
  theme: "Thème",
  options: "Options de thème",
  light: "Clair",
  dark: "Sombre",
  voltaire: "Voltaire",
  changeMode: "Passer au thème {{mode}}"
};
const icons = {
  titles: {
    barLine: "Icône de graphique en barres",
    blue_eye: "Icône d'œil bleu",
    bookmark: "Icône de signet",
    bucket: "Icône de seau",
    chart: "Icône de graphique",
    check: "Icône de vérification",
    chevron_up: "Icône de chevron vers le haut",
    chevron_down: "Icône de chevron vers le bas",
    close: "Icône de fermeture",
    search: "Icône de recherche",
    darkMode: "Icône de mode sombre",
    folder: "Icône de dossier",
    home: "Icône d'accueil",
    lightMode: "Icône de mode clair",
    logOut: "Icône de déconnexion",
    mail: "Icône de courrier",
    menu: "Icône de menu",
    note: "Icône de note",
    notificationBox: "Icône de boîte de notification",
    people: "Icône de personnes",
    voltaireMode: "Icône de mode Voltaire"
  }
};
const frLang = {
  activeFund,
  articles,
  bookmarks,
  catalystAPI,
  ccv4Votes,
  charts,
  comingSoon,
  communities,
  cookies,
  copyright,
  data,
  dReps,
  facebook,
  funds,
  getStarted,
  github,
  groups,
  home,
  jormungandr,
  knowledgeBase,
  legal,
  licenses,
  linkedIn,
  login,
  monthlyReports,
  numbers,
  people,
  privacy,
  proposalReviews,
  proposers,
  register,
  reviews,
  social,
  twitter,
  support,
  terms,
  votes,
  wallets,
  app,
  navigation,
  registration,
  searchBar,
  catalystIntro,
  proposals,
  posts,
  theme,
  icons
};
let currentLocale = "en";
if (typeof window != "undefined") {
  currentLocale = document.documentElement.lang;
}
const resources = {
  en: {
    translation: enLang
  },
  fr: {
    translation: frLang
  }
};
i18n.use(initReactI18next).init({
  resources,
  fallbackLng: currentLocale,
  lng: currentLocale,
  interpolation: {
    escapeValue: false
    // react already safes from xss
  }
});
function Button({
  onClick,
  children,
  disabled = false,
  className = "",
  type = "button",
  ariaLabel,
  arialExpanded,
  arialControls,
  ariaPressed
}) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick: disabled ? void 0 : onClick,
      type,
      disabled,
      "aria-label": ariaLabel,
      "aria-expanded": arialExpanded,
      "aria-controls": arialControls,
      "aria-pressed": ariaPressed,
      className: `rounded text-content ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`,
      children
    }
  );
}
const catalystLogoDark = "/build/assets/catalyst-logo-dark-CZiPVQ7x.png";
const catalystLogoLight = "/build/assets/catalyst-logo-light-BPj2SQ6h.png";
const ThemeContext = createContext(void 0);
function ThemeProvider({ children }) {
  const [theme2, setTheme] = useState("light");
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
      return;
    }
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const systemTheme = prefersDark ? "dark" : "light";
    setTheme(systemTheme);
    document.documentElement.setAttribute("data-theme", systemTheme);
  }, []);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      const savedTheme = localStorage.getItem("theme");
      if (!savedTheme) {
        const newTheme = e.matches ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };
  return /* @__PURE__ */ jsx(ThemeContext.Provider, { value: { theme: theme2, setTheme: handleThemeChange }, children });
}
function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
function CatalystLogo({ className }) {
  const [logoSrc, setLogoSrc] = useState(catalystLogoLight);
  const { theme: theme2 } = useThemeContext();
  const { t } = useTranslation();
  const updateLogoBasedOnTheme = (theme22) => {
    if (theme22 === "dark") {
      setLogoSrc(catalystLogoLight);
    } else {
      setLogoSrc(catalystLogoDark);
    }
  };
  useEffect(() => {
    updateLogoBasedOnTheme(theme2);
  }, [theme2]);
  return /* @__PURE__ */ jsx("img", { className, src: logoSrc, alt: t("app.appLogoAlt") });
}
function NavLinkItem({
  children,
  href,
  title,
  className,
  prefetch = false,
  async = false,
  ...rest
}) {
  return /* @__PURE__ */ jsxs(
    Link,
    {
      ...rest,
      href,
      role: "navigation",
      className: `flex items-center gap-3 px-3 py-1 hover:bg-background-lighter ${className}`,
      children: [
        children,
        /* @__PURE__ */ jsx("p", { children: title })
      ]
    }
  );
}
function BarLineIcon({
  className,
  width = 24,
  height = 24
}) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width,
      height,
      viewBox: "0 0 24 25",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      className,
      children: [
        /* @__PURE__ */ jsx("title", { children: t("icons.title.barLine") }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M20 20.5V13.5M12 20.5V10.5M4 20.5L4 16.5M13.4067 5.5275L18.5751 7.46567M10.7988 5.90092L5.20023 10.0998M21.0607 6.93934C21.6464 7.52513 21.6464 8.47487 21.0607 9.06066C20.4749 9.64645 19.5251 9.64645 18.9393 9.06066C18.3536 8.47487 18.3536 7.52513 18.9393 6.93934C19.5251 6.35355 20.4749 6.35355 21.0607 6.93934ZM5.06066 9.93934C5.64645 10.5251 5.64645 11.4749 5.06066 12.0607C4.47487 12.6464 3.52513 12.6464 2.93934 12.0607C2.35355 11.4749 2.35355 10.5251 2.93934 9.93934C3.52513 9.35355 4.47487 9.35355 5.06066 9.93934ZM13.0607 3.93934C13.6464 4.52513 13.6464 5.47487 13.0607 6.06066C12.4749 6.64645 11.5251 6.64645 10.9393 6.06066C10.3536 5.47487 10.3536 4.52513 10.9393 3.93934C11.5251 3.35355 12.4749 3.35355 13.0607 3.93934Z",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        )
      ]
    }
  );
}
function ChartIcon({
  className,
  width = 24,
  height = 24
}) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width,
      height,
      viewBox: "0 0 24 25",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      className,
      children: [
        /* @__PURE__ */ jsxs("title", { children: [
          " ",
          t("icons.title.chart")
        ] }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M12 2.5C13.3132 2.5 14.6136 2.75866 15.8268 3.26121C17.0401 3.76375 18.1425 4.50035 19.0711 5.42893C19.9997 6.35752 20.7363 7.45991 21.2388 8.67317C21.7413 9.88643 22 11.1868 22 12.5M12 2.5V12.5M12 2.5C6.47715 2.5 2 6.97715 2 12.5C2 18.0228 6.47715 22.5 12 22.5C17.5228 22.5 22 18.0229 22 12.5M12 2.5C17.5228 2.5 22 6.97716 22 12.5M22 12.5L12 12.5M22 12.5C22 14.0781 21.6265 15.6338 20.9101 17.0399C20.1936 18.446 19.1546 19.6626 17.8779 20.5902L12 12.5",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        )
      ]
    }
  );
}
function CheckIcon({
  className,
  width = 24,
  height = 24
}) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width,
      height,
      viewBox: "0 0 24 25",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      className,
      children: [
        /* @__PURE__ */ jsxs("title", { children: [
          " ",
          t("icons.title.check")
        ] }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M6 15.5L8 17.5L12.5 13M8 8.5V5.7C8 4.5799 8 4.01984 8.21799 3.59202C8.40973 3.21569 8.71569 2.90973 9.09202 2.71799C9.51984 2.5 10.0799 2.5 11.2 2.5H18.8C19.9201 2.5 20.4802 2.5 20.908 2.71799C21.2843 2.90973 21.5903 3.21569 21.782 3.59202C22 4.01984 22 4.5799 22 5.7V13.3C22 14.4201 22 14.9802 21.782 15.408C21.5903 15.7843 21.2843 16.0903 20.908 16.282C20.4802 16.5 19.9201 16.5 18.8 16.5H16M5.2 22.5H12.8C13.9201 22.5 14.4802 22.5 14.908 22.282C15.2843 22.0903 15.5903 21.7843 15.782 21.408C16 20.9802 16 20.4201 16 19.3V11.7C16 10.5799 16 10.0198 15.782 9.59202C15.5903 9.21569 15.2843 8.90973 14.908 8.71799C14.4802 8.5 13.9201 8.5 12.8 8.5H5.2C4.0799 8.5 3.51984 8.5 3.09202 8.71799C2.71569 8.90973 2.40973 9.21569 2.21799 9.59202C2 10.0198 2 10.5799 2 11.7V19.3C2 20.4201 2 20.9802 2.21799 21.408C2.40973 21.7843 2.71569 22.0903 3.09202 22.282C3.51984 22.5 4.07989 22.5 5.2 22.5Z",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        )
      ]
    }
  );
}
function HomeIcon({ className, width = 24, height = 24 }) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width,
      height,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      className,
      children: [
        /* @__PURE__ */ jsxs("title", { children: [
          " ",
          t("icons.title.home")
        ] }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M8 17.0002H16M11.0177 2.76424L4.23539 8.03937C3.78202 8.39199 3.55534 8.5683 3.39203 8.7891C3.24737 8.98469 3.1396 9.20503 3.07403 9.4393C3 9.70376 3 9.99094 3 10.5653V17.8002C3 18.9203 3 19.4804 3.21799 19.9082C3.40973 20.2845 3.71569 20.5905 4.09202 20.7822C4.51984 21.0002 5.07989 21.0002 6.2 21.0002H17.8C18.9201 21.0002 19.4802 21.0002 19.908 20.7822C20.2843 20.5905 20.5903 20.2845 20.782 19.9082C21 19.4804 21 18.9203 21 17.8002V10.5653C21 9.99094 21 9.70376 20.926 9.4393C20.8604 9.20503 20.7526 8.98469 20.608 8.7891C20.4447 8.5683 20.218 8.39199 19.7646 8.03937L12.9823 2.76424C12.631 2.49099 12.4553 2.35436 12.2613 2.30184C12.0902 2.2555 11.9098 2.2555 11.7387 2.30184C11.5447 2.35436 11.369 2.49099 11.0177 2.76424Z",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        )
      ]
    }
  );
}
function NoteIcon({
  className,
  width = 24,
  height = 24
}) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width,
      height,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      className,
      children: [
        /* @__PURE__ */ jsxs("title", { children: [
          " ",
          t("icons.title.note")
        ] }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M14 2.26946V6.4C14 6.96005 14 7.24008 14.109 7.45399C14.2049 7.64215 14.3578 7.79513 14.546 7.89101C14.7599 8 15.0399 8 15.6 8H19.7305M20 9.98822V17.2C20 18.8802 20 19.7202 19.673 20.362C19.3854 20.9265 18.9265 21.3854 18.362 21.673C17.7202 22 16.8802 22 15.2 22H8.8C7.11984 22 6.27976 22 5.63803 21.673C5.07354 21.3854 4.6146 20.9265 4.32698 20.362C4 19.7202 4 18.8802 4 17.2V6.8C4 5.11984 4 4.27976 4.32698 3.63803C4.6146 3.07354 5.07354 2.6146 5.63803 2.32698C6.27976 2 7.11984 2 8.8 2H12.0118C12.7455 2 13.1124 2 13.4577 2.08289C13.7638 2.15638 14.0564 2.27759 14.3249 2.44208C14.6276 2.6276 14.887 2.88703 15.4059 3.40589L18.5941 6.59411C19.113 7.11297 19.3724 7.3724 19.5579 7.67515C19.7224 7.94356 19.8436 8.2362 19.9171 8.5423C20 8.88757 20 9.25445 20 9.98822Z",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        )
      ]
    }
  );
}
function NotificationBoxIcon({
  className,
  width = 24,
  height = 24
}) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width,
      height,
      viewBox: "0 0 24 25",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      className,
      children: [
        /* @__PURE__ */ jsxs("title", { children: [
          " ",
          t("icons.title.notificationBox")
        ] }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M11 4.5H7.8C6.11984 4.5 5.27976 4.5 4.63803 4.82698C4.07354 5.1146 3.6146 5.57354 3.32698 6.13803C3 6.77976 3 7.61984 3 9.3V16.7C3 18.3802 3 19.2202 3.32698 19.862C3.6146 20.4265 4.07354 20.8854 4.63803 21.173C5.27976 21.5 6.11984 21.5 7.8 21.5H15.2C16.8802 21.5 17.7202 21.5 18.362 21.173C18.9265 20.8854 19.3854 20.4265 19.673 19.862C20 19.2202 20 18.3802 20 16.7V13.5M20.1213 4.37868C21.2929 5.55025 21.2929 7.44975 20.1213 8.62132C18.9497 9.79289 17.0503 9.79289 15.8787 8.62132C14.7071 7.44975 14.7071 5.55025 15.8787 4.37868C17.0503 3.20711 18.9497 3.20711 20.1213 4.37868Z",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        )
      ]
    }
  );
}
function PeopleIcon({
  className,
  width = 24,
  height = 24
}) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width,
      height,
      viewBox: "0 0 22 21",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      className,
      children: [
        /* @__PURE__ */ jsxs("title", { children: [
          " ",
          t("icons.title.people")
        ] }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M21 19.5V17.5C21 15.6362 19.7252 14.0701 18 13.626M14.5 1.79076C15.9659 2.38415 17 3.82131 17 5.5C17 7.17869 15.9659 8.61585 14.5 9.20924M16 19.5C16 17.6362 16 16.7044 15.6955 15.9693C15.2895 14.9892 14.5108 14.2105 13.5307 13.8045C12.7956 13.5 11.8638 13.5 10 13.5H7C5.13623 13.5 4.20435 13.5 3.46927 13.8045C2.48915 14.2105 1.71046 14.9892 1.30448 15.9693C1 16.7044 1 17.6362 1 19.5M12.5 5.5C12.5 7.70914 10.7091 9.5 8.5 9.5C6.29086 9.5 4.5 7.70914 4.5 5.5C4.5 3.29086 6.29086 1.5 8.5 1.5C10.7091 1.5 12.5 3.29086 12.5 5.5Z",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        )
      ]
    }
  );
}
function AppNavigation() {
  const route2 = useRoute();
  const { t } = useTranslation();
  const navItems = [
    {
      href: route2("home"),
      title: t("home"),
      icon: /* @__PURE__ */ jsx(HomeIcon, { className: "text-dark" })
    },
    {
      href: route2("proposal.index"),
      title: t("proposals.proposals"),
      icon: /* @__PURE__ */ jsx(NoteIcon, { className: "text-primary-100" }),
      active: true
    },
    {
      href: route2("fund.index"),
      title: t("funds"),
      icon: /* @__PURE__ */ jsx(CheckIcon, { className: "text-dark" })
    },
    {
      href: route2("people.index"),
      title: t("people"),
      icon: /* @__PURE__ */ jsx(PeopleIcon, { className: "text-dark" })
    },
    {
      href: route2("charts.index"),
      title: t("charts"),
      icon: /* @__PURE__ */ jsx(ChartIcon, { className: "text-dark" })
    },
    {
      href: route2("jormungandr.index"),
      title: t("jormungandr"),
      icon: /* @__PURE__ */ jsx(BarLineIcon, { className: "text-dark" })
    },
    {
      href: "/active-fund",
      title: t("activeFund"),
      icon: /* @__PURE__ */ jsx(NotificationBoxIcon, { className: "text-dark" })
    }
  ];
  return /* @__PURE__ */ jsx("nav", { className: "flex flex-col justify-between", children: /* @__PURE__ */ jsx("ul", { className: "flex flex-1 flex-col menu-gap-y px-4", children: navItems.map(({ href, title, icon }) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLinkItem, { href, title, prefetch: true, async: true, children: icon }) }, href)) }) });
}
function DarkModeIcon({ className }) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      "aria-hidden": "true",
      focusable: "false",
      className,
      children: [
        /* @__PURE__ */ jsxs("title", { children: [
          " ",
          t("icons.title.darkMode")
        ] }),
        /* @__PURE__ */ jsx("path", { d: "M21 12.79A9 9 0 0112 21a9.11 9.11 0 01-4.34-1.1 1 1 0 01.3-1.84A7 7 0 1013 5.06a1 1 0 01-1.34-1.31A9 9 0 0121 12.79z" })
      ]
    }
  );
}
function LightModeIcon({ className }) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      strokeWidth: "1.5",
      stroke: "currentColor",
      "aria-hidden": "true",
      focusable: "false",
      className: `size-4 ${className}`,
      children: [
        /* @__PURE__ */ jsxs("title", { children: [
          " ",
          t("icons.title.lightMode")
        ] }),
        /* @__PURE__ */ jsx(
          "path",
          {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
          }
        )
      ]
    }
  );
}
function VoltaireModeIcon({ className }) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      "aria-hidden": "true",
      focusable: "false",
      className,
      children: [
        /* @__PURE__ */ jsxs("title", { children: [
          " ",
          t("icons.title.voltaireMode")
        ] }),
        /* @__PURE__ */ jsx("path", { d: "M12 2a10 10 0 0110 10 10 10 0 01-10 10A10 10 0 012 12 10 10 0 0112 2zm0 4a6 6 0 100 12 6 6 0 000-12z" })
      ]
    }
  );
}
function ThemeSwitcher() {
  const { theme: theme2, setTheme } = useThemeContext();
  const { t } = useTranslation();
  const icons2 = {
    light: /* @__PURE__ */ jsx(LightModeIcon, {}),
    dark: /* @__PURE__ */ jsx(DarkModeIcon, {}),
    voltaire: /* @__PURE__ */ jsx(VoltaireModeIcon, {})
  };
  return /* @__PURE__ */ jsxs(
    "fieldset",
    {
      className: "flex flex-col items-center gap-2 rounded relative",
      "aria-labelledby": "theme-legend",
      children: [
        /* @__PURE__ */ jsx(
          "legend",
          {
            id: "theme-legend",
            className: "text-content text-5 py-2 px-1.5 ml-2.5 sr-only",
            children: t("theme.theme")
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "flex justify-between w-full gap-x-2.5",
            role: "group",
            "aria-label": t("theme.options"),
            children: ["light", "dark", "voltaire"].map((mode) => /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: () => setTheme(mode),
                ariaLabel: t("theme.changeMode", { mode }),
                "aria-pressed": theme2 === mode,
                className: `inline-flex items-center flex-1 gap-1 rounded border bg-background px-1 text-5 text-content hover:bg-background-lighter ${theme2 === mode ? "bg-background-lighter" : ""}`,
                children: [
                  /* @__PURE__ */ jsx("span", { "aria-hidden": true, children: icons2[mode] }),
                  /* @__PURE__ */ jsx("span", { children: t(`theme.${mode}`) })
                ]
              },
              mode
            ))
          }
        )
      ]
    }
  );
}
class Route {
  /**
   * @param {String} name - Route name.
   * @param {Object} definition - Route definition.
   * @param {Object} config - Ziggy configuration.
   */
  constructor(name, definition, config) {
    this.name = name;
    this.definition = definition;
    this.bindings = definition.bindings ?? {};
    this.wheres = definition.wheres ?? {};
    this.config = config;
  }
  /**
   * Get a 'template' of the complete URL for this route.
   *
   * @example
   * https://{team}.ziggy.dev/user/{user}
   *
   * @return {String} Route template.
   */
  get template() {
    const template = `${this.origin}/${this.definition.uri}`.replace(/\/+$/, "");
    return template === "" ? "/" : template;
  }
  /**
   * Get a template of the origin for this route.
   *
   * @example
   * https://{team}.ziggy.dev/
   *
   * @return {String} Route origin template.
   */
  get origin() {
    return !this.config.absolute ? "" : this.definition.domain ? `${this.config.url.match(/^\w+:\/\//)[0]}${this.definition.domain}${this.config.port ? `:${this.config.port}` : ""}` : this.config.url;
  }
  /**
   * Get an array of objects representing the parameters that this route accepts.
   *
   * @example
   * [{ name: 'team', required: true }, { name: 'user', required: false }]
   *
   * @return {Array} Parameter segments.
   */
  get parameterSegments() {
    var _a;
    return ((_a = this.template.match(/{[^}?]+\??}/g)) == null ? void 0 : _a.map((segment) => ({
      name: segment.replace(/{|\??}/g, ""),
      required: !/\?}$/.test(segment)
    }))) ?? [];
  }
  /**
   * Get whether this route's template matches the given URL.
   *
   * @param {String} url - URL to check.
   * @return {Object|false} - If this route matches, returns the matched parameters.
   */
  matchesUrl(url) {
    if (!this.definition.methods.includes("GET")) return false;
    const pattern = this.template.replace(/[.*+$()[\]]/g, "\\$&").replace(/(\/?){([^}?]*)(\??)}/g, (_, slash, segment, optional) => {
      var _a;
      const regex = `(?<${segment}>${((_a = this.wheres[segment]) == null ? void 0 : _a.replace(/(^\^)|(\$$)/g, "")) || "[^/?]+"})`;
      return optional ? `(${slash}${regex})?` : `${slash}${regex}`;
    }).replace(/^\w+:\/\//, "");
    const [location, query] = url.replace(/^\w+:\/\//, "").split("?");
    const matches = new RegExp(`^${pattern}/?$`).exec(location) ?? new RegExp(`^${pattern}/?$`).exec(decodeURI(location));
    if (matches) {
      for (const k in matches.groups) {
        matches.groups[k] = typeof matches.groups[k] === "string" ? decodeURIComponent(matches.groups[k]) : matches.groups[k];
      }
      return { params: matches.groups, query: parse(query) };
    }
    return false;
  }
  /**
   * Hydrate and return a complete URL for this route with the given parameters.
   *
   * @param {Object} params
   * @return {String}
   */
  compile(params) {
    const segments = this.parameterSegments;
    if (!segments.length) return this.template;
    return this.template.replace(/{([^}?]+)(\??)}/g, (_, segment, optional) => {
      if (!optional && [null, void 0].includes(params[segment])) {
        throw new Error(
          `Ziggy error: '${segment}' parameter is required for route '${this.name}'.`
        );
      }
      if (this.wheres[segment]) {
        if (!new RegExp(
          `^${optional ? `(${this.wheres[segment]})?` : this.wheres[segment]}$`
        ).test(params[segment] ?? "")) {
          throw new Error(
            `Ziggy error: '${segment}' parameter '${params[segment]}' does not match required format '${this.wheres[segment]}' for route '${this.name}'.`
          );
        }
      }
      return encodeURI(params[segment] ?? "").replace(/%7C/g, "|").replace(/%25/g, "%").replace(/\$/g, "%24");
    }).replace(this.config.absolute ? /(\.[^/]+?)(\/\/)/ : /(^)(\/\/)/, "$1/").replace(/\/+$/, "");
  }
}
class Router extends String {
  /**
   * @param {String} [name] - Route name.
   * @param {(String|Number|Array|Object)} [params] - Route parameters.
   * @param {Boolean} [absolute] - Whether to include the URL origin.
   * @param {Object} [config] - Ziggy configuration.
   */
  constructor(name, params, absolute = true, config) {
    super();
    this._config = config ?? (typeof Ziggy !== "undefined" ? Ziggy : globalThis == null ? void 0 : globalThis.Ziggy);
    this._config = { ...this._config, absolute };
    if (name) {
      if (!this._config.routes[name]) {
        throw new Error(`Ziggy error: route '${name}' is not in the route list.`);
      }
      this._route = new Route(name, this._config.routes[name], this._config);
      this._params = this._parse(params);
    }
  }
  /**
   * Get the compiled URL string for the current route and parameters.
   *
   * @example
   * // with 'posts.show' route 'posts/{post}'
   * (new Router('posts.show', 1)).toString(); // 'https://ziggy.dev/posts/1'
   *
   * @return {String}
   */
  toString() {
    const unhandled = Object.keys(this._params).filter((key) => !this._route.parameterSegments.some(({ name }) => name === key)).filter((key) => key !== "_query").reduce((result, current) => ({ ...result, [current]: this._params[current] }), {});
    return this._route.compile(this._params) + stringify(
      { ...unhandled, ...this._params["_query"] },
      {
        addQueryPrefix: true,
        arrayFormat: "indices",
        encodeValuesOnly: true,
        skipNulls: true,
        encoder: (value, encoder) => typeof value === "boolean" ? Number(value) : encoder(value)
      }
    );
  }
  /**
   * Get the parameters, values, and metadata from the given URL.
   *
   * @param {String} [url] - The URL to inspect, defaults to the current window URL.
   * @return {{ name: string, params: Object, query: Object, route: Route }}
   */
  _unresolve(url) {
    if (!url) {
      url = this._currentUrl();
    } else if (this._config.absolute && url.startsWith("/")) {
      url = this._location().host + url;
    }
    let matchedParams = {};
    const [name, route2] = Object.entries(this._config.routes).find(
      ([name2, route3]) => matchedParams = new Route(name2, route3, this._config).matchesUrl(url)
    ) || [void 0, void 0];
    return { name, ...matchedParams, route: route2 };
  }
  _currentUrl() {
    const { host, pathname, search } = this._location();
    return (this._config.absolute ? host + pathname : pathname.replace(this._config.url.replace(/^\w*:\/\/[^/]+/, ""), "").replace(/^\/+/, "/")) + search;
  }
  /**
   * Get the name of the route matching the current window URL, or, given a route name
   * and parameters, check if the current window URL and parameters match that route.
   *
   * @example
   * // at URL https://ziggy.dev/posts/4 with 'posts.show' route 'posts/{post}'
   * route().current(); // 'posts.show'
   * route().current('posts.index'); // false
   * route().current('posts.show'); // true
   * route().current('posts.show', { post: 1 }); // false
   * route().current('posts.show', { post: 4 }); // true
   *
   * @param {String} [name] - Route name to check.
   * @param {(String|Number|Array|Object)} [params] - Route parameters.
   * @return {(Boolean|String|undefined)}
   */
  current(name, params) {
    const { name: current, params: currentParams, query, route: route2 } = this._unresolve();
    if (!name) return current;
    const match = new RegExp(`^${name.replace(/\./g, "\\.").replace(/\*/g, ".*")}$`).test(
      current
    );
    if ([null, void 0].includes(params) || !match) return match;
    const routeObject = new Route(current, route2, this._config);
    params = this._parse(params, routeObject);
    const routeParams = { ...currentParams, ...query };
    if (Object.values(params).every((p) => !p) && !Object.values(routeParams).some((v) => v !== void 0))
      return true;
    const isSubset = (subset, full) => {
      return Object.entries(subset).every(([key, value]) => {
        if (Array.isArray(value) && Array.isArray(full[key])) {
          return value.every((v) => full[key].includes(v));
        }
        if (typeof value === "object" && typeof full[key] === "object" && value !== null && full[key] !== null) {
          return isSubset(value, full[key]);
        }
        return full[key] == value;
      });
    };
    return isSubset(params, routeParams);
  }
  /**
   * Get an object representing the current location (by default this will be
   * the JavaScript `window` global if it's available).
   *
   * @return {Object}
   */
  _location() {
    var _a, _b, _c;
    const {
      host = "",
      pathname = "",
      search = ""
    } = typeof window !== "undefined" ? window.location : {};
    return {
      host: ((_a = this._config.location) == null ? void 0 : _a.host) ?? host,
      pathname: ((_b = this._config.location) == null ? void 0 : _b.pathname) ?? pathname,
      search: ((_c = this._config.location) == null ? void 0 : _c.search) ?? search
    };
  }
  /**
   * Get all parameter values from the current window URL.
   *
   * @example
   * // at URL https://tighten.ziggy.dev/posts/4?lang=en with 'posts.show' route 'posts/{post}' and domain '{team}.ziggy.dev'
   * route().params; // { team: 'tighten', post: 4, lang: 'en' }
   *
   * @return {Object}
   */
  get params() {
    const { params, query } = this._unresolve();
    return { ...params, ...query };
  }
  get routeParams() {
    return this._unresolve().params;
  }
  get queryParams() {
    return this._unresolve().query;
  }
  /**
   * Check whether the given route exists.
   *
   * @param {String} name
   * @return {Boolean}
   */
  has(name) {
    return this._config.routes.hasOwnProperty(name);
  }
  /**
   * Parse Laravel-style route parameters of any type into a normalized object.
   *
   * @example
   * // with route parameter names 'event' and 'venue'
   * _parse(1); // { event: 1 }
   * _parse({ event: 2, venue: 3 }); // { event: 2, venue: 3 }
   * _parse(['Taylor', 'Matt']); // { event: 'Taylor', venue: 'Matt' }
   * _parse([4, { uuid: 56789, name: 'Grand Canyon' }]); // { event: 4, venue: 56789 }
   *
   * @param {(String|Number|Array|Object)} params - Route parameters.
   * @param {Route} route - Route instance.
   * @return {Object} Normalized complete route parameters.
   */
  _parse(params = {}, route2 = this._route) {
    params ?? (params = {});
    params = ["string", "number"].includes(typeof params) ? [params] : params;
    const segments = route2.parameterSegments.filter(({ name }) => !this._config.defaults[name]);
    if (Array.isArray(params)) {
      params = params.reduce(
        (result, current, i) => segments[i] ? { ...result, [segments[i].name]: current } : typeof current === "object" ? { ...result, ...current } : { ...result, [current]: "" },
        {}
      );
    } else if (segments.length === 1 && !params[segments[0].name] && (params.hasOwnProperty(Object.values(route2.bindings)[0]) || params.hasOwnProperty("id"))) {
      params = { [segments[0].name]: params };
    }
    return {
      ...this._defaults(route2),
      ...this._substituteBindings(params, route2)
    };
  }
  /**
   * Populate default parameters for the given route.
   *
   * @example
   * // with default parameters { locale: 'en', country: 'US' } and 'posts.show' route '{locale}/posts/{post}'
   * defaults(...); // { locale: 'en' }
   *
   * @param {Route} route
   * @return {Object} Default route parameters.
   */
  _defaults(route2) {
    return route2.parameterSegments.filter(({ name }) => this._config.defaults[name]).reduce(
      (result, { name }, i) => ({ ...result, [name]: this._config.defaults[name] }),
      {}
    );
  }
  /**
   * Substitute Laravel route model bindings in the given parameters.
   *
   * @example
   * _substituteBindings({ post: { id: 4, slug: 'hello-world', title: 'Hello, world!' } }, { bindings: { post: 'slug' } }); // { post: 'hello-world' }
   *
   * @param {Object} params - Route parameters.
   * @param {Object} route - Route definition.
   * @return {Object} Normalized route parameters.
   */
  _substituteBindings(params, { bindings, parameterSegments }) {
    return Object.entries(params).reduce((result, [key, value]) => {
      if (!value || typeof value !== "object" || Array.isArray(value) || !parameterSegments.some(({ name }) => name === key)) {
        return { ...result, [key]: value };
      }
      if (!value.hasOwnProperty(bindings[key])) {
        if (value.hasOwnProperty("id")) {
          bindings[key] = "id";
        } else {
          throw new Error(
            `Ziggy error: object passed as '${key}' parameter is missing route model binding key '${bindings[key]}'.`
          );
        }
      }
      return { ...result, [key]: value[bindings[key]] };
    }, {});
  }
  valueOf() {
    return this.toString();
  }
}
function route$1(name, params, absolute, config) {
  const router2 = new Router(name, params, absolute, config);
  return name ? router2.toString() : router2;
}
function LogOutIcon({
  className,
  width = 24,
  height = 24,
  onClick
}) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width,
      height,
      viewBox: "0 0 20 21",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      className,
      onClick,
      children: [
        /* @__PURE__ */ jsxs("title", { children: [
          " ",
          t("icons.title.logOut")
        ] }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M13.3333 14.6667L17.5 10.5M17.5 10.5L13.3333 6.33333M17.5 10.5H7.5M7.5 3H6.5C5.09987 3 4.3998 3 3.86502 3.27248C3.39462 3.51217 3.01217 3.89462 2.77248 4.36502C2.5 4.8998 2.5 5.59987 2.5 7V14C2.5 15.4001 2.5 16.1002 2.77248 16.635C3.01217 17.1054 3.39462 17.4878 3.86502 17.7275C4.3998 18 5.09987 18 6.5 18H7.5",
            stroke: "currentColor",
            strokeWidth: "1.66667",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        )
      ]
    }
  );
}
function LoginIcon({
  className,
  width = 24,
  height = 24,
  onClick
}) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width,
      height,
      viewBox: "0 0 20 21",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      className,
      onClick,
      children: [
        /* @__PURE__ */ jsxs("title", { children: [
          " ",
          t("icons.title.login")
        ] }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M6.66667 14.6667L2.5 10.5M2.5 10.5L6.66667 6.33333M2.5 10.5H12.5M12.5 3H13.5C14.9001 3 15.6002 3 16.135 3.27248C16.6054 3.51217 16.9878 3.89462 17.2275 4.36502C17.5 4.8998 17.5 5.59987 17.5 7V14C17.5 15.4001 17.5 16.1002 17.2275 16.635C16.9878 17.1054 16.6054 17.4878 16.135 17.7275C15.6002 18 14.9001 18 13.5 18H12.5",
            stroke: "currentColor",
            strokeWidth: "1.66667",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        )
      ]
    }
  );
}
function RegisterUserIcon({
  className,
  width = 24,
  height = 24,
  onClick
}) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width,
      height,
      viewBox: "0 0 20 21",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      className,
      onClick,
      children: [
        /* @__PURE__ */ jsx("title", { children: t("icons.title.register") }),
        /* @__PURE__ */ jsx(
          "circle",
          {
            cx: "10",
            cy: "7",
            r: "3",
            stroke: "currentColor",
            strokeWidth: "1.66667"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M5 18C5 15.7909 6.79086 14 9 14H11C13.2091 14 15 15.7909 15 18",
            stroke: "currentColor",
            strokeWidth: "1.66667",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M16 8.5H18M17 7.5V9.5",
            stroke: "currentColor",
            strokeWidth: "1.66667",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        )
      ]
    }
  );
}
function UserAvatar({ size = "size-9", ...props }) {
  return /* @__PURE__ */ jsx(
    "img",
    {
      src: props.imageUrl,
      alt: "avatar",
      className: "rounded-full " + size,
      "aria-label": "User avatar"
    }
  );
}
function useEscapeKey(onEscape) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onEscape();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onEscape]);
}
function CloseIcon({
  color = "#344054",
  width = 24,
  height = 24
}) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width,
      height,
      viewBox: "0 0 25 24",
      fill: "none",
      children: [
        /* @__PURE__ */ jsxs("title", { children: [
          " ",
          t("icons.title.close")
        ] }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M 4.9902344 3.9902344 A 1.0001 1.0001 0 0 0 4.2929688 5.7070312 L 10.585938 12 L 4.2929688 18.292969 A 1.0001 1.0001 0 1 0 5.7070312 19.707031 L 12 13.414062 L 18.292969 19.707031 A 1.0001 1.0001 0 1 0 19.707031 18.292969 L 13.414062 12 L 19.707031 5.7070312 A 1.0001 1.0001 0 0 0 18.980469 3.9902344 A 1.0001 1.0001 0 0 0 18.292969 4.2929688 L 12 10.585938 L 5.7070312 4.2929688 A 1.0001 1.0001 0 0 0 4.9902344 3.9902344 z",
            fill: color
          }
        )
      ]
    }
  );
}
function ModalSidebar({ isOpen = false, title, children, onClose }) {
  const sidebarRef = useRef(null);
  const { t } = useTranslation();
  useEscapeKey(() => onClose());
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      sidebarRef.current.focus();
    }
  }, [isOpen]);
  return /* @__PURE__ */ jsxs(
    "aside",
    {
      id: "sidebar-modal",
      role: "dialog",
      "aria-labelledby": "modal-sidebar-title",
      "aria-modal": "true",
      ref: sidebarRef,
      className: `fixed inset-0 z-40 ${isOpen ? "block" : "hidden"}`,
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "fixed inset-0 bg-dark opacity-50",
            onClick: onClose,
            "aria-label": t("navigation.sidebar.close"),
            "aria-expanded": isOpen,
            "aria-controls": "sidebar-modal"
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "fixed right-0 top-0 z-50 h-full w-full bg-background shadow-lg focus:outline-none sm:w-96",
            tabIndex: 0,
            children: [
              /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between border-b border-border-primary px-6 py-4", children: [
                /* @__PURE__ */ jsx(
                  "h2",
                  {
                    id: "modal-sidebar-title",
                    className: "text-2 font-semibold text-content",
                    children: title
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    onClick: onClose,
                    ariaLabel: t("navigation.sidebar.close"),
                    "aria-expanded": isOpen,
                    "aria-controls": "sidebar-modal",
                    className: "inline-flex items-center rounded px-2 py-1 text-4 hover:bg-dark",
                    children: /* @__PURE__ */ jsx(CloseIcon, { width: 18, height: 18 })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col gap-6 px-6", children: [
                /* @__PURE__ */ jsx("div", { className: "mt-6 flex h-6 shrink-0 items-center justify-center px-6", children: /* @__PURE__ */ jsx(CatalystLogo, { className: "object-contain" }) }),
                /* @__PURE__ */ jsx("section", { className: "overflow-y-auto", children })
              ] })
            ]
          }
        )
      ]
    }
  );
}
function InputLabel({
  value,
  className = "",
  children,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "label",
    {
      ...props,
      className: `block text-4 font-medium text-dark ` + className,
      children: value ? value : children
    }
  );
}
const TextInput = forwardRef(function TextInput2({
  type = "text",
  className = "",
  isFocused = false,
  ...props
}, ref) {
  const localRef = useRef(null);
  useImperativeHandle(ref, () => ({
    focus: () => {
      var _a;
      return (_a = localRef.current) == null ? void 0 : _a.focus();
    }
  }));
  useEffect(() => {
    var _a;
    if (isFocused) {
      (_a = localRef.current) == null ? void 0 : _a.focus();
    }
  }, [isFocused]);
  return /* @__PURE__ */ jsx(
    "input",
    {
      ...props,
      type,
      className: "bg-background rounded-md border-border-primary border-opacity-40 shadow-sm focus:border-primary text-content" + className,
      ref: localRef
    }
  );
});
function InputError({
  message,
  className = "",
  ...props
}) {
  return message ? /* @__PURE__ */ jsx(
    "p",
    {
      ...props,
      className: "text-4 text-error " + className,
      children: message
    }
  ) : null;
}
function PrimaryButton({
  className = "",
  disabled,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      ...props,
      className: `inline-flex items-center rounded-md bg-gradient-to-t from-background-button-gradient-color-1 to-background-button-gradient-color-2 shadow-md px-4 py-2 text-4 font-semibold uppercase tracking-widest text-content-light transition duration-150 ease-in-out hover:bg-background-tertiary hover:text-content-secondary focus:outline-none focus:ring-2 focus:bg-background-accent focus:ring-offset-2 active:bg-background-tertiary active:text-content-secondary  ${disabled && "opacity-25"} ` + className,
      disabled,
      children
    }
  );
}
function RegisterForm() {
  const { data: data2, setData, post, processing, errors, reset } = useForm({
    name: "",
    email: "",
    password: "",
    password_confirmation: ""
  });
  const submit = (e) => {
    e.preventDefault();
    post(route("register"), {
      onFinish: () => reset("password", "password_confirmation")
    });
  };
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "flex flex-col content-gap", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Name" }),
      /* @__PURE__ */ jsx(
        TextInput,
        {
          id: "name",
          name: "name",
          value: data2.name,
          className: "mt-1 block w-full",
          autoComplete: "name",
          isFocused: true,
          onChange: (e) => setData("name", e.target.value),
          required: true
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-2" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(InputLabel, { htmlFor: "email", value: "Email" }),
      /* @__PURE__ */ jsx(
        TextInput,
        {
          id: "email",
          type: "email",
          name: "email",
          value: data2.email,
          className: "mt-1 block w-full",
          autoComplete: "username",
          onChange: (e) => setData("email", e.target.value),
          required: true
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.email, className: "mt-2" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(InputLabel, { htmlFor: "password", value: "Password" }),
      /* @__PURE__ */ jsx(
        TextInput,
        {
          id: "password",
          type: "password",
          name: "password",
          value: data2.password,
          className: "mt-1 block w-full",
          autoComplete: "new-password",
          onChange: (e) => setData("password", e.target.value),
          required: true
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "text-4 text-dark mt-1", children: t("registration.passwordCharacters") }),
      /* @__PURE__ */ jsx(InputError, { message: errors.password, className: "mt-2" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(
        InputLabel,
        {
          htmlFor: "password_confirmation",
          value: "Confirm Password"
        }
      ),
      /* @__PURE__ */ jsx(
        TextInput,
        {
          id: "password_confirmation",
          type: "password",
          name: "password_confirmation",
          value: data2.password_confirmation,
          className: "mt-1 block w-full",
          autoComplete: "new-password",
          onChange: (e) => setData("password_confirmation", e.target.value),
          required: true
        }
      ),
      /* @__PURE__ */ jsx(
        InputError,
        {
          message: errors.password_confirmation,
          className: "mt-2"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(PrimaryButton, { className: "w-full h-10 flex items-center justify-center rounded-md", disabled: processing, type: "submit", children: t("getStarted") }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex w-full items-center justify-center", children: [
      /* @__PURE__ */ jsx("span", { className: "mr-2", children: t("registration.alreadyRegistered") }),
      /* @__PURE__ */ jsx(
        Link,
        {
          href: route("login"),
          className: "rounded-md text-primary font-bold hover:text-content focus:outline-none focus:ring-2 focus:ring-offset-2",
          children: t("login")
        }
      )
    ] })
  ] });
}
const RegisterForm$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: RegisterForm
}, Symbol.toStringTag, { value: "Module" }));
const UserDetails = ({ user }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const logout = () => {
    axios.post(route$1("logout")).then((response) => {
      router.get("/");
    }).catch((error) => {
      console.log(error);
    });
  };
  return /* @__PURE__ */ jsx(Fragment, { children: user ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "size-9 rounded-full bg-background-light", children: /* @__PURE__ */ jsx(UserAvatar, { imageUrl: user.profile_photo_url }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            href: "/dashboard",
            className: "text-4 font-semibold text-content",
            children: user == null ? void 0 : user.name
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-5 text-content", children: user == null ? void 0 : user.email }),
        /* @__PURE__ */ jsx(
          Link,
          {
            href: "/profile",
            className: "text-5 font-semibold text-primary",
            children: t("users.editProfile")
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      LogOutIcon,
      {
        className: "cursor-pointer text-dark hover:text-hover",
        width: 20,
        height: 20,
        onClick: () => logout()
      }
    ),
    /* @__PURE__ */ jsx("div", {})
  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("nav", { className: "flex flex-col justify-between", children: /* @__PURE__ */ jsxs("ul", { className: "flex flex-1 flex-col menu-gap-y", children: [
      /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-3 px-3 py-1 hover:bg-background-lighter cursor-pointer", onClick: () => setIsModalOpen(true), children: [
        /* @__PURE__ */ jsx(RegisterUserIcon, { className: "text-dark" }),
        /* @__PURE__ */ jsx("p", { className: "text-3", children: t("register") })
      ] }),
      /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-3 px-3 py-1 hover:bg-background-lighter cursor-pointer", children: [
        /* @__PURE__ */ jsx(LoginIcon, { className: "text-dark" }),
        /* @__PURE__ */ jsx("p", { className: "text-3", children: t("login") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(
      ModalSidebar,
      {
        title: "Register",
        isOpen: isModalOpen,
        onClose: () => setIsModalOpen(false),
        children: /* @__PURE__ */ jsx(RegisterForm, {})
      }
    )
  ] }) });
};
function BookMarkCheckIcon({
  className,
  width = 24,
  height = 24
}) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width,
      height,
      viewBox: "0 0 16 21",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      className,
      children: [
        /* @__PURE__ */ jsxs("title", { children: [
          " ",
          t("icons.title.bookmark")
        ] }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M5 9L7 11L11.5 6.5M15 19.5V6.3C15 4.61984 15 3.77976 14.673 3.13803C14.3854 2.57354 13.9265 2.1146 13.362 1.82698C12.7202 1.5 11.8802 1.5 10.2 1.5H5.8C4.11984 1.5 3.27976 1.5 2.63803 1.82698C2.07354 2.1146 1.6146 2.57354 1.32698 3.13803C1 3.77976 1 4.61984 1 6.3V19.5L8 15.5L15 19.5Z",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        )
      ]
    }
  );
}
function BucketIcon({
  className,
  width = 24,
  height = 24
}) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width,
      height,
      viewBox: "0 0 22 21",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      className,
      children: [
        /* @__PURE__ */ jsxs("title", { children: [
          " ",
          t("icons.title.bucket")
        ] }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M19.5 6.5V14.7C19.5 16.3802 19.5 17.2202 19.173 17.862C18.8854 18.4265 18.4265 18.8854 17.862 19.173C17.2202 19.5 16.3802 19.5 14.7 19.5H7.3C5.61984 19.5 4.77976 19.5 4.13803 19.173C3.57354 18.8854 3.1146 18.4265 2.82698 17.862C2.5 17.2202 2.5 16.3802 2.5 14.7V6.5M2.6 1.5H19.4C19.9601 1.5 20.2401 1.5 20.454 1.60899C20.6422 1.70487 20.7951 1.85785 20.891 2.04601C21 2.25992 21 2.53995 21 3.1V4.9C21 5.46005 21 5.74008 20.891 5.95399C20.7951 6.14215 20.6422 6.29513 20.454 6.39101C20.2401 6.5 19.9601 6.5 19.4 6.5H2.6C2.03995 6.5 1.75992 6.5 1.54601 6.39101C1.35785 6.29513 1.20487 6.14215 1.10899 5.95399C1 5.74008 1 5.46005 1 4.9V3.1C1 2.53995 1 2.25992 1.10899 2.04601C1.20487 1.85785 1.35785 1.70487 1.54601 1.60899C1.75992 1.5 2.03995 1.5 2.6 1.5ZM8.6 10H13.4C13.9601 10 14.2401 10 14.454 10.109C14.6422 10.2049 14.7951 10.3578 14.891 10.546C15 10.7599 15 11.0399 15 11.6V12.4C15 12.9601 15 13.2401 14.891 13.454C14.7951 13.6422 14.6422 13.7951 14.454 13.891C14.2401 14 13.9601 14 13.4 14H8.6C8.03995 14 7.75992 14 7.54601 13.891C7.35785 13.7951 7.20487 13.6422 7.10899 13.454C7 13.2401 7 12.9601 7 12.4V11.6C7 11.0399 7 10.7599 7.10899 10.546C7.20487 10.3578 7.35785 10.2049 7.54601 10.109C7.75992 10 8.03995 10 8.6 10Z",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        )
      ]
    }
  );
}
function FolderIcon({
  className,
  width = 24,
  height = 24
}) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width,
      height,
      viewBox: "0 0 24 25",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      className,
      children: [
        /* @__PURE__ */ jsxs("title", { children: [
          " ",
          t("icons.title.folder")
        ] }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M13 7.5L11.8845 5.26892C11.5634 4.6268 11.4029 4.30573 11.1634 4.07116C10.9516 3.86373 10.6963 3.70597 10.4161 3.60931C10.0992 3.5 9.74021 3.5 9.02229 3.5H5.2C4.0799 3.5 3.51984 3.5 3.09202 3.71799C2.71569 3.90973 2.40973 4.21569 2.21799 4.59202C2 5.01984 2 5.5799 2 6.7V7.5M2 7.5H17.2C18.8802 7.5 19.7202 7.5 20.362 7.82698C20.9265 8.1146 21.3854 8.57354 21.673 9.13803C22 9.77976 22 10.6198 22 12.3V16.7C22 18.3802 22 19.2202 21.673 19.862C21.3854 20.4265 20.9265 20.8854 20.362 21.173C19.7202 21.5 18.8802 21.5 17.2 21.5H6.8C5.11984 21.5 4.27976 21.5 3.63803 21.173C3.07354 20.8854 2.6146 20.4265 2.32698 19.862C2 19.2202 2 18.3802 2 16.7V7.5Z",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        )
      ]
    }
  );
}
function MailIcon({
  className,
  width = 24,
  height = 24
}) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width,
      height,
      viewBox: "0 0 22 22",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      className,
      children: [
        /* @__PURE__ */ jsxs("title", { children: [
          " ",
          t("icons.title.mail")
        ] }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M12.744 2.13346L20.272 7.02667C20.538 7.19957 20.671 7.28602 20.7674 7.40134C20.8527 7.50342 20.9167 7.62149 20.9558 7.74865C21 7.89229 21 8.05092 21 8.36818V15.6999C21 17.38 21 18.2201 20.673 18.8619C20.3854 19.4263 19.9265 19.8853 19.362 20.1729C18.7202 20.4999 17.8802 20.4999 16.2 20.4999H5.8C4.11984 20.4999 3.27976 20.4999 2.63803 20.1729C2.07354 19.8853 1.6146 19.4263 1.32698 18.8619C1 18.2201 1 17.38 1 15.6999V8.36818C1 8.05092 1 7.89229 1.04417 7.74865C1.08327 7.62149 1.14735 7.50342 1.23265 7.40134C1.32901 7.28602 1.46201 7.19957 1.72802 7.02667L9.25604 2.13346M12.744 2.13346C12.1127 1.72315 11.7971 1.51799 11.457 1.43817C11.1564 1.36761 10.8436 1.36761 10.543 1.43817C10.2029 1.51799 9.88728 1.72315 9.25604 2.13346M12.744 2.13346L18.9361 6.15837C19.624 6.60547 19.9679 6.82902 20.087 7.11252C20.1911 7.36027 20.1911 7.63949 20.087 7.88724C19.9679 8.17074 19.624 8.39429 18.9361 8.84139L12.744 12.8663C12.1127 13.2766 11.7971 13.4818 11.457 13.5616C11.1564 13.6321 10.8436 13.6321 10.543 13.5616C10.2029 13.4818 9.88728 13.2766 9.25604 12.8663L3.06386 8.84139C2.37601 8.39429 2.03209 8.17074 1.91297 7.88724C1.80888 7.63949 1.80888 7.36027 1.91297 7.11252C2.03209 6.82902 2.37601 6.60547 3.06386 6.15837L9.25604 2.13346M20.5 18.4999L13.8572 12.4999M8.14282 12.4999L1.5 18.4999",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        )
      ]
    }
  );
}
function UserNavigation() {
  const { t } = useTranslation();
  const navItems = [
    {
      href: "/bookmarks",
      title: t("bookmarks"),
      icon: /* @__PURE__ */ jsx(BookMarkCheckIcon, { className: "text-dark" })
    },
    {
      href: "/votes",
      title: t("votes"),
      icon: /* @__PURE__ */ jsx(BucketIcon, { className: "text-dark" })
    },
    {
      href: "/knowledge-base",
      title: t("knowledgeBase"),
      icon: /* @__PURE__ */ jsx(FolderIcon, { className: "text-dark" })
    },
    {
      href: "/support",
      title: t("support"),
      icon: /* @__PURE__ */ jsx(MailIcon, { className: "text-dark" })
    }
  ];
  return /* @__PURE__ */ jsx("nav", { className: "", children: /* @__PURE__ */ jsx("ul", { className: "flex flex-1 flex-col menu-gap-y", children: navItems.map(({ href, title, icon }) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLinkItem, { href, title, prefetch: true, children: icon }) }, href)) }) });
}
function DesktopSidebar(props) {
  const { t } = useTranslation();
  const { auth } = usePage().props;
  const { ...rest } = props;
  return /* @__PURE__ */ jsxs(
    "aside",
    {
      ...rest,
      className: "justify-between flex flex-col h-full",
      "aria-label": t("navigation.desktop.sidebar"),
      children: [
        /* @__PURE__ */ jsxs("section", { className: "flex grow flex-col gap-6 overflow-y-auto sm:pt-8", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-6 shrink-0 items-center px-6", children: /* @__PURE__ */ jsx(CatalystLogo, { className: "w-full" }) }),
          /* @__PURE__ */ jsx(AppNavigation, {})
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "flex flex-col gap-6", children: [
          /* @__PURE__ */ jsx("div", { className: "px-4", children: /* @__PURE__ */ jsx("div", { className: "border-t border-border pt-6", children: /* @__PURE__ */ jsx(UserNavigation, {}) }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 border-t border-border pt-6", children: [
            /* @__PURE__ */ jsx("div", { className: "px-4", children: /* @__PURE__ */ jsx(UserDetails, { user: auth == null ? void 0 : auth.user }) }),
            /* @__PURE__ */ jsx("div", { className: "py-4 px-4 bg-background-darker", children: /* @__PURE__ */ jsx(ThemeSwitcher, {}) })
          ] })
        ] })
      ]
    }
  );
}
const catalystWhiteLogo = "/build/assets/catalyst-explorer-all-white-logo-KCl_Z_6r.png";
function Footer() {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-96 w-full flex-col justify-between gap-16 rounded-t-xl bg-gradient-to-r from-[var(--cx-background-gradient-1-dark)] to-[var(--cx-background-gradient-1-dark)] pb-12 pt-16", children: [
    /* @__PURE__ */ jsx("section", { className: "container text-content-light", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex min-w-24 flex-col title-gap-y", children: [
        /* @__PURE__ */ jsx("h5", { className: "title-6", children: t("proposals.proposals") }),
        /* @__PURE__ */ jsxs("ul", { className: "menu-gap-y flex flex-col", children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("p", { children: t("proposals.allProposals") }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("p", { children: t("proposalReviews") }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("p", { children: t("monthlyReports") }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("p", { children: t("funds") }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex min-w-24 flex-col title-gap-y", children: [
        /* @__PURE__ */ jsx("h5", { className: "title-6", children: t("people") }),
        /* @__PURE__ */ jsxs("ul", { className: "flex flex-col menu-gap-y", children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("p", { children: t("proposers") }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("p", { children: t("groups") }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("p", { children: t("communities") }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("p", { children: t("dReps") }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex min-w-24 flex-col title-gap-y", children: [
        /* @__PURE__ */ jsx("h5", { className: "title-6", children: t("data") }),
        /* @__PURE__ */ jsxs("ul", { className: "flex flex-col menu-gap-y", children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("p", { children: t("numbers") }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("p", { children: t("ccv4Votes") }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("p", { children: t("catalystAPI") }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("p", { children: t("proposalCSVs") }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex min-w-24 flex-col title-gap-y", children: [
        /* @__PURE__ */ jsx("h5", { className: "title-6", children: t("social") }),
        /* @__PURE__ */ jsxs("ul", { className: "flex flex-col menu-gap-y", children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("p", { children: t("twitter") }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("p", { children: t("linkedIn") }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("p", { children: t("facebook") }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("p", { children: t("github") }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex min-w-24 flex-col title-gap-y", children: [
        /* @__PURE__ */ jsx("h5", { className: "title-6", children: t("legal") }),
        /* @__PURE__ */ jsxs("ul", { className: "flex flex-col menu-gap-y", children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("p", { children: t("terms") }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("p", { children: t("privacy") }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("p", { children: t("cookies") }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("p", { children: t("licenses") }) })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "container", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-t pt-8", children: [
      /* @__PURE__ */ jsx("div", { className: "", children: /* @__PURE__ */ jsx(
        "img",
        {
          className: "h-8",
          src: catalystWhiteLogo,
          alt: t("app.appLogoAlt")
        }
      ) }),
      /* @__PURE__ */ jsx("p", { className: "text-base font-normal text-gray-300", children: t("copyright") })
    ] }) })
  ] });
}
function MobileNavigation() {
  const { t } = useTranslation();
  const { auth } = usePage().props;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 top-16 flex", children: /* @__PURE__ */ jsx(
    DialogPanel,
    {
      transition: true,
      className: "relative flex w-full flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full",
      children: /* @__PURE__ */ jsxs(
        "aside",
        {
          className: "flex grow flex-col justify-between bg-background px-4",
          "aria-label": t("navigation.mobile.content"),
          children: [
            /* @__PURE__ */ jsx("section", { children: /* @__PURE__ */ jsx(AppNavigation, {}) }),
            /* @__PURE__ */ jsxs("section", { className: "flex flex-col gap-6 px-4 pb-8", children: [
              /* @__PURE__ */ jsx(ThemeSwitcher, {}),
              /* @__PURE__ */ jsx(UserNavigation, {}),
              /* @__PURE__ */ jsx(UserDetails, { user: auth == null ? void 0 : auth.user })
            ] })
          ]
        }
      )
    }
  ) });
}
function MenuIcon({
  color = "#344054",
  width = 24,
  height = 24
}) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width,
      height,
      viewBox: "0 0 25 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        /* @__PURE__ */ jsxs("title", { children: [
          " ",
          t("icons.title.menu")
        ] }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M3.5 12H15.5M3.5 6H21.5M3.5 18H21.5",
            stroke: color,
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        )
      ]
    }
  );
}
function MainLayout({ children }) {
  return /* @__PURE__ */ jsx("section", { children: /* @__PURE__ */ jsx(ThemeProvider, { children }) });
}
function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(MainLayout, { children: [
    /* @__PURE__ */ jsx(
      Dialog,
      {
        id: "mobile-navigation",
        open: sidebarOpen,
        onClose: () => setSidebarOpen(false),
        className: "relative z-30 sm:hidden",
        "aria-label": t("navigation.mobile.sidebar"),
        children: /* @__PURE__ */ jsx(MobileNavigation, {})
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "sm:z-30 sm:flex sm:w-72 bg-background hidden sm:fixed sm:inset-y-0 h-full", children: /* @__PURE__ */ jsx(DesktopSidebar, {}) }),
    /* @__PURE__ */ jsxs("section", { className: "sm:ml-72 bg-background-lighter sm:mt-4 sm:rounded-tl-4xl", children: [
      /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-30 border-b border-gray-200 bg-background sm:hidden", children: /* @__PURE__ */ jsxs("div", { className: "flex h-16 items-center justify-between px-4", children: [
        /* @__PURE__ */ jsx(CatalystLogo, { className: "h-8" }),
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: () => setSidebarOpen(!sidebarOpen),
            ariaLabel: sidebarOpen ? t("navigation.sidebar.close") : t("navigation.sidebar.open"),
            "aria-expanded": sidebarOpen,
            "aria-controls": "mobile-navigation",
            className: "inline-flex items-center rounded px-2 py-1 text-4 hover:bg-gray-100",
            children: sidebarOpen ? /* @__PURE__ */ jsx(CloseIcon, {}) : /* @__PURE__ */ jsx(MenuIcon, {})
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(
        "main",
        {
          id: "main-content",
          className: "",
          children
        }
      ),
      /* @__PURE__ */ jsx(ModalSidebar, { title: "Register", isOpen: false, onClose: () => setSidebarOpen(false), children: /* @__PURE__ */ jsx("div", { className: "" }) }),
      /* @__PURE__ */ jsx("footer", { className: "section-margin", children: /* @__PURE__ */ jsx(Footer, {}) })
    ] })
  ] });
}
async function resolvePageComponent(path, pages) {
  for (const p of Array.isArray(path) ? path : [path]) {
    const page = pages[p];
    if (typeof page === "undefined") {
      continue;
    }
    return typeof page === "function" ? page() : page;
  }
  throw new Error(`Page not found: ${path}`);
}
const Ziggy$1 = { "url": "http://localhost", "port": null, "defaults": {}, "routes": { "horizon.stats.index": { "uri": "horizon/api/stats", "methods": ["GET", "HEAD"] }, "horizon.workload.index": { "uri": "horizon/api/workload", "methods": ["GET", "HEAD"] }, "horizon.masters.index": { "uri": "horizon/api/masters", "methods": ["GET", "HEAD"] }, "horizon.monitoring.index": { "uri": "horizon/api/monitoring", "methods": ["GET", "HEAD"] }, "horizon.monitoring.store": { "uri": "horizon/api/monitoring", "methods": ["POST"] }, "horizon.monitoring-tag.paginate": { "uri": "horizon/api/monitoring/{tag}", "methods": ["GET", "HEAD"], "parameters": ["tag"] }, "horizon.monitoring-tag.destroy": { "uri": "horizon/api/monitoring/{tag}", "methods": ["DELETE"], "wheres": { "tag": ".*" }, "parameters": ["tag"] }, "horizon.jobs-metrics.index": { "uri": "horizon/api/metrics/jobs", "methods": ["GET", "HEAD"] }, "horizon.jobs-metrics.show": { "uri": "horizon/api/metrics/jobs/{id}", "methods": ["GET", "HEAD"], "parameters": ["id"] }, "horizon.queues-metrics.index": { "uri": "horizon/api/metrics/queues", "methods": ["GET", "HEAD"] }, "horizon.queues-metrics.show": { "uri": "horizon/api/metrics/queues/{id}", "methods": ["GET", "HEAD"], "parameters": ["id"] }, "horizon.jobs-batches.index": { "uri": "horizon/api/batches", "methods": ["GET", "HEAD"] }, "horizon.jobs-batches.show": { "uri": "horizon/api/batches/{id}", "methods": ["GET", "HEAD"], "parameters": ["id"] }, "horizon.jobs-batches.retry": { "uri": "horizon/api/batches/retry/{id}", "methods": ["POST"], "parameters": ["id"] }, "horizon.pending-jobs.index": { "uri": "horizon/api/jobs/pending", "methods": ["GET", "HEAD"] }, "horizon.completed-jobs.index": { "uri": "horizon/api/jobs/completed", "methods": ["GET", "HEAD"] }, "horizon.silenced-jobs.index": { "uri": "horizon/api/jobs/silenced", "methods": ["GET", "HEAD"] }, "horizon.failed-jobs.index": { "uri": "horizon/api/jobs/failed", "methods": ["GET", "HEAD"] }, "horizon.failed-jobs.show": { "uri": "horizon/api/jobs/failed/{id}", "methods": ["GET", "HEAD"], "parameters": ["id"] }, "horizon.retry-jobs.show": { "uri": "horizon/api/jobs/retry/{id}", "methods": ["POST"], "parameters": ["id"] }, "horizon.jobs.show": { "uri": "horizon/api/jobs/{id}", "methods": ["GET", "HEAD"], "parameters": ["id"] }, "horizon.index": { "uri": "horizon/{view?}", "methods": ["GET", "HEAD"], "wheres": { "view": "(.*)" }, "parameters": ["view"] }, "sanctum.csrf-cookie": { "uri": "sanctum/csrf-cookie", "methods": ["GET", "HEAD"] }, "en.home": { "uri": "en", "methods": ["GET", "HEAD"] }, "en.proposals.index": { "uri": "en/proposals", "methods": ["GET", "HEAD"] }, "en.funds.index": { "uri": "en/funds", "methods": ["GET", "HEAD"] }, "en.people.index": { "uri": "en/people", "methods": ["GET", "HEAD"] }, "en.charts.index": { "uri": "en/charts", "methods": ["GET", "HEAD"] }, "en.jormungandr.index": { "uri": "en/jormungandr", "methods": ["GET", "HEAD"] }, "en.search.index": { "uri": "en/s", "methods": ["GET", "HEAD"] }, "de.home": { "uri": "de", "methods": ["GET", "HEAD"] }, "de.proposals.index": { "uri": "de/proposals", "methods": ["GET", "HEAD"] }, "de.funds.index": { "uri": "de/funds", "methods": ["GET", "HEAD"] }, "de.people.index": { "uri": "de/people", "methods": ["GET", "HEAD"] }, "de.charts.index": { "uri": "de/charts", "methods": ["GET", "HEAD"] }, "de.jormungandr.index": { "uri": "de/jormungandr", "methods": ["GET", "HEAD"] }, "de.search.index": { "uri": "de/s", "methods": ["GET", "HEAD"] }, "zh.home": { "uri": "zh", "methods": ["GET", "HEAD"] }, "zh.proposals.index": { "uri": "zh/proposals", "methods": ["GET", "HEAD"] }, "zh.funds.index": { "uri": "zh/funds", "methods": ["GET", "HEAD"] }, "zh.people.index": { "uri": "zh/people", "methods": ["GET", "HEAD"] }, "zh.charts.index": { "uri": "zh/charts", "methods": ["GET", "HEAD"] }, "zh.jormungandr.index": { "uri": "zh/jormungandr", "methods": ["GET", "HEAD"] }, "zh.search.index": { "uri": "zh/s", "methods": ["GET", "HEAD"] }, "ja.home": { "uri": "ja", "methods": ["GET", "HEAD"] }, "ja.proposals.index": { "uri": "ja/proposals", "methods": ["GET", "HEAD"] }, "ja.funds.index": { "uri": "ja/funds", "methods": ["GET", "HEAD"] }, "ja.people.index": { "uri": "ja/people", "methods": ["GET", "HEAD"] }, "ja.charts.index": { "uri": "ja/charts", "methods": ["GET", "HEAD"] }, "ja.jormungandr.index": { "uri": "ja/jormungandr", "methods": ["GET", "HEAD"] }, "ja.search.index": { "uri": "ja/s", "methods": ["GET", "HEAD"] }, "sw.home": { "uri": "sw", "methods": ["GET", "HEAD"] }, "sw.proposals.index": { "uri": "sw/proposals", "methods": ["GET", "HEAD"] }, "sw.funds.index": { "uri": "sw/funds", "methods": ["GET", "HEAD"] }, "sw.people.index": { "uri": "sw/people", "methods": ["GET", "HEAD"] }, "sw.charts.index": { "uri": "sw/charts", "methods": ["GET", "HEAD"] }, "sw.jormungandr.index": { "uri": "sw/jormungandr", "methods": ["GET", "HEAD"] }, "sw.search.index": { "uri": "sw/s", "methods": ["GET", "HEAD"] }, "es.home": { "uri": "es", "methods": ["GET", "HEAD"] }, "es.proposals.index": { "uri": "es/proposals", "methods": ["GET", "HEAD"] }, "es.funds.index": { "uri": "es/funds", "methods": ["GET", "HEAD"] }, "es.people.index": { "uri": "es/people", "methods": ["GET", "HEAD"] }, "es.charts.index": { "uri": "es/charts", "methods": ["GET", "HEAD"] }, "es.jormungandr.index": { "uri": "es/jormungandr", "methods": ["GET", "HEAD"] }, "es.search.index": { "uri": "es/s", "methods": ["GET", "HEAD"] }, "fr.home": { "uri": "fr", "methods": ["GET", "HEAD"] }, "fr.proposals.index": { "uri": "fr/proposals", "methods": ["GET", "HEAD"] }, "fr.funds.index": { "uri": "fr/funds", "methods": ["GET", "HEAD"] }, "fr.people.index": { "uri": "fr/people", "methods": ["GET", "HEAD"] }, "fr.charts.index": { "uri": "fr/charts", "methods": ["GET", "HEAD"] }, "fr.jormungandr.index": { "uri": "fr/jormungandr", "methods": ["GET", "HEAD"] }, "fr.search.index": { "uri": "fr/s", "methods": ["GET", "HEAD"] }, "profile.edit": { "uri": "profile", "methods": ["GET", "HEAD"] }, "profile.update": { "uri": "profile", "methods": ["PATCH"] }, "profile.destroy": { "uri": "profile", "methods": ["DELETE"] }, "register": { "uri": "register", "methods": ["GET", "HEAD"] }, "login": { "uri": "login", "methods": ["GET", "HEAD"] }, "password.request": { "uri": "forgot-password", "methods": ["GET", "HEAD"] }, "password.email": { "uri": "forgot-password", "methods": ["POST"] }, "password.reset": { "uri": "reset-password/{token}", "methods": ["GET", "HEAD"], "parameters": ["token"] }, "password.store": { "uri": "reset-password", "methods": ["POST"] }, "verification.notice": { "uri": "verify-email", "methods": ["GET", "HEAD"] }, "verification.verify": { "uri": "verify-email/{id}/{hash}", "methods": ["GET", "HEAD"], "parameters": ["id", "hash"] }, "verification.send": { "uri": "email/verification-notification", "methods": ["POST"] }, "password.confirm": { "uri": "confirm-password", "methods": ["GET", "HEAD"] }, "password.update": { "uri": "password", "methods": ["PUT"] }, "logout": { "uri": "logout", "methods": ["POST"] }, "en.dashboard": { "uri": "en/dashboard", "methods": ["GET", "HEAD"] }, "de.dashboard": { "uri": "de/dashboard", "methods": ["GET", "HEAD"] }, "zh.dashboard": { "uri": "zh/dashboard", "methods": ["GET", "HEAD"] }, "ja.dashboard": { "uri": "ja/dashboard", "methods": ["GET", "HEAD"] }, "sw.dashboard": { "uri": "sw/dashboard", "methods": ["GET", "HEAD"] }, "es.dashboard": { "uri": "es/dashboard", "methods": ["GET", "HEAD"] }, "fr.dashboard": { "uri": "fr/dashboard", "methods": ["GET", "HEAD"] }, "storage.local": { "uri": "storage/{path}", "methods": ["GET", "HEAD"], "wheres": { "path": ".*" }, "parameters": ["path"] } } };
if (typeof window !== "undefined" && typeof window.Ziggy !== "undefined") {
  Object.assign(Ziggy$1.routes, window.Ziggy.routes);
}
globalThis.Ziggy = Ziggy$1;
createServer(
  (page) => createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => {
      const page2 = resolvePageComponent(
        `./Pages/${name}.tsx`,
        /* @__PURE__ */ Object.assign({ "./Pages/Auth/ConfirmPassword.tsx": () => import("./assets/ConfirmPassword-BvXb7IOR.js"), "./Pages/Auth/ForgotPassword.tsx": () => import("./assets/ForgotPassword-B9Tk0No-.js"), "./Pages/Auth/Login.tsx": () => import("./assets/Login-C3ldIDin.js"), "./Pages/Auth/Partials/RegisterForm.tsx": () => Promise.resolve().then(() => RegisterForm$1), "./Pages/Auth/Register.tsx": () => import("./assets/Register-B1vLvwSb.js"), "./Pages/Auth/ResetPassword.tsx": () => import("./assets/ResetPassword-DFmkMy5d.js"), "./Pages/Auth/VerifyEmail.tsx": () => import("./assets/VerifyEmail-CYxk1JlD.js"), "./Pages/Charts/Index.tsx": () => import("./assets/Index-B3Xp6EWv.js"), "./Pages/Funds/Index.tsx": () => import("./assets/Index-CTqSqQna.js"), "./Pages/Home/Index.tsx": () => import("./assets/Index-9rOJjwLT.js"), "./Pages/Home/Partials/CatalystIntro.tsx": () => import("./assets/CatalystIntro-toD6BFXr.js"), "./Pages/Jormungandr/Index.tsx": () => import("./assets/Index-DcOhsyUp.js"), "./Pages/People/Index.tsx": () => import("./assets/Index-B3ZLHt_0.js"), "./Pages/Posts/Index.tsx": () => import("./assets/Index-QXc0DDmA.js"), "./Pages/Posts/Partials/PostCard.tsx": () => import("./assets/PostCard-C4XRiHQd.js"), "./Pages/Posts/Partials/PostListLoader.tsx": () => import("./assets/PostListLoader-3nwOgI6a.js"), "./Pages/Profile/Dashboard.tsx": () => import("./assets/Dashboard-DUpgzrnN.js"), "./Pages/Profile/Edit.tsx": () => import("./assets/Edit-6Fr5VN3u.js"), "./Pages/Profile/Partials/DeleteUserForm.tsx": () => import("./assets/DeleteUserForm-CWYMo3f5.js"), "./Pages/Profile/Partials/UpdatePasswordForm.tsx": () => import("./assets/UpdatePasswordForm-CE_xCnGy.js"), "./Pages/Profile/Partials/UpdateProfileInformationForm.tsx": () => import("./assets/UpdateProfileInformationForm-B2hIPBae.js"), "./Pages/Proposals/Index.tsx": () => import("./assets/Index-B4dC0t_q.js"), "./Pages/Proposals/Partials/ProposalBookmark.tsx": () => import("./assets/ProposalBookmark-BLtuiLfr.js"), "./Pages/Proposals/Partials/ProposalCard.tsx": () => import("./assets/ProposalCard-B6WIhqMj.js"), "./Pages/Proposals/Partials/ProposalCardLoading.tsx": () => import("./assets/ProposalCardLoading-hV5yK7Wl.js"), "./Pages/Proposals/Partials/ProposalFundingPercentages.tsx": () => import("./assets/ProposalFundingPercentages-CxBTpmbB.js").then((n) => n.a), "./Pages/Proposals/Partials/ProposalFundingStatus.tsx": () => import("./assets/ProposalFundingStatus-He_dc8kf.js"), "./Pages/Proposals/Partials/ProposalList.tsx": () => import("./assets/ProposalList-CmQhjsmR.js"), "./Pages/Proposals/Partials/ProposalQuickpitch.tsx": () => import("./assets/ProposalQuickpitch-Cz23jxgj.js"), "./Pages/Proposals/Partials/ProposalResults.tsx": () => import("./assets/ProposalResults-yLMDQMmi.js"), "./Pages/Proposals/Partials/ProposalSolution.tsx": () => import("./assets/ProposalSolution-CcuY1fcZ.js"), "./Pages/Proposals/Partials/ProposalStatus.tsx": () => import("./assets/ProposalStatus-DS8PUNFf.js"), "./Pages/Proposals/Partials/ProposalUsers.tsx": () => import("./assets/ProposalUsers-B9XTwuaf.js"), "./Pages/S/Index.tsx": () => import("./assets/Index-BjDcPbwk.js"), "./Pages/S/Partials/ProposalResults.tsx": () => import("./assets/ProposalResults-BFQWxnjX.js") })
      );
      page2.then((module) => {
        module.default.layout = module.default.layout || ((module2) => /* @__PURE__ */ jsx(AppLayout, { children: module2 }));
      });
      return page2;
    },
    setup: ({ el, App, props }) => /* @__PURE__ */ jsx(App, { ...props })
  })
);
export {
  InputLabel as I,
  PrimaryButton as P,
  TextInput as T,
  UserAvatar as U,
  InputError as a,
  useEscapeKey as u
};
