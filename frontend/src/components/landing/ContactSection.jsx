import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { motion } from "framer-motion";
import { AnimatedSectionHeader, buttonHoverTap } from "./AnimatedSection";

const contactInfoVariant = {
  hidden: { opacity: 0, x: -30 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" },
  }),
};

export default function ContactSection() {
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const { toast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/contact", formData);
      toast({ title: "Message sent!", description: "We'll get back to you soon." });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({ title: "Sending failed", description: "Could not send the message. Please try again later.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <AnimatedSectionHeader
          badge="Get In Touch"
          title="Contact Us"
          description="Get in touch with us for any inquiries or feedback."
        />

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Left column - contact info */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {[
              {
                icon: <Phone className="h-5 w-5" />,
                title: "Phone",
                lines: ["079-35096700", "Emergency: 079-35096700"],
              },
              {
                icon: <Mail className="h-5 w-5" />,
                title: "Email",
                lines: ["liohnshospital748@gmail.com"],
              },
              {
                icon: <MapPin className="h-5 w-5" />,
                title: "Address",
                lines: [
                  "Beside Sarva Mangal Hall, Near swami vivekanand Chowk",
                  "Memnagar, Ahmedabad - 380052",
                ],
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                variants={contactInfoVariant}
                className="flex items-start gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0"
                >
                  {item.icon}
                </motion.div>
                <div>
                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                  {item.lines.map((line, li) => (
                    <p key={li} className="text-sm text-foreground/70">{line}</p>
                  ))}
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-8 rounded-xl overflow-hidden border border-border shadow-sm h-64"
            >
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29369.976623375507!2d72.50462553371011!3d23.05140158541038!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84a43f4d1dff%3A0x31ca9185afd4b66f!2sLIFE%20CARE%20INSTITUTE%20OF%20HEAD%20AND%20NECK%20SCIENCES%20(LIOHN)!5e0!3m2!1sen!2sin!4v1775578215482!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </motion.div>
          </motion.div>

          {/* Right column — form */}
          <motion.form
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            onSubmit={handleSubmit}
            className="space-y-4 bg-card p-6 rounded-xl shadow-card border border-border"
          >
            <Input name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" required />
            <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Your Email" required />
            <Input name="subject" value={formData.subject} onChange={handleChange} placeholder="Subject" required />
            <Textarea name="message" value={formData.message} onChange={handleChange} placeholder="Your Message" rows={4} required />
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button type="submit" className="w-full group" disabled={sending}>
                {sending ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message
                    <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </Button>
            </motion.div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
