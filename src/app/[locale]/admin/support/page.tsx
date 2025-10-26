"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Video, Lightbulb, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { message } from "antd";
import { useSession } from "next-auth/react";
import { set } from "date-fns";
import { useSendMail } from "@/app/data/hooks";

export default function Support() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session }: any = useSession();

  const { mutate: sendMail } = useSendMail();

  const [mailMessage, setMailMessage] = useState({
    name: session?.user?.firstName + " " + session?.user?.lastName,
    email: session?.user?.email,
    subject: "",
    message: "",
  });

  useEffect(() => {
    if (session) {
      setMailMessage({
        name: session?.user?.firstName + " " + session?.user?.lastName,
        email: session?.user?.email,
        subject: "",
        message: "",
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await sendMail(mailMessage, {
        onSuccess: () => {
          setMailMessage({
            name: session?.user?.firstName + " " + session?.user?.lastName,
            email: session?.user?.email,
            subject: "",
            message: "",
          });
          setIsLoading(false);
          message.success("Message envoyé avec succès!");
        },
        onError: () => {
          setIsLoading(false);

          message.error("Une erreur est survenue");
        },
      });
      // Ajoutez ici votre logique d'envoi de message
    } catch (error) {
      setIsLoading(false);

      message.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: any) => {
    setMailMessage({
      ...mailMessage,
      [e.target.name]: e.target.value,
    });
  };

  console.log("mailMessage", mailMessage);

  const tips = [
    {
      title: "Création de facture",
      content:
        "Pour créer une facture, commencez par sélectionner un client...",
      video: "https://youtube.com/watch?v=example1",
    },
    {
      title: "Gestion des clients",
      content: "Ajoutez, modifiez ou supprimez vos clients facilement...",
      video: "https://youtube.com/watch?v=example2",
    },
    // Ajoutez d'autres astuces ici
  ];

  return (
    <PageWrapper title="Support">
      <div className="max-w-5xl mx-auto space-y-8">
        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Nous contacter
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Aide & Astuces
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contactez-nous</CardTitle>
                <CardDescription>
                  Nous sommes là pour vous aider. Envoyez-nous votre message.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nom</label>
                      <Input
                        placeholder="Votre nom"
                        name="name"
                        value={mailMessage.name}
                        required
                        readOnly={session}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        placeholder="Votre email"
                        name="email"
                        readOnly={session}
                        value={mailMessage.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sujet</label>
                    <Input
                      placeholder="Sujet de votre message"
                      name="subject"
                      value={mailMessage.subject}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      placeholder="Votre message..."
                      name="message"
                      value={mailMessage.message}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      "Envoi en cours..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="help">
            <div className="grid gap-6 md:grid-cols-2">
              {tips.map((tip, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      {tip.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">{tip.content}</p>
                    {tip.video && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(tip.video, "_blank")}
                      >
                        <Video className="mr-2 h-4 w-4" />
                        Voir la vidéo
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
}
