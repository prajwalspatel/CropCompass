
"use client";

import AppHeader from '@/components/header';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, BarChartBig, Bug, Droplets, Landmark, LineChart, Trees, Bot, IndianRupee, PieChart, Package } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';

const ChatWidget = dynamic(() => import('@/components/chat-widget'), { ssr: false });


export default function Home() {
  const { t } = useTranslation();

   const features = [
        { href: "/dashboard/crop-suggestions", icon: Trees, text: t('tabs.cropSuggestions'), description: t('cropsuggestions.description_short') },
        { href: "/dashboard/irrigation-plan", icon: Droplets, text: t('tabs.irrigationPlan'), description: t('irrigationplan.description_short') },
        { href: "/dashboard/yield-prediction", icon: LineChart, text: t('tabs.yieldPrediction'), description: t('yieldprediction.description_short') },
        { href: "/dashboard/market-price", icon: IndianRupee, text: t('tabs.marketPrice'), description: t('marketprice.description_short') },
        { href: "/dashboard/govt-schemes", icon: Landmark, text: t('tabs.govtSchemes'), description: t('govtschemes.description_short') },
        { href: "/dashboard/data-insights", icon: BarChartBig, text: t('tabs.dataInsights'), description: t('farmdataanalytics.description_short') },
        { href: "/dashboard/pest-disease-detection", icon: Bug, text: t('tabs.pestDetection'), description: t('pestdetection.description_short') },
        { href: "/dashboard/crop-distribution", icon: PieChart, text: t('tabs.cropDistribution'), description: t('cropdistribution.description_short') },
        { href: "/dashboard/inventory", icon: Package, text: t('tabs.inventory'), description: t('inventory.description_short') },
    ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-grow">
        <section className="container mx-auto grid lg:grid-cols-2 gap-12 items-center py-12 md:py-24">
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="mb-4 text-4xl font-bold text-primary/90 font-headline md:text-6xl">
              {t('home.title')}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl lg:mx-0">
              {t('home.subtitle')}
            </p>
            <Button asChild size="lg">
              <Link href="/#tools">
                {t('dashboard.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="flex justify-center">
            <Image 
              src="https://images.unsplash.com/photo-1560493676-04071c5f467b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyZXxlbnwwfHx8fDE3NTQ0NzAyNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080" 
              alt="Smart farming illustration" 
              width={600} 
              height={400} 
              className="rounded-lg shadow-2xl"
              data-ai-hint="agriculture technology"
            />
          </div>
        </section>

        <section id="tools" className="py-12 md:py-24 bg-muted/40">
            <div className="container mx-auto">
                <div className="mb-12 text-center">
                    <h2 className="mb-2 text-3xl font-bold text-primary/90 font-headline md:text-4xl">
                        {t('dashboard.title')}
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Explore our suite of AI-powered tools designed to help you make smarter farming decisions.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {features.map((feature, index) => (
                        <Link href={feature.href} key={index} className="group block">
                            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 h-full border-transparent hover:border-primary/50 group-hover:scale-105">
                                <CardHeader className="flex-row items-center gap-4">
                                    <feature.icon className="h-10 w-10 text-accent" />
                                    <CardTitle className="group-hover:text-primary">{feature.text}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>

      </main>
      <footer className="border-t py-6">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
}
