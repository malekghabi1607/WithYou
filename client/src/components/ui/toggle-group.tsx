/**
 * Composants ToggleGroup
 *
 * Implémentation d’un groupe de boutons toggle basée sur Radix UI.
 * Permet de regrouper plusieurs options sélectionnables avec un
 * style et un comportement cohérents.
 *
 * Composants fournis :
 *  - ToggleGroup : conteneur principal du groupe
 *  - ToggleGroupItem : élément toggle individuel
 *
 * Fonctionnalités :
 *  - Support des variantes et tailles via `class-variance-authority`
 *  - Partage du contexte (variant, size) entre les items du groupe
 *  - Gestion automatique des bordures et arrondis (premier / dernier item)
 *  - Accessibilité et gestion d’état assurées par Radix UI
 *
 * Cas d’usage :
 *  - Sélecteurs d’options (vue / liste, thème, filtres)
 *  - Boutons exclusifs ou multi-sélection
 *
 * Utilisable côté client avec Next.js ("use client").
 */


import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";

import { cn } from "./utils";
import { toggleVariants } from "./toggle";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
});

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(
        "group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l",
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };
