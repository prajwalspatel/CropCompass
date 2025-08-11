"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  predictYield,
  type PredictYieldInput,
  type PredictYieldOutput,
} from "@/ai/flows/predict-yield";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, Lightbulb, CheckCircle, Cloudy } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";

const formSchema = z.object({
  cropType: z.string().min(2, { message: "Crop type is required." }),
  soilType: z.string().min(2, { message: "Soil type is required." }),
  season: z.string({required_error: "Please select a season."}),
  location: z.string().min(2, { message: "Location is required." }),
});

export default function YieldPrediction() {
  const { t, language } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictYieldOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropType: "",
      soilType: "",
      location: "",
    },
  });

  const onSubmit: SubmitHandler<Omit<PredictYieldInput, 'language'>> = async (data) => {
    setLoading(true);
    setResult(null);
    try {
        const input: PredictYieldInput = {
            ...data,
            language,
        };
      const response = await predictYield(input);
      setResult(response);
    } catch (error) {
      console.error("Error predicting yield:", error);
      toast({
        variant: "destructive",
        title: t('toasts.error'),
        description: t('toasts.yieldPredictionError'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">{t('yieldPrediction.title')}</CardTitle>
        <CardDescription className="text-center">{t('yieldPrediction.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="cropType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('yieldPrediction.cropTypeLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('yieldPrediction.cropTypePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="soilType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('yieldPrediction.soilTypeLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('yieldPrediction.soilTypePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="season"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('yieldPrediction.seasonLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={t('yieldPrediction.seasonPlaceholder')} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Kharif">{t('yieldPrediction.kharif')}</SelectItem>
                            <SelectItem value="Rabi">{t('yieldPrediction.rabi')}</SelectItem>
                            <SelectItem value="Zaid">{t('yieldPrediction.zaid')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('yieldPrediction.locationLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('yieldPrediction.locationPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('yieldPrediction.predicting')}
                </>
              ) : (
                t('yieldPrediction.button')
              )}
            </Button>
          </form>
        </Form>

        {result && (
          <div className="mt-8 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <TrendingUp className="h-8 w-8 text-accent" />
                <div>
                  <CardTitle>{t('yieldPrediction.results.predictedYield')}</CardTitle>
                  <CardDescription>{result.predictedYield}</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Cloudy className="h-8 w-8 text-accent" />
                <div>
                  <CardTitle>{t('yieldPrediction.results.weatherReport')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground">{result.weatherReport}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Lightbulb className="h-8 w-8 text-accent" />
                <div>
                  <CardTitle>{t('yieldPrediction.results.influencingFactors')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground">{result.factors}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <CheckCircle className="h-8 w-8 text-accent" />
                <div>
                  <CardTitle>{t('yieldPrediction.results.recommendations')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                 <p className="whitespace-pre-wrap text-muted-foreground">{result.recommendations}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
