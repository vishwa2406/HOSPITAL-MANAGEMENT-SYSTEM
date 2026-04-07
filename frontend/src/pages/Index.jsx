import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import AboutSection from "@/components/landing/AboutSection";
import ServicesSection from "@/components/landing/ServicesSection";
import DoctorsSection from "@/components/landing/DoctorsSection";
import FacilitiesSection from "@/components/landing/FacilitiesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import BlogSection from "@/components/landing/BlogSection";
import ContactSection from "@/components/landing/ContactSection";

export default function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <DoctorsSection />
      <FacilitiesSection />
      <TestimonialsSection />
      <BlogSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
