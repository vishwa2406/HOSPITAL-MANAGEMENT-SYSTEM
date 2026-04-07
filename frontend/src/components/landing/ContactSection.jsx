import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ContactSection() {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast({ title: "Message sent!", description: "We'll get back to you soon." });
      setSending(false);
      e.target.reset();
    }, 1000);
  };

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">Contact Us</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Get in touch with us for any inquiries or feedback.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Phone</h4>
                <p className="text-sm text-muted-foreground">+91 123 456 7890</p>
                <p className="text-sm text-muted-foreground">+91 098 765 4321</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Email</h4>
                <p className="text-sm text-muted-foreground">info@liohns.com</p>
                <p className="text-sm text-muted-foreground">appointments@liohns.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Address</h4>
                <p className="text-sm text-muted-foreground">123 Health Street, Medical City</p>
                <p className="text-sm text-muted-foreground">New Delhi, India - 110001</p>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-xl shadow-card border border-border">
            <Input placeholder="Your Name" required />
            <Input type="email" placeholder="Your Email" required />
            <Input placeholder="Subject" required />
            <Textarea placeholder="Your Message" rows={4} required />
            <Button type="submit" className="w-full" disabled={sending}>
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
