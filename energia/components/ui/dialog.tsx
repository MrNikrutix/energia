import React from 'react';
import { Dialog as RadixDialog } from '@radix-ui/react-dialog';
import { Button } from './button';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  footer: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, title, description, footer }) => {
  return (
    <RadixDialog open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Overlay className="fixed inset-0 bg-black opacity-30" />
      <RadixDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6">
        <RadixDialog.Title className="text-lg font-bold">{title}</RadixDialog.Title>
        <RadixDialog.Description className="mt-2 text-sm text-gray-600">{description}</RadixDialog.Description>
        <div className="mt-4 flex justify-end">
          {footer}
        </div>
      </RadixDialog.Content>
    </RadixDialog>
  );
};