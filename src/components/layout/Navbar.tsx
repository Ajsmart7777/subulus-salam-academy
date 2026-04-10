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
    { label: t("nav.donate"), to: "/donate" },
    { label: t("nav.sponsor"), to: "/sponsor-a-student" },
    { label: t("nav.dashboard"), to: "/dashboard" },
    ...(hasRole("teacher") ? [{ label: t("nav.teacher_panel"), to: "/teacher" }] : []),
    ...(hasRole("admin") ? [{ label: t("nav.admin_panel"), to: "/admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/88 backdrop-blur-xl border-b border-primary/8 shadow-[0_4px_18px_hsl(160_72%_21%/0.03)]">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoIcon} alt="Sabilul Jannah" className="h-10 w-10 rounded-lg" width={512} height={512} />
          <div className="leading-tight">
            <span className="font-heading text-lg font-bold text-foreground block">Sabilul Jannah</span>
            <span className="hidden lg:block text-xs font-body text-muted-foreground tracking-wide">International Online Islamiyya</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative text-sm font-body font-medium transition-colors hover:text-primary ${
                location.pathname === link.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
              {location.pathname === link.to && (
                <span className="absolute -bottom-1.5 left-0 w-full h-[1.5px] bg-gradient-to-r from-accent to-primary" />
              )}
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
        <div className="md:hidden border-t border-primary/8 bg-card p-5 space-y-3">
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
          <div className="flex flex-wrap gap-2 py-3 border-t border-primary/8">
            {(Object.keys(localeNames) as Locale[]).map((l) => (
              <button
                key={l}
                onClick={() => { setLocale(l); setMobileOpen(false); }}
                className={`text-xs px-3 py-1.5 rounded-full border font-body transition-colors ${
                  locale === l ? "bg-primary text-primary-foreground border-primary" : "border-primary/18 text-muted-foreground hover:border-primary/35"
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
