"use client";

import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";
import LanguageSwitcher from "./language-switcher";
import { useTranslation } from "@/hooks/use-translation";
import Link from "next/link";


export default function AppHeader() {
  const { t } = useTranslation();
  
  return (
    <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Leaf className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-primary font-headline">CropCompass</h1>
        </Link>
        <p className="hidden md:block text-muted-foreground">{t('header.tagline')}</p>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
