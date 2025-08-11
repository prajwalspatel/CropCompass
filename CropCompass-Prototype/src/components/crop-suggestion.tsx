
"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  suggestOptimalCrops,
  type SuggestOptimalCropsInput,
  type SuggestOptimalCropsOutput,
} from "@/ai/flows/suggest-optimal-crops";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ListChecks, Lightbulb, Package } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";


const soilTypes = [
    "Alluvial Soil",
    "Black Soil (Regur Soil)",
    "Red and Yellow Soil",
    "Laterite Soil",
    "Arid Soil",
    "Saline Soil",
    "Peaty Soil",
    "Forest Soil",
];


const formSchema = z.object({
  state: z.string({ required_error: "Please select a state." }),
  district: z.string({ required_error: "Please select a district." }),
  soilType: z.string({ required_error: "Please select a soil type." }),
  resources: z.string().min(10, { message: "Please describe your available resources." }),
});

export default function CropSuggestion() {
  const { t, language } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SuggestOptimalCropsOutput | null>(null);
  const [selectedState, setSelectedState] = useState<string>("");
  const { toast } = useToast();

  const indianStates = t('indianStates');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resources: "",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    setLoading(true);
    setResult(null);
    try {
      const input: SuggestOptimalCropsInput = {
        location: `${data.district}, ${data.state}`,
        soilType: data.soilType,
        resources: data.resources,
        language: language,
      }
      const response = await suggestOptimalCrops(input);
      setResult(response);
    } catch (error) {
      console.error("Error getting crop suggestions:", error);
      toast({
        variant: "destructive",
        title: t('toasts.error'),
        description: t('toasts.cropSuggestionError'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    form.setValue("state", value);
    form.resetField("district");
  }

  const districtsForSelectedState = selectedState && indianStates && indianStates[selectedState as keyof typeof indianStates] ? indianStates[selectedState as keyof typeof indianStates] : [];

  return (
    <Card className="shadow-lg w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">{t('cropSuggestion.title')}</CardTitle>
        <CardDescription className="text-center">{t('cropSuggestion.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('cropSuggestion.stateLabel')}</FormLabel>
                    <Select onValueChange={handleStateChange}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={t('cropSuggestion.statePlaceholder')} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {indianStates && Object.keys(indianStates).sort().map(state => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('cropSuggestion.districtLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedState}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={t('cropSuggestion.districtPlaceholder')} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {districtsForSelectedState && districtsForSelectedState.sort().map((district: string) => (
                                <SelectItem key={district} value={district}>{district}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="soilType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('cropSuggestion.soilTypeLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={t('cropSuggestion.soilTypePlaceholder')} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {soilTypes.map(soil => (
                                <SelectItem key={soil} value={soil}>{soil}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="resources"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('cropSuggestion.resourcesLabel')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('cropSuggestion.resourcesPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('cropSuggestion.analyzing')}
                </>
              ) : (
                t('cropSuggestion.button')
              )}
            </Button>
          </form>
        </Form>

        {result && (
          <div className="mt-8 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <ListChecks className="h-8 w-8 text-accent" />
                <div>
                  <CardTitle>{t('cropSuggestion.results.recommendedCrops')}</CardTitle>
                  <CardDescription>{t('cropSuggestion.results.recommendedCropsDesc')}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {result.crops.map((crop, index) => (
                    <li key={index} className="rounded-lg border bg-background/50 p-3 text-center font-medium">
                      {crop}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Lightbulb className="h-8 w-8 text-accent" />
                <div>
                  <CardTitle>{t('cropSuggestion.results.aiReasoning')}</CardTitle>
                  <CardDescription>{t('cropSuggestion.results.aiReasoningDesc')}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{result.reasoning}</p>
              </CardContent>
            </Card>
            
            {result.fertilizers && result.fertilizers.length > 0 && (
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Package className="h-8 w-8 text-accent" />
                        <div>
                        <CardTitle>{t('cropSuggestion.results.fertilizerTitle')}</CardTitle>
                        <CardDescription>{t('cropSuggestion.results.fertilizerDesc')}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {result.fertilizers.map((fertilizer, index) => (
                                <li key={index} className="p-4 border rounded-lg">
                                    <h4 className="font-semibold">{fertilizer.name}</h4>
                                    <p className="text-sm text-muted-foreground">{fertilizer.reason}</p>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
