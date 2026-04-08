import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Globe } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { localeNames, Locale } from "@/i18n/translations";
import logoIcon from "@/assets/logo-icon.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, signOut, loading, hasRole } = useAuth();
  const { t, locale, setLocale } = useLanguage();

  const navLinks = [
    { label: t("nav.home"), to: "/" },
    { label: t("nav.courses"), to: "/courses" },
    { label: t("nav.dashboard"), to: "/dashboard" },
    ...(hasRole("teacher") ? [{ label: t("nav.teacher_panel"), to: "/teacher" }] : []),
    ...(hasRole("admin") ? [{ label: t("nav.admin_panel"), to: "/admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoIcon} alt="Sabilul Jannah" className="h-10 w-10 rounded-md" width={512} height={512} />
          <span className="font-heading text-xl font-bold text-foreground">Sabilul Jannah</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-body font-medium transition-colors hover:text-primary ${
                location.pathname === link.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Globe className="h-4 w-4" />
                <span className="text-xs">{localeNames[locale]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.keys(localeNames) as Locale[]).map((l) => (
                <DropdownMenuItem
                  key={l}
                  onClick={() => setLocale(l)}
                  className={locale === l ? "bg-primary/10 font-semibold" : ""}
                >
                  {localeNames[l]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {!loading && (
            user ? (
              <Button variant="ghost" size="sm" className="gap-2" onClick={signOut}>
                <LogOut className="h-4 w-4" /> {t("nav.signout")}
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">{t("nav.login")}</Link>
                </Button>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/register">{t("nav.signup")}</Link>
                </Button>
              </>
            )
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-body font-medium text-muted-foreground hover:text-primary py-2"
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile Language Switcher */}
          <div className="flex flex-wrap gap-2 py-2 border-t border-border">
            {(Object.keys(localeNames) as Locale[]).map((l) => (
              <button
                key={l}
                onClick={() => { setLocale(l); setMobileOpen(false); }}
                className={`text-xs px-3 py-1.5 rounded-full border font-body ${
                  locale === l ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
                }`}
              >
                {localeNames[l]}
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            {user ? (
              <Button variant="ghost" size="sm" className="flex-1 gap-2" onClick={() => { signOut(); setMobileOpen(false); }}>
                <LogOut className="h-4 w-4" /> {t("nav.signout")}
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="flex-1" asChild>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>{t("nav.login")}</Link>
                </Button>
                <Button variant="hero" size="sm" className="flex-1" asChild>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>{t("nav.signup")}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
