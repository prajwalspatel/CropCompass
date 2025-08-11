
"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadCloud, Loader2, Microscope, TestTube, ShieldCheck, Leaf, AlertTriangle, MapPin, ExternalLink, ShoppingCart, LocateFixed } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
    diagnosePlant,
    type DiagnosePlantInput,
    type DiagnosePlantOutput,
} from "@/ai/flows/diagnose-plant";
import { useTranslation } from '@/hooks/use-translation';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export default function PestDiseaseDetection() {
    const { t, language } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DiagnosePlantOutput | null>(null);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                setPreviewUrl(loadEvent.target?.result as string);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setFile(null);
            setPreviewUrl(null);
        }
    }
    
    const requestLocation = () => {
        setLocationError(null);
        setIsLocating(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await response.json();
                        const address = data.address;
                        const locationString = [address.city, address.town, address.village, address.county, address.state, address.country]
                            .filter(Boolean) // Remove empty or null values
                            .join(', ');
                        setLocation(locationString || `${latitude}, ${longitude}`);
                    } catch (error) {
                        console.error("Reverse geocoding failed:", error);
                        setLocation(`${latitude}, ${longitude}`);
                    } finally {
                        setIsLocating(false);
                    }
                },
                (error) => {
                    console.error("Error getting location:", error);
                    let message = "Could not retrieve your location. Please ensure location services are enabled.";
                    if (error.code === error.PERMISSION_DENIED) {
                        message = "Location access was denied. Please enable it in your browser settings to use this feature.";
                    }
                    setLocationError(message);
                    toast({
                        variant: "destructive",
                        title: "Location Error",
                        description: message,
                    });
                    setIsLocating(false);
                }
            );
        } else {
            const message = "Geolocation is not supported by this browser.";
            setLocationError(message);
             toast({
                variant: "destructive",
                title: "Location Error",
                description: message,
            });
            setIsLocating(false);
        }
    };

    const handleAnalyze = async () => {
        if (!file || !previewUrl) {
            toast({
                variant: "destructive",
                title: t('toasts.error'),
                description: t('toasts.fileSelectError'),
            });
            return;
        }
        if (!location) {
            toast({
                variant: "destructive",
                title: t('toasts.error'),
                description: t('toasts.locationRequiredError'),
            });
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const input: DiagnosePlantInput = {
                description: description,
                photoDataUri: previewUrl,
                location: location,
                language: language,
            };
            const response = await diagnosePlant(input);
            setResult(response);
        } catch (error) {
            console.error("Error diagnosing plant:", error);
            toast({
                variant: "destructive",
                title: t('toasts.error'),
                description: t('toasts.pestDetectionError'),
            });
        } finally {
            setLoading(false);
        }
    };
    
    const renderTreatmentMethods = (methods: { method: string; priceRange: string }[]) => (
        <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
            {methods.map((item, i) => (
                <li key={i}>{item.method} ({item.priceRange})</li>
            ))}
        </ul>
    );


    return (
        <Card className="shadow-lg w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">{t('pestDetection.title')}</CardTitle>
                <CardDescription className="text-center">{t('pestDetection.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-8 items-start">
                     <div className="flex flex-col gap-4">
                        <div 
                            className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 h-64 cursor-pointer"
                             onClick={() => fileInputRef.current?.click()}
                        >
                            {previewUrl ? (
                                <Image src={previewUrl} alt="Plant preview" layout="fill" objectFit="contain" className="rounded-lg" />
                            ) : (
                                <>
                                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <p className="mt-4 text-sm text-center text-muted-foreground">
                                        {t('pestDetection.dropzone')}
                                    </p>
                                </>
                            )}
                        </div>
                        <Input id="file-upload" type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />

                         <Button onClick={requestLocation} variant="outline" disabled={isLocating}>
                            <LocateFixed className="mr-2 h-4 w-4" />
                            {isLocating ? "Getting Location..." : (location ? "Update Location" : "Get Current Location")}
                        </Button>
                        
                        {location && !isLocating && (
                             <div className="text-xs text-center text-muted-foreground p-2 bg-muted rounded-md">
                                <strong>Detected Location:</strong> {location}
                             </div>
                        )}

                         {locationError && (
                            <Alert variant="destructive">
                                <AlertTitle>Location Error</AlertTitle>
                                <AlertDescription>{locationError}</AlertDescription>
                            </Alert>
                        )}


                        <Textarea
                            placeholder={t('pestDetection.descriptionPlaceholder')}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />

                        <Button className="w-full" disabled={!file || !location || loading} onClick={handleAnalyze}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('pestDetection.analyzing')}
                                </>
                            ) : (
                                <>
                                    <Microscope className="mr-2 h-4 w-4" />
                                    {t('pestDetection.button')}
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {result && result.identification.isPlant && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Leaf /> {t('pestDetection.results.plantIdentification')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm">
                                    <p><strong>{t('pestDetection.results.commonName')}:</strong> {result.identification.commonName}</p>
                                    <p><strong>{t('pestDetection.results.latinName')}:</strong> <em>{result.identification.latinName}</em></p>
                                </CardContent>
                            </Card>
                        )}

                        {result && (
                            <Card>
                                 <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Microscope /> {t('pestDetection.results.diagnosis')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <strong>{t('pestDetection.results.healthStatus')}:</strong> 
                                        {result.diagnosis.isHealthy ? 
                                            <Badge variant="default" className="bg-green-600">{t('pestDetection.results.healthy')}</Badge> : 
                                            <Badge variant="destructive">{t('pestDetection.results.unhealthy')}</Badge>
                                        }
                                    </div>
                                    {!result.diagnosis.isHealthy && (
                                        <>
                                            <p><strong>{t('pestDetection.results.detectedIssue')}:</strong> {result.diagnosis.diseaseOrPest}</p>
                                            <p><strong>{t('pestDetection.results.confidence')}:</strong> {result.diagnosis.confidence}</p>
                                            <p><strong>{t('pestDetection.results.symptoms')}:</strong> {result.diagnosis.description}</p>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                        
                        {result && !result.diagnosis.isHealthy && (
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><TestTube /> {t('pestDetection.results.treatment')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div>
                                        <h4 className="font-semibold">{t('pestDetection.results.organicMethods')}</h4>
                                        {renderTreatmentMethods(result.treatment.organic)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{t('pestDetection.results.chemicalMethods')}</h4>
                                        {renderTreatmentMethods(result.treatment.chemical)}
                                    </div>
                                     {result.googleMapsSearchLink && (
                                        <div className="pt-2">
                                            <Button asChild size="sm">
                                                <Link href={result.googleMapsSearchLink} target="_blank" rel="noopener noreferrer">
                                                    <MapPin className="mr-2 h-4 w-4" />
                                                    {t('pestDetection.results.findStores')}
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {result && result.ecommerceLinks.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><ShoppingCart /> {t('pestDetection.results.buyOnline')}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-wrap gap-2">
                                    {result.ecommerceLinks.map((link) => (
                                        <Button asChild key={link.siteName} variant="secondary" size="sm">
                                            <Link href={link.searchUrl} target="_blank" rel="noopener noreferrer">
                                                Search on {link.siteName}
                                                <ExternalLink className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {result && !result.diagnosis.isHealthy && (
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><ShieldCheck /> {t('pestDetection.results.prevention')}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm">
                                     <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                        {result.prevention.map((tip, i) => <li key={i}>{tip}</li>)}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                         {result && !result.identification.isPlant && (
                             <Card className="border-amber-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-amber-600"><AlertTriangle /> {t('pestDetection.results.noPlant')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>{t('pestDetection.results.noPlantDesc')}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

    
