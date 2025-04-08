"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { fetchUserById } from './EditAccount';

import { UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const EditUserPage = () => {
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm();

  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    const userID = searchParams.get('userID');
    if (userID) {
      fetchUserById(parseInt(userID)).then((data) => {
        if (data) {
          const user = data[0];
          console.log('Fetched User:', user);
          setUserData(data);
          setValue('firstName', user.firstName);
          setValue('familyName', user.familyName);
          setValue('email', user.email);
          // setValue('plainPassword', user.plainPassword);
          setValue('employeeRole', user.employeeRole.employeeType);
          setValue('region', user.region);
          setValue('employeeClassification', user.employeeClassification);
          setValue('lineManagerId', user.employeeRole.lineManager);
        }
      });
    }
  }, [searchParams, setValue]);

  const onSubmit = (data: any) => {
    console.log('Updated User Data:', data);
  };

  return (
    <div className="space-y-6 text-black">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit User</h1>
      </div>

      <Card className="border-0 shadow-md w-full">
        <CardHeader className="bg-fdm-blue text-white rounded-t-lg">
          <CardTitle className="flex items-center text-black">
            <UserPlus className="mr-2 h-5 w-5" />
            User Details
          </CardTitle>
          <CardDescription className="text-black">
            Update the information of the selected user
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
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
                        <Input placeholder="First Name"{...register('firstName')} />
                      </FormControl>
                      <FormMessage />
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
                        <Input placeholder="Family Name"{...register('familyName')} />
                      </FormControl>
                      <FormMessage />
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
                      <Input type="email" placeholder="Email"{...register('email')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <FormField
                control={form.control}
                name="plainPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Leave blank to keep current password"{...register('plainPassword')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <FormControl>
                        <Input placeholder="Region"{...register('region')} />
                      </FormControl>
                      <FormMessage />
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
                          {...register('employeeClassification')}
                        >
                          <option value=""></option>
                          <option value="Internal">Internal</option>
                          <option value="External">External</option>
                        </select>
                      </FormControl>
                      <FormMessage className="text-red-500 font-medium" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employeeRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                          {...register('employeeRole')}
                        >
                          <option value=""></option>
                          <option value="Administrator">Administrator</option>
                          <option value="Payroll Officer">Payroll Officer</option>
                          <option value="Line Manager">Line Manager</option>
                          <option value="General Staff">Staff</option>
                          <option value="Consultant">Consultant</option>
                        </select>
                      </FormControl>
                      <FormMessage />
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
                        <Input
                          type="number"
                          min="1"
                          placeholder=""{...register('lineManagerId')}
                        />
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
                  {isLoading ? "Saving Changes..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditUserPage;