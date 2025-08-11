"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { PlusCircle, MinusCircle, Trash2, History, X, Package } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';


type InventoryItem = {
    id: string;
    name: string;
    quantity: number;
    unit: string;
};

type LogEntry = {
    id: string;
    itemId: string;
    timestamp: string;
    action: 'Added' | 'Used' | 'Initial';
    quantityChange: number;
    notes: string;
};

const metricUnits = ['kg', 'g', 'L', 'mL', 'units', 'packets', 'bottles'];

const formSchema = z.object({
    name: z.string().min(2, { message: 'Item name must be at least 2 characters.' }),
    quantity: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().positive({ message: 'Quantity must be a positive number.' })),
    unit: z.string({ required_error: 'Please select a unit.' }),
});

const updateQuantitySchema = z.object({
    quantity: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().positive({ message: 'Quantity must be a positive number.' })),
    notes: z.string().optional(),
})

export default function Inventory() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: '', quantity: 0 },
    });
    
    const updateQuantityForm = useForm<z.infer<typeof updateQuantitySchema>>({
        resolver: zodResolver(updateQuantitySchema),
        defaultValues: { quantity: 1, notes: '' },
    });

    const handleAddItem: SubmitHandler<z.infer<typeof formSchema>> = (data) => {
        const newItem: InventoryItem = {
            id: new Date().toISOString(),
            ...data,
        };
        setInventory(prev => [...prev, newItem]);
        
        const newLog: LogEntry = {
            id: new Date().toISOString() + '-log',
            itemId: newItem.id,
            timestamp: new Date().toLocaleString(),
            action: 'Initial',
            quantityChange: data.quantity,
            notes: 'Item added to inventory',
        }
        setLogs(prev => [...prev, newLog]);

        toast({ title: t('inventory.toasts.itemAdded'), description: `${data.name} has been added.` });
        form.reset();
    };
    
    const handleUpdateQuantity = (itemId: string, action: 'Added' | 'Used') => {
        return (data: z.infer<typeof updateQuantitySchema>) => {
            setInventory(prev => prev.map(item => {
                if (item.id === itemId) {
                    const newQuantity = action === 'Added' 
                        ? item.quantity + data.quantity 
                        : item.quantity - data.quantity;
                    
                    if (newQuantity < 0) {
                        toast({ variant: 'destructive', title: t('inventory.toasts.invalidQuantity'), description: t('inventory.toasts.notEnoughStock') });
                        return item;
                    }
                     const newLog: LogEntry = {
                        id: new Date().toISOString() + '-log',
                        itemId: item.id,
                        timestamp: new Date().toLocaleString(),
                        action,
                        quantityChange: data.quantity,
                        notes: data.notes || (action === 'Added' ? 'Stock added' : 'Stock used'),
                    };
                    setLogs(prev => [...prev, newLog]);
                    toast({ title: t('inventory.toasts.quantityUpdated'), description: `${item.name} quantity updated.` });
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }));
            updateQuantityForm.reset();
            // Close dialog manually if needed by controlling its open state
        }
    };
    
    const handleDeleteItem = (itemId: string) => {
        const item = inventory.find(i => i.id === itemId);
        setInventory(prev => prev.filter(item => item.id !== itemId));
        // Optional: Also remove logs for the deleted item
        // setLogs(prev => prev.filter(log => log.itemId !== itemId));
        if(item) {
             toast({ title: t('inventory.toasts.itemDeleted'), description: `${item.name} has been removed.` });
        }
    };
    
    const itemLogs = (itemId: string) => logs.filter(log => log.itemId === itemId).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const UpdateQuantityDialog = ({ item, action }: { item: InventoryItem, action: 'Added' | 'Used' }) => (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{action === 'Added' ? t('inventory.addStock') : t('inventory.useStock')} for {item.name}</DialogTitle>
            </DialogHeader>
            <Form {...updateQuantityForm}>
                <form onSubmit={updateQuantityForm.handleSubmit(handleUpdateQuantity(item.id, action))} className="space-y-4">
                     <FormField
                        control={updateQuantityForm.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('inventory.quantity')}</FormLabel>
                                <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={updateQuantityForm.control}
                        name="notes"
                        render={({ field }) => (
                             <FormItem>
                                <FormLabel>{t('inventory.notes')}</FormLabel>
                                <FormControl><Input placeholder={t('inventory.notesPlaceholder')} {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">{t('inventory.updateQuantity')}</Button>
                </form>
            </Form>
        </DialogContent>
    );

    return (
        <Card className="shadow-lg w-full max-w-6xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">{t('inventory.title')}</CardTitle>
                <CardDescription className="text-center">{t('inventory.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>{t('inventory.addItem')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleAddItem)} className="grid md:grid-cols-4 gap-4 items-end">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('inventory.itemName')}</FormLabel>
                                            <FormControl><Input placeholder={t('inventory.itemNamePlaceholder')} {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('inventory.quantity')}</FormLabel>
                                            <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="unit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('inventory.unit')}</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={t('inventory.unitPlaceholder')} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {metricUnits.map(unit => (
                                                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">{t('inventory.addItemButton')}</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2"><Package /> {t('inventory.currentStock')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('inventory.itemName')}</TableHead>
                                    <TableHead>{t('inventory.quantity')}</TableHead>
                                    <TableHead className="text-right">{t('inventory.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inventory.length > 0 ? inventory.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>{item.quantity} {item.unit}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Dialog>
                                                <DialogTrigger asChild><Button size="icon" variant="outline" className="text-green-600"><PlusCircle /></Button></DialogTrigger>
                                                <UpdateQuantityDialog item={item} action="Added" />
                                            </Dialog>
                                            <Dialog>
                                                <DialogTrigger asChild><Button size="icon" variant="outline" className="text-orange-600"><MinusCircle /></Button></DialogTrigger>
                                                <UpdateQuantityDialog item={item} action="Used" />
                                            </Dialog>
                                            <Dialog>
                                                <DialogTrigger asChild><Button size="icon" variant="outline"><History /></Button></DialogTrigger>
                                                <DialogContent className="max-w-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle>{t('inventory.logHistoryFor')} {item.name}</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="max-h-[60vh] overflow-y-auto">
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>{t('inventory.date')}</TableHead>
                                                                    <TableHead>{t('inventory.action')}</TableHead>
                                                                    <TableHead>{t('inventory.quantityChange')}</TableHead>
                                                                    <TableHead>{t('inventory.notes')}</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {itemLogs(item.id).map(log => (
                                                                    <TableRow key={log.id}>
                                                                        <TableCell>{log.timestamp}</TableCell>
                                                                        <TableCell>{log.action}</TableCell>
                                                                        <TableCell>{log.action === 'Used' ? '-' : '+'}{log.quantityChange}</TableCell>
                                                                        <TableCell>{log.notes}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size="icon" variant="destructive"><Trash2 /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{t('inventory.areYouSure')}</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {t('inventory.deleteWarning')}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>{t('inventory.cancel')}</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>
                                                        {t('inventory.confirmDelete')}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center">{t('inventory.noItems')}</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
}
