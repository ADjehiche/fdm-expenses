'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { UserPlus } from 'lucide-react';
import { handleCreateAccount } from './CreateAccount';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
// import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const CreateAccountSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  familyName: z.string().min(1, 'Family name is required'),
  email: z.string().email('Valid email is required'),
  plainPassword: z.string().min(6, 'Password must be at least 6 characters'),
  region: z.string().min(1, 'Region is required'),
  employeeClassification: z.string().min(1, 'Classification is required'),
  employeeRole: z.string().min(1, 'Role is required'),
  lineManagerId: z.string().optional(),
});

function CreateAccountPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof CreateAccountSchema>>({
    resolver: zodResolver(CreateAccountSchema),
    defaultValues: {
      firstName: '',
      familyName: '',
      email: '',
      plainPassword: '',
      region: '',
      employeeClassification: '',
      employeeRole: '',
      lineManagerId: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof CreateAccountSchema>) => {
    setIsLoading(true);
    setStatus(null);
    
    // Convert form data to FormData for the existing handler
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    
    const result = await handleCreateAccount(formData);
    
    if (result && 'error' in result === false) {
      setStatus('✅ Account created successfully!');
      form.reset();
    } else {
      setStatus(result?.error || '❌ Failed to create account.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 text-black">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Create New Account</h1>
      </div>
      
        <Card className="border-0 shadow-md w-full">
          <CardHeader className="bg-fdm-blue text-white rounded-t-lg">
            <CardTitle className="flex items-center text-black">
              <UserPlus className="mr-2 h-5 w-5" />
              Account Details
            </CardTitle>
            <CardDescription className="text-black">
              Fill in the details to create a new user account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            {status && (
              <div className={`p-3 mb-6 rounded-md text-sm ${status.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {status}
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First Name" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="familyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Family Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Family Name" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-500 font-medium" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="plainPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Password" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-500 font-medium" />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region</FormLabel>
                        <FormControl>
                          <Input placeholder="Region" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="employeeClassification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Classification</FormLabel>
                        <FormControl>
                          <select 
                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="">Select Classification</option>
                            <option value="Internal">Internal</option>
                            <option value="External">External</option>
                          </select>
                        </FormControl>
                        <FormMessage className="text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employeeRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <select 
                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="">Select Role</option>
                            <option value="Administrator">Administrator</option>
                            <option value="PayrollOfficer">Payroll Officer</option>
                            <option value="GeneralStaff">Staff</option>
                            <option value="Consultant">Consultant</option>
                            <option value="LineManager">Line Manager</option>
                          </select>
                        </FormControl>
                        <FormMessage className="text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lineManagerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Line Manager ID (optional)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" placeholder="Line Manager ID (if any)" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <CardFooter className="px-0 pt-6">
                  <Button 
                    type="submit" 
                    className="bg-[#c3fa04] hover:bg-[#c3fa04]/90 text-black font-medium w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
  );
}

export default CreateAccountPage;