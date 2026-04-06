import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground mb-3">Sabilul Jannah</h3>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              International Online Islamiyya — Structured Islamic education for the modern learner.
            </p>
          </div>
          <div>
            <h4 className="font-body font-semibold text-foreground mb-3 text-sm">Platform</h4>
            <div className="space-y-2">
              <Link to="/courses" className="block text-sm text-muted-foreground hover:text-primary font-body">Courses</Link>
              <Link to="/dashboard" className="block text-sm text-muted-foreground hover:text-primary font-body">Dashboard</Link>
            </div>
          </div>
          <div>
            <h4 className="font-body font-semibold text-foreground mb-3 text-sm">Support</h4>
            <div className="space-y-2">
              <Link to="#" className="block text-sm text-muted-foreground hover:text-primary font-body">Contact Us</Link>
              <Link to="#" className="block text-sm text-muted-foreground hover:text-primary font-body">FAQ</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-xs text-muted-foreground font-body">© 2026 Sabilul Jannah. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
