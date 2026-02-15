"use client";

import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

// Omit href because we use 'to' instead, to match react-router interface we are migrating from.
// unique issue: we pass ...props to Link, which expects href. We provide href manually.
// So we must ensure ...props does not contain href if it was somehow in LinkProps.
interface NavLinkCompatProps extends Omit<LinkProps, "className" | "href"> {
    className?: string | ((props: { isActive: boolean }) => string);
    activeClassName?: string;
    pendingClassName?: string;
    children: React.ReactNode;
    to: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
    ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
        const pathname = usePathname();
        // Simple exact match or startsWith check?
        // react-router 'end' prop behaviour is specific.
        // For now, let's assume exact match or subpath?
        // The original code used exact matching for simple NavLinks usually.
        // But let's check basic equality. logic: `isActive`
        // If the user needs strict matching, they might need to add a prop, but for now simple check:
        const isActive = pathname === to || (to !== '/' && pathname?.startsWith(to));

        const computedClassName = typeof className === "function"
            ? className({ isActive })
            : cn(className as string, isActive && activeClassName);

        return (
            <Link
                ref={ref}
                href={to}
                className={computedClassName}
                {...props}
            />
        );
    },
);

NavLink.displayName = "NavLink";

export { NavLink };
