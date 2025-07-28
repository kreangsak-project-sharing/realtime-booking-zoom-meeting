"use client";

import { CheckIcon } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Step {
  label: string;
  description: string;
  href?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({
  steps,
  currentStep,
}: StepIndicatorProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isClickable = isCompleted && !!step.href;

          const content = (
            <div className="flex items-center justify-center flex-col">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-2 font-medium text-sm relative z-10
                  transition-all duration-300 ease-in-out
                  ${
                    isCompleted
                      ? "bg-[#4f46e5] border-[#4f46e5] text-white cursor-pointer shadow-md shadow-indigo-200 dark:shadow-indigo-900/20"
                      : isActive
                      ? "border-[#4f46e5] text-[#4f46e5] bg-white dark:bg-[#1c1c1c] shadow-md shadow-indigo-200 dark:shadow-indigo-900/20"
                      : "border-[#d4d4d8] text-[#a1a1aa] bg-white dark:bg-[#1c1c1c] cursor-not-allowed"
                  }
                `}
              >
                {isCompleted ? <CheckIcon className="w-5 h-5" /> : index + 1}
              </motion.div>

              <div className="text-center mt-4">
                <motion.p
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1 + 0.2,
                  }}
                  className={`text-sm font-medium ${
                    index <= currentStep
                      ? "text-[#27272a] dark:text-white"
                      : "text-[#a1a1aa]"
                  }`}
                >
                  {step.label}
                </motion.p>
                <motion.p
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1 + 0.3,
                  }}
                  className="text-xs text-[#71717a] dark:text-[#a1a1aa] mt-0.5"
                >
                  {step.description}
                </motion.p>
              </div>
            </div>
          );

          return (
            <div key={index} className="flex-1 relative">
              {isClickable && step.href ? (
                <Link href={step.href}>{content}</Link>
              ) : (
                <div>{content}</div>
              )}

              {index < steps.length - 1 && (
                <div
                  className={`absolute top-6 left-1/2 w-full h-0.5 transition-all duration-500 ease-in-out ${
                    isCompleted
                      ? "bg-[#4f46e5]"
                      : "bg-[#d4d4d8] dark:bg-[#2a2a2a]"
                  }`}
                ></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
