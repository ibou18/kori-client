/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
import { useState } from "react";
import { signIn } from "next-auth/react";
import { IClient, IUser } from "@/app/interface";
import Link from "next/link";
import { Form, Input, Button, message, Checkbox, Select, Spin } from "antd";

import { useRegisterUser, useUpdateUser } from "../../data/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { GET_USERS } from "@/shared/constantes";
import { useRouter } from "next/navigation";

export default function FormAddClient({
  mode,
  setOpen,
  form,
  isUpdate,
  setIsUpdate,
  dataSelected,
}: {
  mode?: string;
  setOpen?: any;
  form?: any;
  isUpdate?: boolean;
  setIsUpdate?: any;
  dataSelected?: IClient | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [accept, setAccept] = useState(false);
  const [loading, setLoading] = useState(false);

  const { mutate: updateUser } = useUpdateUser();
  const { mutate: createUserMutate }: any = useRegisterUser();

  const handleSubmit = async (values: IUser) => {
    setLoading(true);

    try {
      if (isUpdate) {
        const payload = {
          id: dataSelected?.id,
          data: values,
        };
        await updateUser(payload, {
          onSuccess: () => {
            message.success("Utilisateur mis à jour avec succès !");
            queryClient.invalidateQueries({ queryKey: [GET_USERS] });
            setOpen(false);
            form.resetFields();
          },
          onError: (error: any) => {
            message.error(error.message || "Erreur lors de la mise à jour");
          },
        });
      } else {
        await createUserMutate(values, {
          onSuccess: async (response: any) => {
            message.success("Utilisateur créé avec succès !");
            queryClient.invalidateQueries({ queryKey: [GET_USERS] });
            // setOpen(false);
            // form.resetFields();
            if (mode !== "admin") {
              await signIn("credentials", {
                redirect: false,
                email: values.email,
                password: values.password,
              });

              if (response?.data) {
                // message.error(response.data.error);
                console.log("response", response);
                setLoading(false);
              } else {
                // Vérifie la session mise à jour
                const session = await fetch("/api/auth/session").then((res) =>
                  res.json()
                );

                if (session?.user?.role === "ADMIN") {
                  // router.push("/admin/dashboard");
                  window.location.href = "/admin/dashboard";
                } else if (session?.user?.role === "USER") {
                  // router.push("/");
                  window.location.href = "/";
                }
                setLoading(false);
                setOpen(false);
                if (mode === "admin") form.resetFields();
              }
            }
          },
          onError: (error: any) => {
            message.error(error.message || "Erreur lors de la création");
          },
        });
      }
    } catch (err: any) {
      message.error(err.response?.data?.error || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        initialValues={{
          role: "USER",
          country: "CA",
          status: true,
        }}
      >
        <div className="grid grid-cols-1 gap-x-8 gap-y-0 sm:grid-cols-6">
          <Form.Item
            className="col-span-6 sm:col-span-3"
            label="Prénom"
            name="name"
            rules={[{ required: true, message: "Le prénom est requis" }]}
          >
            <Input size="large" placeholder="Prénom" />
          </Form.Item>

          <Form.Item
            className="col-span-6 sm:col-span-3"
            label="Email"
            name="email"
            rules={[
              { required: true, message: "L'email est requis" },
              { type: "email", message: "Format d'email invalide" },
            ]}
          >
            <Input size="large" placeholder="Email" />
          </Form.Item>

          {!isUpdate && (
            <Form.Item
              className="col-span-6 sm:col-span-3"
              label="Mot de passe"
              name="password"
            >
              <Input.Password size="large" placeholder="Mot de passe" />
            </Form.Item>
          )}

          <Form.Item
            className="col-span-6 sm:col-span-3"
            label="Téléphone"
            name="phone"
            rules={[{ required: true, message: "Le téléphone est requis" }]}
          >
            <Input size="large" placeholder="Téléphone" />
          </Form.Item>

          <Form.Item className="col-span-6" label="Adresse" name="address">
            <Input size="large" placeholder="Adresse" />
          </Form.Item>

          <Form.Item
            className="col-span-6 sm:col-span-2"
            label="Code postal"
            name="zipcode"
          >
            <Input size="large" placeholder="Code postal" />
          </Form.Item>

          <Form.Item
            className="col-span-6 sm:col-span-2"
            label="Ville"
            name="city"
          >
            <Input size="large" placeholder="Ville" />
          </Form.Item>

          <Form.Item
            className="col-span-6 sm:col-span-2"
            label="Pays"
            name="country"
          >
            <Select
              size="large"
              options={[
                { label: "Canada", value: "CA" },
                { label: "United States", value: "US" },
                { label: "France", value: "FR" },
              ]}
            />
          </Form.Item>
        </div>

        {mode !== "admin" && (
          <Form.Item name="terms" className="col-span-6">
            <Checkbox onChange={(e) => setAccept(e.target.checked)}>
              J'accepte les{" "}
              <Link href="/terms">conditions d&rsquo;utilisation</Link>
            </Checkbox>
          </Form.Item>
        )}

        <div className="flex justify-end gap-x-4">
          {mode !== "admin" && (
            <Button
              loading={loading}
              size="large"
              type="link"
              onClick={() => router.push("/auth/signin")}
            >
              {isUpdate ? "Mettre à jour" : "Retour"}
            </Button>
          )}
          <Button
            loading={loading}
            size="large"
            type="primary"
            htmlType="submit"
            disabled={mode === "admin" ? false : !accept}
          >
            {isUpdate ? "Mettre à jour" : "S'inscrire"}
          </Button>

          {mode === "admin" && (
            <Button
              size="large"
              onClick={() => {
                setOpen(false);
                setIsUpdate(false);
                form.resetFields();
              }}
            >
              Annuler
            </Button>
          )}
        </div>
      </Form>
    </Spin>
  );
}
