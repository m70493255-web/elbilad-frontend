"use client";

import { motion } from "framer-motion";
import { ShoppingCart, CreditCard, Wallet, CheckCircle } from "lucide-react";

const steps = [
  { id: 1, label: "السلة", icon: ShoppingCart },
  { id: 2, label: "طرق الدفع", icon: CreditCard },
  { id: 3, label: "الدفع", icon: Wallet },
  { id: 4, label: "تأكيد", icon: CheckCircle },
];

export default function CheckoutStepper({ currentStep }: { currentStep: 1 | 2 | 3 | 4 }) {
  const progressPct = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between relative">
          {/* Track */}
          <div className="absolute top-5 left-8 right-8 h-0.5 bg-gray-100 z-0" />
          {/* Fill */}
          <motion.div
            className="absolute top-5 left-8 h-0.5 bg-gradient-to-r from-[#1a6b7d] to-[#7CC043] z-0 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progressPct / 100 }}
            style={{ right: "2rem", transformOrigin: "left" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />

          {steps.map((step) => {
            const done = step.id < currentStep;
            const active = step.id === currentStep;
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex flex-col items-center gap-1.5 z-10">
                <motion.div
                  animate={{
                    backgroundColor: done ? "#7CC043" : active ? "#1a6b7d" : "#f3f4f6",
                    scale: active ? 1.12 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                >
                  {done ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
                      <CheckCircle size={18} className="text-white" />
                    </motion.div>
                  ) : (
                    <Icon size={16} className={active ? "text-white" : "text-gray-400"} />
                  )}
                </motion.div>
                <span className={`text-[10px] sm:text-xs font-semibold ${active ? "text-[#1a6b7d]" : done ? "text-[#7CC043]" : "text-gray-400"}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
