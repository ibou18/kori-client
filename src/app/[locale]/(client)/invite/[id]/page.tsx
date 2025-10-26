"use client";
import { useGetUsersbyToken, useUpdateUser } from "@/app/data/hooks";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from "react";
import Image from "next/image";
import { GET_USERS, LOGO_BLACK } from "@/shared/constantes";
import { message } from "antd";
import queryClient from "@/config/reactQueryConfig";

const formSchema = z.object({
  id: z.string(),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export default function InvitePage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: userByToken, isLoading }: any = useGetUsersbyToken(
    id as string
  );

  const { mutate: updateUser } = useUpdateUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (userByToken) {
      form.reset({
        firstName: userByToken.firstName || "",
        lastName: userByToken.lastName || "",
        email: userByToken.email || "",
        password: "",
      });
    }
  }, [userByToken, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      console.log("Form values:", values);

      await updateUser(
        { id: userByToken.id, data: values },
        {
          onSuccess: () => {
            message.success("Account created successfuly please login!", 10);
            queryClient.invalidateQueries({ queryKey: [GET_USERS] });

            form.reset();
            router.push("/auth/signin");
          },
        }
      );
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="container mx-auto py-5 max-w-xl">
      <Image
        src={LOGO_BLACK}
        alt="logo"
        width={200}
        height={200}
        className="mx-auto mt-0 mb-5"
      />
      <Card>
        <CardHeader>
          <CardTitle>Mettre à jour votre compte</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input placeholder="Prénom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom" {...field} />
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
                      <Input
                        placeholder="Email"
                        {...field}
                        disabled
                        className="bg-gray-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouveau mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Entrez votre nouveau mot de passe"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                onClick={() => onSubmit(form.getValues())}
                type="submit"
                className="w-full mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Mise à jour..." : "Mettre à jour"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
