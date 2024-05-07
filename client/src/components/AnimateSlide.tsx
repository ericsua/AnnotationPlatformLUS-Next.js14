import React from "react";
import { motion } from "framer-motion";

// Component to animate slide in/out, used in the forms to animate parts of the form questions.
// based on the framer-motion library
export default function AnimateSlide({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // Animate the children component with slide in/out animation
        // where the component will make itself room to show up sliding down the other components 
        // below it or sliding up them while hiding itself
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
