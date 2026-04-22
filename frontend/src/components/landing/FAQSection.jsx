import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

const dropIn = {
  hidden: { opacity: 0, y: -15, scale: 0.98 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.4, type: "spring", stiffness: 300, damping: 20 },
  }),
};

export default function FAQSection() {
  const { data: faq } = useQuery({
    queryKey: ["faq"],
    queryFn: async () => {
      try {
        const response = await api.get("/content/faq");
        return response.data && response.data.length > 0 ? response.data : [];
      } catch (e) {
        console.error("Failed to fetch FAQ:", e);
        return [];
      }
    },
  });

  const items = faq || [];

  return (
    <section id="faq" className="py-24 bg-background relative">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="md:w-1/3"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-6"
            >
              <HelpCircle className="h-6 w-6" />
            </motion.div>
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">Questions? <br />We Have Answers</h2>
            <p className="text-foreground/60 mb-8">
              Cannot find what you are looking for? <br />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-primary font-bold hover:underline"
              >
                Contact our support
              </motion.button>
            </p>
          </motion.div>

          <div className="md:w-2/3 w-full">
            <Accordion type="single" collapsible className="space-y-4">
              {items.map((f, i) => (
                <motion.div
                  key={f.id || i}
                  custom={i}
                  variants={dropIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <AccordionItem 
                    value={String(f.id || i)} 
                    className="bg-muted rounded-2xl border-none px-6 hover:bg-muted/80 transition-colors data-[state=open]:bg-card data-[state=open]:shadow-sm"
                  >
                    <AccordionTrigger className="text-lg font-bold text-foreground hover:no-underline py-6">
                      {f.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground/70 leading-relaxed pb-6 text-base">
                      {f.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
