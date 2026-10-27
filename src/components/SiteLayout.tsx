import { useEffect, useState } from "react";
import { Menu, Moon, Search, Sun, X } from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

const navItems = [
  { to: "/articles", label: "文章" },
  { to: "/categories", label: "分类" },
  { to: "/archive", label: "归档" },
  { to: "/about", label: "关于" },
];

export function SiteLayout() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("flew-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("flew-theme", theme);
  }, [theme]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to="/" aria-label="Flew 博客首页">
            <span className="brand-mark">F</span>
            <span>Flew<span className="brand-period">.</span></span>
          </Link>

          <nav className={`primary-nav ${menuOpen ? "is-open" : ""}`} aria-label="主导航">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <Link className="icon-button" to="/search" aria-label="搜索文章" title="搜索文章">
              <Search size={18} strokeWidth={1.8} />
            </Link>
            <button
              className="icon-button theme-toggle"
              type="button"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label={theme === "light" ? "切换到深色主题" : "切换到浅色主题"}
              title={theme === "light" ? "深色主题" : "浅色主题"}
            >
              {theme === "light" ? <Moon size={18} strokeWidth={1.8} /> : <Sun size={18} strokeWidth={1.8} />}
            </button>
            <button
              className="icon-button menu-toggle"
              type="button"
              aria-label={menuOpen ? "关闭导航菜单" : "打开导航菜单"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </header>

      <main id="main-content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <Link className="brand footer-brand" to="/">
            <span className="brand-mark">F</span>
            <span>Flew<span className="brand-period">.</span></span>
          </Link>
          <p>记录正在学习、设计与构建的事。</p>
          <span className="footer-note">© 2026 · 本站文章为前端演示内容</span>
        </div>
      </footer>
    </div>
  );
}
