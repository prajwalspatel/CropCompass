
"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getCropDistribution,
  type GetCropDistributionInput,
  type GetCropDistributionOutput,
} from "@/ai/flows/get-crop-distribution";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BarChart, PieChart } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import {
    BarChart as RechartsBarChart,
    PieChart as RechartsPieChart,
    Bar,
    Pie,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell,
    ResponsiveContainer
} from 'recharts';


const formSchema = z.object({
  graphType: z.string({ required_error: "Please select a graph type." }),
  location: z.string().optional(),
});

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#FF4560', '#775DD0', '#5A2A27'];

export default function CropDistribution() {
  const { t, language } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GetCropDistributionOutput | null>(null);
  const [graphType, setGraphType] = useState<string | null>(null);
  const { toast } = useToast();

  const indianStates = t('indianStates');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    setLoading(true);
    setResult(null);
    setGraphType(data.graphType);
    try {
      const input: GetCropDistributionInput = {
        graphType: data.graphType,
        location: data.location,
        language,
      };
      const response = await getCropDistribution(input);
      setResult(response);
    } catch (error) {
      console.error("Error getting crop distribution:", error);
      toast({
        variant: "destructive",
        title: t('toasts.error'),
        description: t('toasts.cropDistributionError'),
      });
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (!result?.data) return null;

    switch (graphType) {
        case 'Bar Chart':
            return (
                <ResponsiveContainer width="100%" height={400}>
                    <RechartsBarChart data={result.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" name="Production (in % of total)" />
                    </RechartsBarChart>
                </ResponsiveContainer>
            );
        case 'Pie Chart':
            return (
                <ResponsiveContainer width="100%" height={400}>
                    <RechartsPieChart>
                        <Pie
                            data={result.data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {result.data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </RechartsPieChart>
                </ResponsiveContainer>
            );
        default:
            return null;
    }
  }

  return (
    <Card className="shadow-lg w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">{t('cropDistribution.title')}</CardTitle>
        <CardDescription className="text-center">{t('cropDistribution.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="graphType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('cropDistribution.graphTypeLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={t('cropDistribution.graphTypePlaceholder')} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Bar Chart">{t('cropDistribution.barChart')}</SelectItem>
                            <SelectItem value="Pie Chart">{t('cropDistribution.pieChart')}</SelectItem>
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
                    <FormLabel>{t('cropSuggestion.stateLabel')} (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={t('cropDistribution.statePlaceholder')} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="India">All India</SelectItem>
                            {indianStates && Object.keys(indianStates).sort().map(state => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('cropDistribution.generating')}
                </>
              ) : (
                t('cropDistribution.button')
              )}
            </Button>
          </form>
        </Form>

        {result && (
          <div className="mt-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {graphType === 'Bar Chart' && <BarChart />}
                    {graphType === 'Pie Chart' && <PieChart />}
                    {result.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderChart()}
                <p className="text-sm text-muted-foreground mt-4">{result.insights}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
