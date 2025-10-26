/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
// import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, ImageIcon, Trash2Icon } from "lucide-react";

import { formatCurrency } from "@/utils/formatCurrency";
import { useRouter } from "next/navigation";

import {
  useCreateClient,
  useCreateInvoice,
  useGetClients,
  useGetInvoices,
  useGetUser,
} from "../data/hooks";
import { message } from "antd";
import queryClient from "@/config/reactQueryConfig";
import { GET_CLIENTS } from "@/shared/constantes";
import Image from "next/image";
import Link from "next/link";

interface iAppProps {
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  company: string;
}

const TPS_RATE = 0.05; // Exemple de taux de TPS de 5%
const TVQ_RATE = 0.09975; // Exemple de taux de TVQ de 9.975%

export function CreateInvoice({
  address,
  email,
  firstName,
  lastName,
  company,
}: iAppProps) {
  const { data: session }: any = useSession(); // Session next-auth
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [includeTaxes, setIncludeTaxes] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currency, setCurrency] = useState("CAD");
  const [selectedClient, setSelectedClient] = useState({
    id: "",
    name: "",
    email: "",
  });

  const [invoiceItems, setInvoiceItems] = useState([
    { id: "", description: "", quantity: 1, price: 0, amount: 0 },
  ]);

  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    userId: session?.user?.id,
  });

  const calculateSubtotal = () => {
    return invoiceItems.reduce((total, item) => total + item.amount, 0);
  };

  const calculateTaxes = (subtotal: number) => {
    const tps = includeTaxes ? subtotal * TPS_RATE : 0;
    const tvq = includeTaxes ? subtotal * TVQ_RATE : 0;

    return { tps, tvq };
  };

  const subtotal = useMemo(() => {
    return invoiceItems.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
  }, [invoiceItems]);

  const { tps, tvq } = useMemo(() => {
    const tpsAmount = includeTaxes ? subtotal * TPS_RATE : 0;
    const tvqAmount = includeTaxes ? subtotal * TVQ_RATE : 0;
    return {
      tps: tpsAmount,
      tvq: tvqAmount,
      bigTotal: subtotal + tpsAmount + tvqAmount,
    };
  }, [subtotal, includeTaxes]);

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const { tps, tvq } = calculateTaxes(subtotal);
    return Number(subtotal + tps + tvq);
  };

  const [invoiceCount, setInvoiceCount] = useState(0);

  const { data: user } = useGetUser(session?.user?.id);
  const { mutate: createClientMutate } = useCreateClient();
  const { mutate: createInvoiceMutate } = useCreateInvoice();
  // Récupération des clients
  const { data: clients } = useGetClients();

  // Ajout d'un nouveau client
  const handleAddClient = async () => {
    if (session.user.id === undefined) return;
    newClient.userId = session.user.id;
    try {
      await createClientMutate(newClient);
      queryClient.invalidateQueries({ queryKey: [GET_CLIENTS] });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding client:", error);
    }
  };

  const { data: invoices } = useGetInvoices();
  console.log("invoices", invoices);

  // Calcul du total
  // const calcualteTotal = (Number(quantity) || 0) * (Number(price) || 0);
  // Calculate Subtotal
  const calcualteTotal = useMemo(() => {
    return invoiceItems.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );
  }, [invoiceItems]);

  // Génération d'un invoice number basé sur la date et le nombre d'invoices
  const timestamp = useMemo(() => {
    return format(new Date(), "yyyyMMddHHmmss");
  }, []);

  // Sélection du client
  const handleClientChange = (value: string) => {
    const client = clients.find((c: any) => c.id === value);
    if (client) {
      setSelectedClient({
        id: client.id,
        name: client.name,
        email: client.email,
      });
    }
  };
  // console.log("selectedClient", selectedClient.name.slice(0, 3).toUpperCase());
  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedClient.id === "") {
      alert("Please select a client");
      return;
    } else if (invoiceItems.length === 0) {
      alert("Please add an item");
      return;
    } else if (invoiceItems.some((item) => item.description === "")) {
      alert("Please fill in the item description");
      return;
    } else if (invoiceItems.some((item) => item.quantity === 0)) {
      alert("Please fill in the item quantity");
      return;
    } else if (invoiceItems.some((item) => item.price === 0)) {
      alert("Please fill in the item price");
      return;
    } else if (invoiceItems.some((item) => item.amount === 0)) {
      alert("Please fill in the item amount");
      return;
    } else if (selectedDate === null) {
      alert("Please select a date");
      return;
    }

    setLoading(false);
    setInvoiceCount(invoiceCount + 1);

    if (isSubmitting) return; // Evite les doubles soumissions

    setIsSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    // Nettoyage des champs inutiles (si besoin)
    const cleanedData: any = Object.fromEntries(
      Object.entries(data).filter(([key]) => !key.startsWith("invoiceItem"))
    );

    // Ajout d'informations supplémentaires
    cleanedData.userId = session?.user?.id;
    cleanedData.invoiceName = `${selectedClient.name
      .slice(0, 3)
      .toUpperCase()}${timestamp}`;
    cleanedData.invoiceNumber = Number(Math.floor(Math.random() * 1000));
    cleanedData.totalTps = includeTaxes ? tps : 0;
    cleanedData.totalTvq = includeTaxes ? tvq : 0;
    cleanedData.bigTotal = calculateTotal();

    // Ajout des invoiceItems depuis l'état
    cleanedData.invoiceItems = invoiceItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      total: item.amount,
    }));
    setIsSubmitting(false);
    try {
      await createInvoiceMutate(cleanedData, {
        onSuccess: () => {
          message.success("Invoice created successfully!");
          router.push("/admin/invoices");
        },
      });
    } catch (error) {
      console.error("Error submitting the form:", error);
      // Gérer l'erreur : afficher un message, etc.
    }
  };
  // Function to handle adding a new item
  const addItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        id: `temp-${Date.now()}`,
        description: "",
        quantity: 0,
        price: 0,
        amount: 0,
      },
    ]);
  };

  // Function to handle removing an item
  const removeItem = (id: string) => {
    console.log("id", id);
    setInvoiceItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Function to handle input changes
  const handleItemChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const items: any = [...invoiceItems];
    items[index][field] = value;
    if (field === "quantity" || field === "price") {
      items[index].amount =
        Number(items[index].quantity) * Number(items[index].price);
    }
    setInvoiceItems(items);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="lg:flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{company}</h1>
          {user?.company?.logo ? (
            <Image
              src={user.company.logo}
              alt="Logo de l'entreprise"
              width={50}
              height={50}
              className="rounded-lg object-cover"
            />
          ) : (
            <Link href="/admin/account">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Ajouter un logo</span>
              </Button>
            </Link>
          )}
        </div>
        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            // Empêche la soumission par Enter
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          noValidate
        >
          {/* Champs cachés ou calculés */}
          <input type="hidden" name="date" value={selectedDate.toISOString()} />
          <input type="hidden" name="bigTotal" value={Number(calcualteTotal)} />
          <input type="hidden" name="clientId" value={selectedClient.id} />

          {/* Invoice Number et Currency */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>Invoice No.</Label>
              <div className="flex">
                <span className="px-3 border border-r-0 rounded-l-md bg-muted flex items-center">
                  #
                </span>
                <Input
                  name="invoiceNumber"
                  defaultValue={timestamp}
                  className="rounded-l-none"
                  placeholder="5"
                />
              </div>
            </div>

            <div>
              <Label>Currency</Label>
              <Select
                defaultValue={currency}
                name="currency"
                onValueChange={(value: any) => setCurrency(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAD">Dollar CANADIEN -- CAD</SelectItem>
                  <SelectItem value="USD">
                    United States Dollar -- USD
                  </SelectItem>
                  <SelectItem value="EUR">Euro -- EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* From Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>From</Label>
              <div className="space-y-2">
                <Input
                  name="fromName"
                  placeholder="Your Name"
                  defaultValue={`${firstName} ${lastName}`}
                />
                <Input
                  name="fromEmail"
                  placeholder="Your Email"
                  defaultValue={email}
                />
                <Input
                  name="fromAddress"
                  placeholder="Your Address"
                  defaultValue={address}
                />
              </div>
            </div>

            {/* To Section */}
            <div>
              <Label>To</Label>
              <div className="space-y-2">
                <div>
                  <Label>Clients List</Label>
                  {loading ? (
                    <p>Loading...</p>
                  ) : Array.isArray(clients) && clients.length > 0 ? (
                    <Select
                      name="clientId"
                      onValueChange={handleClientChange}
                      defaultValue={selectedClient.id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select clients" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client: any) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} - {client.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p>No clients available</p>
                  )}
                </div>

                {/* Ajout d'un nouveau client via Dialog */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" onClick={() => setIsModalOpen(true)}>
                      Add Client
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Client</DialogTitle>
                      <DialogDescription>
                        Fill in the client details below and click Create
                        Client.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Label>Name</Label>
                      <Input
                        value={newClient.name}
                        onChange={(e) =>
                          setNewClient({ ...newClient, name: e.target.value })
                        }
                        placeholder="Client Name"
                      />
                      <Label>Email</Label>
                      <Input
                        value={newClient.email}
                        onChange={(e) =>
                          setNewClient({ ...newClient, email: e.target.value })
                        }
                        placeholder="Client Email"
                      />
                      <Label>Address</Label>
                      <Input
                        value={newClient.address}
                        onChange={(e) =>
                          setNewClient({
                            ...newClient,
                            address: e.target.value,
                          })
                        }
                        placeholder="Client Address"
                      />
                      <Label>Phone Number</Label>
                      <Input
                        maxLength={10}
                        value={newClient.phone}
                        onChange={(e) =>
                          setNewClient({
                            ...newClient,
                            phone: e.target.value,
                          })
                        }
                        placeholder="Phone Number"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="secondary"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleAddClient}>
                        Create Client
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Date et Invoice Due */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[280px] ml-2 text-left justify-start"
                  >
                    <CalendarIcon />
                    {selectedDate
                      ? new Intl.DateTimeFormat("en-CA", {
                          dateStyle: "long",
                        }).format(selectedDate)
                      : "Pick a Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    selected={selectedDate}
                    onSelect={(date: any) =>
                      setSelectedDate(date || new Date())
                    }
                    mode="single"
                    // fromDate={new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Invoice Due</Label>
              <Select name="dueDate" defaultValue="30">
                <SelectTrigger>
                  <SelectValue placeholder="Select due date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Due on Receipt</SelectItem>
                  <SelectItem value="15">Net 15</SelectItem>
                  <SelectItem value="30">Net 30</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Champs pour Quantity, Rate et Subtotal */}
          <div>
            <p className="col-span-12 text-right my-4">
              <Button type="button" onClick={addItem}>
                + Ajouter une ligne
              </Button>
            </p>
            {/* <div className="grid grid-cols-12 gap-4 mb-2 font-medium">
              <p className="col-span-6">Description</p>
              <p className="col-span-2">Quantity</p>
              <p className="col-span-2">Rate</p>
              <p className="col-span-2">Amount</p>
            </div> */}

            {invoiceItems.map((item: any, index) => (
              <div
                className="grid lg:grid-cols-12 b-2 border-slate-400 gap-4 mb-2 align-center"
                key={index}
              >
                <div className="col-span-1 mt-6">
                  {invoiceItems.length > 1 && (
                    <Trash2Icon
                      type="button"
                      onClick={() => {
                        console.log("item", item);
                        removeItem(item.id);
                      }}
                      className="text-red-500 mt-1 cursor-pointer hover:text-red-700"
                    >
                      Remove
                    </Trash2Icon>
                  )}
                </div>
                <div className="col-span-4">
                  <label className="text-sm italic text-slate-600">
                    Description
                  </label>
                  <Input
                    name={`invoiceItemDescription-${index}`}
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                    placeholder="Item name & description"
                  />
                </div>
                <div className="lg:col-span-2 col-span-4">
                  <label className="text-sm italic text-slate-600">Qty</label>
                  <Input
                    name={`invoiceItemQuantity-${index}`}
                    type="number"
                    placeholder="0"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
                <div className="lg:col-span-2 col-span-4">
                  <label className="text-sm italic text-slate-600">Price</label>
                  <Input
                    name={`invoiceItemRate-${index}`}
                    type="number"
                    placeholder="0"
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(index, "price", Number(e.target.value))
                    }
                  />
                </div>
                <div className="lg:col-span-2 col-span-3">
                  <label className="text-sm italic text-slate-600">
                    Amount
                  </label>
                  <Input
                    value={formatCurrency({
                      amount: item.amount,
                      currency: currency as "CAD" | "USD" | "EUR",
                    })}
                    disabled
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Switch pour inclure les taxes */}
          <div className="flex items-center justify-end lg:mr-[115px] my-4">
            <Label htmlFor="includeTaxes">Include Taxes</Label>
            <Switch
              id="includeTaxes"
              checked={includeTaxes}
              onChange={setIncludeTaxes}
              className="ml-2"
            />
          </div>

          {/* Affichage du Subtotal / Taxes / Total */}
          <div className="flex justify-end lg:mr-[115px]">
            <div className="w-1/3">
              <div className="flex justify-between py-2">
                <span>Subtotal</span>
                <span>
                  {formatCurrency({
                    amount: calculateSubtotal(),
                    currency: currency as "CAD" | "USD" | "EUR",
                  })}
                </span>
              </div>
              {includeTaxes && (
                <>
                  <div className="flex justify-between py-2">
                    <span>TPS (({TPS_RATE}%)%)</span>
                    <span>
                      {formatCurrency({
                        amount: calculateTaxes(calculateSubtotal()).tps,
                        currency: currency as "CAD" | "USD" | "EUR",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>TVQ ({TVQ_RATE}%)</span>
                    <span>
                      {formatCurrency({
                        amount: calculateTaxes(calculateSubtotal()).tvq,
                        currency: currency as "CAD" | "USD" | "EUR",
                      })}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-2 border-t">
                <span>Total ({currency})</span>
                <span className="font-medium underline underline-offset-2">
                  {formatCurrency({
                    amount: calculateTotal(),
                    currency: currency as "CAD" | "USD" | "EUR",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <Label>Note</Label>
            <Textarea
              name="note"
              defaultValue=""
              placeholder="Add your Note/s right here..."
            />
          </div>

          {/* Bouton de soumission */}
          <div className="flex items-center justify-end mt-6">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
