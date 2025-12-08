'use client';

import React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as styles from './Tabs.css';

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  children,
}) => {
  return (
    <TabsPrimitive.Root
      className={styles.root}
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
    >
      {children}
    </TabsPrimitive.Root>
  );
};

export const TabsList: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <TabsPrimitive.List className={styles.list}>
      {children}
    </TabsPrimitive.List>
  );
};

export const TabsTrigger: React.FC<{
  value: string;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return (
    <TabsPrimitive.Trigger className={styles.trigger} value={value}>
      {children}
    </TabsPrimitive.Trigger>
  );
};

export const TabsContent: React.FC<{
  value: string;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return (
    <TabsPrimitive.Content className={styles.content} value={value}>
      {children}
    </TabsPrimitive.Content>
  );
};

