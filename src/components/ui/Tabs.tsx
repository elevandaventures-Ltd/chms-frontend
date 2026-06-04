"use client";

/**
 * Tabs — accessible tab component built on Radix UI Tabs primitive.
 *
 * Used for the Member Profile drawer and any multi-panel layout.
 *
 * Usage:
 * ```tsx
 * <Tabs defaultValue="overview">
 *   <TabsList>
 *     <TabsTrigger value="overview">Overview</TabsTrigger>
 *     <TabsTrigger value="attendance">Attendance</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="overview">…</TabsContent>
 *   <TabsContent value="attendance">…</TabsContent>
 * </Tabs>
 * ```
 */
import * as RadixTabs from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef, ElementRef } from 'react';
import { forwardRef } from 'react';

// ── Root ─────────────────────────────────────────────────────────────────────

export const Tabs = RadixTabs.Root;

// ── List ─────────────────────────────────────────────────────────────────────

export const TabsList = forwardRef<
  ElementRef<typeof RadixTabs.List>,
  ComponentPropsWithoutRef<typeof RadixTabs.List>
>(({ className, ...props }, ref) => (
  <RadixTabs.List
    ref={ref}
    className={cn('tabs-list', className)}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

// ── Trigger ───────────────────────────────────────────────────────────────────

export const TabsTrigger = forwardRef<
  ElementRef<typeof RadixTabs.Trigger>,
  ComponentPropsWithoutRef<typeof RadixTabs.Trigger>
>(({ className, ...props }, ref) => (
  <RadixTabs.Trigger
    ref={ref}
    className={cn('tabs-trigger', className)}
    {...props}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

// ── Content ───────────────────────────────────────────────────────────────────

export const TabsContent = forwardRef<
  ElementRef<typeof RadixTabs.Content>,
  ComponentPropsWithoutRef<typeof RadixTabs.Content>
>(({ className, ...props }, ref) => (
  <RadixTabs.Content
    ref={ref}
    className={cn('tabs-content', className)}
    {...props}
  />
));
TabsContent.displayName = 'TabsContent';
