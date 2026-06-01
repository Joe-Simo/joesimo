"use client"

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react"
import type { BaseUIEvent } from "@base-ui/react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import Link, { type LinkProps } from "next/link"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button focus-ring inline-flex shrink-0 items-center justify-center rounded-[var(--radius-geist-6)] border border-transparent bg-clip-padding text-button-14 whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] select-none motion-reduce:transition-none motion-reduce:transform-none active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:shadow-[0_0_0_3px_color-mix(in_oklab,var(--destructive)_20%,transparent)] dark:aria-invalid:border-destructive/50 dark:aria-invalid:shadow-[0_0_0_3px_color-mix(in_oklab,var(--destructive)_40%,transparent)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary [color:var(--primary-foreground)] hover:bg-primary/85 active:bg-primary/75",
        secondary:
          "bg-secondary [color:var(--secondary-foreground)] hover:bg-[color:var(--geist-component-background-2)] active:bg-[color:var(--geist-component-background-3)] aria-expanded:bg-secondary aria-expanded:[color:var(--secondary-foreground)]",
        outline:
          "border-border bg-background hover:border-[color:var(--geist-border-5)] hover:bg-muted hover:[color:var(--foreground)] active:border-[color:var(--geist-border-6)] active:bg-[color:var(--geist-component-background-2)] aria-expanded:bg-muted aria-expanded:[color:var(--foreground)] dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        error:
          "border-destructive/30 bg-destructive/10 [color:var(--destructive)] hover:bg-destructive/20 active:bg-destructive/25 dark:bg-destructive/20 dark:hover:bg-destructive/30",
      },
      size: {
        default:
          "min-h-11 min-w-11 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "min-h-11 min-w-11 gap-1 rounded-[var(--radius-geist-6)] px-2.5 text-button-12 in-data-[slot=button-group]:rounded-[var(--radius-geist-6)] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "min-h-11 min-w-11 gap-1.5 rounded-[var(--radius-geist-6)] px-3 in-data-[slot=button-group]:rounded-[var(--radius-geist-6)] has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "min-h-11 min-w-11 gap-2 px-4 text-button-16 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
        icon: "size-11",
        "icon-xs":
          "size-11 rounded-[var(--radius-geist-6)] in-data-[slot=button-group]:rounded-[var(--radius-geist-6)] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-11 rounded-[var(--radius-geist-6)] in-data-[slot=button-group]:rounded-[var(--radius-geist-6)] [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonVariantProps = VariantProps<typeof buttonVariants>

type ButtonSharedProps = ButtonVariantProps & {
  loading?: boolean
  loadingLabel?: string
}

type ButtonProps = ButtonPrimitive.Props & ButtonSharedProps

type ButtonLinkProps = LinkProps &
  Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof LinkProps | "aria-disabled"
  > &
  ButtonSharedProps & {
    "aria-disabled"?: boolean | "false" | "true"
  }

function LoadingIndicator({
  children = "Loading",
}: {
  children?: ReactNode
}) {
  return (
    <>
      <span
        aria-hidden="true"
        className="size-3.5 animate-spin rounded-full border border-current border-r-transparent opacity-70"
        data-slot="button-spinner"
      />
      <span className="sr-only">{children}</span>
    </>
  )
}

function Button({
  "aria-busy": ariaBusy,
  "aria-disabled": ariaDisabled,
  children,
  className,
  disabled,
  loading = false,
  loadingLabel,
  onClick,
  size = "default",
  variant = "default",
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(disabled)

  function handleClick(event: BaseUIEvent<MouseEvent<HTMLButtonElement>>) {
    if (loading) {
      event.preventDefault()
      return
    }

    onClick?.(event)
  }

  return (
    <ButtonPrimitive
      aria-busy={ariaBusy ?? (loading ? true : undefined)}
      aria-disabled={ariaDisabled ?? (loading ? true : undefined)}
      className={cn(buttonVariants({ variant, size, className }))}
      data-loading={loading ? "" : undefined}
      data-slot="button"
      disabled={isDisabled}
      onClick={handleClick}
      {...props}
    >
      {loading ? <LoadingIndicator>{loadingLabel}</LoadingIndicator> : null}
      {children}
    </ButtonPrimitive>
  )
}

function ButtonLink({
  "aria-busy": ariaBusy,
  "aria-disabled": ariaDisabled,
  children,
  className,
  loading = false,
  loadingLabel,
  onClick,
  size = "default",
  tabIndex,
  variant = "default",
  ...props
}: ButtonLinkProps) {
  const isDisabled = ariaDisabled === true || ariaDisabled === "true"
  const isBlocked = loading || isDisabled

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (isBlocked) {
      event.preventDefault()
      return
    }

    onClick?.(event)
  }

  return (
    <Link
      aria-busy={ariaBusy ?? (loading ? true : undefined)}
      aria-disabled={isBlocked ? true : undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      data-loading={loading ? "" : undefined}
      data-slot="button-link"
      onClick={handleClick}
      tabIndex={isDisabled ? -1 : tabIndex}
      {...props}
    >
      {loading ? <LoadingIndicator>{loadingLabel}</LoadingIndicator> : null}
      {children}
    </Link>
  )
}

export type { ButtonLinkProps, ButtonProps, ButtonVariantProps }
export { Button, ButtonLink, buttonVariants }
