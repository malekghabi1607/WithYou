/**
 * Composant Tabs permettant d’afficher du contenu sous forme d’onglets.
 * Basé sur Radix UI pour la gestion des états et de l’accessibilité.
 * Inclut les éléments : Tabs, TabsList, TabsTrigger et TabsContent.
 * Stylisé avec Tailwind CSS pour une interface cohérente.
 * Utilisable côté client avec Next.js ("use client").
 */

"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "./utils";

// =============================
// ROOT
// =============================
function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

// =============================
// LIST
// =============================
function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        // inline-flex + flex = redondant → je garde inline-flex (le plus courant)
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px]",
        className
      )}
      {...props}
    />
  );
}

// =============================
// TRIGGER
// =============================
function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-card data-[state=active]:text-foreground " +
          "dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground " +
          "focus-visible:outline-ring focus-visible:border-ring focus-visible:ring-ring/50 " +
          "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 " +
          "rounded-xl border border-transparent px-2 py-1 text-sm font-medium " +
          "whitespace-nowrap transition-[color,box-shadow] disabled:opacity-50 " +
          "disabled:pointer-events-none [&_svg]:shrink-0 [&_svg]:pointer-events-none " +
          "[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

// =============================
// CONTENT
// =============================
function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };