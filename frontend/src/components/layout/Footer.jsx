import { Heart, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-6 w-6" />
              <span className="text-lg font-bold">LIOHNS Hospital</span>
            </div>
            <p className="text-sm opacity-80">
              Providing quality healthcare services with compassion and excellence since 2010.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="space-y-2 text-sm opacity-80">
              <a href="/#about" className="block hover:opacity-100">About Us</a>
              <a href="/#services" className="block hover:opacity-100">Services</a>
              <a href="/#doctors" className="block hover:opacity-100">Our Doctors</a>
              <a href="/#blog" className="block hover:opacity-100">Health Blog</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Services</h4>
            <div className="space-y-2 text-sm opacity-80">
              <p>General Medicine</p>
              <p>Cardiology</p>
              <p>Orthopedics</p>
              <p>Pediatrics</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <div className="space-y-2 text-sm opacity-80">
              <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 123 456 7890</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@liohns.com</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> 123 Health St, Medical City</p>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm opacity-60">
          © {new Date().getFullYear()} LIOHNS Hospital. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
