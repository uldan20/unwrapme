'use client';

import { motion, type Variants } from 'framer-motion';
import { cn } from '@/templates/rak-buku/lib/utils';

const variants: Variants = {
  hidden: { opacity: 0, y: 34, filter: 'blur(6px)' },
  shown: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
};

/** The single entrance used for text throughout, so the page has one rhythm. */
export default function Reveal({
  children,
  className,
  delay = 0,
  amount = 0.5,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}) {
  return (
    <motion.div
      className={cn(className)}
      variants={variants}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
