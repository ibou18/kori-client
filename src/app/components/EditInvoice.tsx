/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CalendarIcon, Trash2Icon } from "lucide-react";

import { formatCurrency } from "@/utils/formatCurrency";
import { useParams, useRouter } from "next/navigation";
import {
  useCreateUser,
  useGetClients,
  useGetInvoice,
  useUpdateInvoice,
} from "../data/hooks";
import { InvoiceItem } from "../interface";
import { message } from "antd";
import queryClient from "@/config/reactQueryConfig";
import { GET_CLIENTS, GET_INVOICES } from "@/shared/constantes";

const TPS_RATE = 0.05; // TPS (Taxe fédérale)
const TVQ_RATE = 0.09975; // TVQ (Taxe provinciale)

export function EditInvoice() {
  const { data: session }: any = useSession(); // Session next-auth
  const router = useRouter();
  const { invoiceId } = useParams<{ invoiceId: string }>();

  const { data: invoice, refetch: refetechInvoice } = useGetInvoice(
    invoiceId as string
  );
  const { data: clients } = useGetClients();
  const { mutate: updateInvoiceMutate } = useUpdateInvoice();
  const { mutate: createUserMutate } = useCreateUser();

  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [currency, setCurrency] = useState("CAD");
  const [includeTaxes, setIncludeTaxes] = useState<boolean | undefined>(
    undefined
  ); // Nouvelle gestion des taxes
  const [selectedClient, setSelectedClient] = useState<{
    id: string;
    name: string;
    email: string;
  }>({
    id: "",
    name: "",
    email: "",
  });

  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    userId: session?.user?.id,
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [note, setNote] = useState<any>("");

  useEffect(() => {
    if (invoice) {
      setInvoiceData(invoice);
      setInvoiceItems(invoice.invoiceItems || []);
      setSelectedDate(new Date(invoice.date));
      setCurrency(invoice.currency);
      setIncludeTaxes(invoice.totalTps > 0 || invoice.totalTvq > 0);
      setSelectedClient({
        id: invoice?.client?.id || "",
        name: invoice?.client?.name || "",
        email: invoice?.client?.email || "",
      });
      setNote(invoice?.note);
    }
  }, [invoice]);

  // Calculer le sous-total
  const subtotal = useMemo(() => {
    return invoiceItems.reduce(
      (total, item: any) => total + item.quantity * item.price,
      0
    );
  }, [invoiceItems]);

  console.log("selectedClient", selectedClient);

  // Calculer les taxes et le total
  const { tps, tvq, total } = useMemo(() => {
    const tpsAmount = includeTaxes ? subtotal * TPS_RATE : 0;
    const tvqAmount = includeTaxes ? subtotal * TVQ_RATE : 0;
    return {
      tps: tpsAmount,
      tvq: tvqAmount,
      total: subtotal + tpsAmount + tvqAmount,
    };
  }, [subtotal, includeTaxes]);

  // Ajout d'un nouveau client
  const handleAddClient = async () => {
    newClient.userId = session?.user?.id;
    try {
      await createUserMutate(newClient, {
        onSuccess: () => {
          message.success("Client added successfully!");
          queryClient.invalidateQueries({ queryKey: [GET_CLIENTS] });
        },
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding client:", error);
    }
  };

  // Calculating Subtotal
  const calculateSubtotal = useMemo(() => {
    return invoiceItems.reduce(
      (acc, item: any) => acc + item.quantity * item.price,
      0
    );
  }, [invoiceItems]);

  // Calculating Total (assuming no additional taxes or fees)
  const calculateTotal = useMemo(() => {
    return calculateSubtotal;
  }, [calculateSubtotal]);

  // Sélection du client
  const handleClientChange = (value: string) => {
    const client = clients && clients.find((c: any) => c.id === value);
    if (client) {
      setSelectedClient({
        id: client.id,
        name: client.name,
        email: client.email,
      });
    }
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (isSubmitting) return;

    setIsSubmitting(true);

    const updatedInvoice = {
      id: invoiceId,
      total,
      currency,
      date: selectedDate.toISOString(),
      bigTotal: total,
      invoiceItems: invoiceItems,
      clientId: selectedClient.id,
      totalTps: tps,
      totalTvq: tvq,
      note,
    };

    try {
      await updateInvoiceMutate(updatedInvoice);
      refetechInvoice();
      queryClient.invalidateQueries({ queryKey: [GET_INVOICES] });
      message.success("Invoice updated successfully!");
      router.push("/admin/invoices");
    } catch (error) {
      setLoading(false);
      console.error("Error submitting the form:", error);
    } finally {
      setLoading(false);

      setIsSubmitting(false);
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
        total: 0,
      },
    ]);
  };

  // Function to handle removing an item
  const removeItem = (id: string) => {
    setInvoiceItems(invoiceItems.filter((item) => item.id !== id));
  };

  // Function to handle input changes
  const handleItemChange = (
    id: string,
    field: keyof Omit<InvoiceItem, "id" | "amount">,
    value: string | number
  ) => {
    setInvoiceItems((prevItems) =>
      prevItems.map((item) => {
        if (id && item.id !== id) return item;

        // Safely parse numerical fields
        const quantity =
          field === "quantity" ? Number(value) : Number(item.quantity);
        const price = field === "price" ? Number(value) : Number(item.price);

        // Fallback to 0 if parsing results in NaN
        const validQuantity = isNaN(quantity) ? 0 : quantity;
        const validRate = isNaN(price) ? 0 : price;

        const newAmount = validQuantity * validRate;

        return {
          ...item,
          [field]:
            field === "quantity" || field === "price"
              ? field === "quantity"
                ? validQuantity
                : validRate
              : value,
          total: newAmount,
        };
      })
    );
  };

  console.log("invoiceData", invoiceData);

  if (loading || !invoiceData) {
    return <p>Loading...</p>;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="lg:flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold"> {invoiceData?.User?.company} </h1>
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
          <input type="hidden" name="total" value={calculateTotal} />
          <input type="hidden" name="clientId" value={selectedClient.id} />
          <input type="hidden" name="clientName" value={selectedClient.name} />
          <input
            type="hidden"
            name="clientEmail"
            value={selectedClient.email}
          />

          {/* Champ: Invoice Name */}
          <div className="flex flex-col gap-1 w-fit mb-6">
            <div className="flex items-center gap-4">
              <Badge variant="secondary">Edit</Badge>
              <Input
                name="invoiceName"
                defaultValue={invoiceData.invoiceName}
                placeholder="Invoice Name"
              />
            </div>
          </div>

          {/* Invoice Number et Currency */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <Label>Invoice No.</Label>
              <div className="flex">
                <span className="px-3 border border-r-0 rounded-l-md bg-muted flex items-center">
                  #
                </span>
                <Input
                  name="invoiceNumber"
                  defaultValue={invoiceData.invoiceNumber}
                  className="rounded-l-none"
                  placeholder="5"
                  readOnly
                />
              </div>
            </div>

            <div>
              <Label>Currency</Label>
              <Select
                defaultValue={currency}
                name="currency"
                onValueChange={(value) => setCurrency(value)}
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
                  defaultValue={invoiceData?.user?.firstName}
                />
                <Input
                  name="fromEmail"
                  placeholder="Your Email"
                  defaultValue={invoiceData?.user?.email}
                />
                <Input
                  name="fromAddress"
                  placeholder="Your Address"
                  defaultValue={invoiceData?.user?.address}
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
                      value={selectedClient.id}
                      disabled={loading}
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
                      ? new Intl.DateTimeFormat("en-US", {
                          dateStyle: "long",
                        }).format(selectedDate)
                      : "Pick a Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    selected={selectedDate}
                    onSelect={(date) => setSelectedDate(date || new Date())}
                    mode="single"
                    fromDate={new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Invoice Due</Label>
              <Select
                name="dueDate"
                defaultValue={invoiceData.dueDate?.toString()}
              >
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

          {/* Champs pour Quantity, Price et Subtotal */}
          <div>
            <p className="col-span-12 text-right my-4">
              <Button type="button" onClick={addItem}>
                + Ajouter une ligne
              </Button>
            </p>
            {/* <div className="hidden lg:grid id grid-cols-10 gap-4 mb-2 font-medium ">
              <p className="col-span-4">Description</p>
              <p className="col-span-1">Quantity</p>
              <p className="col-span-2">Price</p>
              <p className="col-span-2">Amount</p>
              <p className="col-span-0.">Actions</p>
            </div> */}

            {invoiceItems.map((item: InvoiceItem) => (
              <div
                className="grid lg:grid-cols-12 b-2 border-slate-400 gap-4 mb-2 align-center"
                key={item.id}
              >
                <div className="col-span-1 mt-6">
                  {invoiceItems.length > 1 && (
                    <Trash2Icon
                      type="button"
                      onClick={() => removeItem(item.id || "")}
                      className="text-red-500 mt-1"
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
                    name={`invoiceItemDescription-${item.id}`}
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(
                        item.id || "",
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="Item name & description"
                  />
                </div>
                <div className="lg:col-span-2 col-span-4">
                  <label className="text-sm italic text-slate-600">Qty</label>
                  <Input
                    name={`quantity-${item.id}`}
                    type="number"
                    placeholder="0"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        item.id || "",
                        "quantity",
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
                <div className="lg:col-span-2 col-span-4">
                  <label className="text-sm italic text-slate-600">Price</label>
                  <Input
                    name={`price-${item.id}`}
                    type="number"
                    placeholder="0"
                    value={item.price || 0}
                    onChange={(e) =>
                      handleItemChange(
                        item.id || "",
                        "price",
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
                <div className="lg:col-span-2 col-span-3">
                  <label className="text-sm italic text-slate-600">Total</label>
                  <Input
                    value={
                      isNaN(item.amount ?? 0)
                        ? formatCurrency({
                            amount: 0,
                            currency: currency as any,
                          })
                        : formatCurrency({
                            amount: item.total ?? 0,
                            currency: currency as any,
                          })
                    }
                    disabled
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Taxes Switch */}
          <div className="flex items-center justify-end mb-4">
            <Label htmlFor="includeTaxes">Include Taxes</Label>
            <Switch
              id="includeTaxes"
              checked={includeTaxes}
              onChange={setIncludeTaxes}
              className="ml-2"
            />
          </div>

          <div className="flex justify-end">
            <div className="w-1/3">
              <div className="flex justify-between py-2">
                <span>Subtotal</span>
                <span>
                  {formatCurrency({
                    amount: subtotal,
                    currency: currency as "CAD" | "USD" | "EUR",
                  })}
                </span>
              </div>
              {includeTaxes && (
                <>
                  <div className="flex justify-between py-2">
                    <span>TPS (5%)</span>
                    <span>
                      {formatCurrency({
                        amount: tps,
                        currency: currency as "CAD" | "USD" | "EUR",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>TVQ (9.975%)</span>
                    <span>
                      {formatCurrency({
                        amount: tvq,
                        currency: currency as "CAD" | "USD" | "EUR",
                      })}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-2 border-t">
                <span>Total</span>
                <span className="font-medium">
                  {formatCurrency({
                    amount: total,
                    currency: currency as "CAD" | "USD" | "EUR",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Affichage du Subtotal / Total */}
          {/* <div className="flex justify-end lg:mr-[115px]">
            <div className="w-1/3">
              <div className="flex justify-between py-2">
                <span>Subtotal</span>
                <span>
                  {formatCurrency({
                    amount: calculateTotal,
                    currency: currency as any,
                  })}
                </span>
              </div>

              <div className="flex justify-between py-2 border-t">
                <span>Total ({currency})</span>
                <span>
                  {isNaN(calculateTotal)
                    ? formatCurrency({ amount: 0, currency: currency as any })
                    : formatCurrency({
                        amount: calculateTotal,
                        currency: currency as any,
                      })}
                </span>
              </div>
            </div>
          </div> */}

          {/* Note */}
          <div>
            <Label>Note</Label>
            <Textarea
              name="note"
              value={note}
              onChange={(e) => setNote(e.target.value)} // Capture les changements
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
