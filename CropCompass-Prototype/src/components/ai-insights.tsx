"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, Loader2, BrainCircuit, Lightbulb, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
    analyzeFarmData,
    type AnalyzeFarmDataInput,
    type AnalyzeFarmDataOutput,
} from "@/ai/flows/analyze-farm-data";
import { useTranslation } from '@/hooks/use-translation';

export default function AiInsights() {
    const { t, language } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const [fileDataUri, setFileDataUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalyzeFarmDataOutput | null>(null);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                setFileDataUri(loadEvent.target?.result as string);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setFile(null);
            setFileDataUri(null);
        }
    }

    const handleAnalyze = async () => {
        if (!file || !fileDataUri) {
            toast({
                variant: "destructive",
                title: t('toasts.error'),
                description: t('toasts.fileSelectError'),
            });
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const input: AnalyzeFarmDataInput = {
                fileName: file.name,
                fileDataUri: fileDataUri,
                language,
            };
            const response = await analyzeFarmData(input);
            setResult(response);
        } catch (error) {
            console.error("Error analyzing data:", error);
            toast({
                variant: "destructive",
                title: t('toasts.error'),
                description: t('toasts.aiInsightsError'),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-lg w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">{t('aiInsights.title')}</CardTitle>
                <CardDescription className="text-center">{t('aiInsights.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center">
                    <div className="rounded-lg border-2 border-dashed border-border p-8">
                        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-sm text-muted-foreground">
                            {t('aiInsights.dropzone')}
                        </p>
                        <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".csv, .xls, .xlsx, .pdf" />
                        <Button asChild className="mt-4">
                            <label htmlFor="file-upload">
                                {t('aiInsights.chooseFile')}
                            </label>
                        </Button>
                        {file && (
                            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                <span>{file.name}</span>
                            </div>
                        )}
                    </div>
                    <Button className="mt-6 w-full md:w-1/2" disabled={!file || loading} onClick={handleAnalyze}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('aiInsights.analyzing')}
                            </>
                        ) : (
                            t('aiInsights.button')
                        )}
                    </Button>
                </div>

                {result && (
                     <div className="mt-8 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <BrainCircuit className="h-8 w-8 text-accent" />
                                <div>
                                    <CardTitle>{t('aiInsights.results.summaryTitle')}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{result.summary}</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <Lightbulb className="h-8 w-8 text-accent" />
                                <div>
                                    <CardTitle>{t('aiInsights.results.insightsTitle')}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                               <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                    {result.keyInsights.map((insight, index) => <li key={index}>{insight}</li>)}
                               </ul>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <CheckCircle className="h-8 w-8 text-accent" />
                                <div>
                                    <CardTitle>{t('aiInsights.results.recommendationsTitle')}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                    {result.recommendations.map((rec, index) => <li key={index}>{rec}</li>)}
                                </ul>
                            </CardContent>
                        </Card>
                     </div>
                )}
            </CardContent>
        </Card>
    );
}
