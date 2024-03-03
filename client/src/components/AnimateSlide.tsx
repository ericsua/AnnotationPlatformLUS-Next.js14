import React from "react";
import { motion } from "framer-motion";

export default function AnimateSlide({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
        >
            {children}
        </motion.div>
    );
}
