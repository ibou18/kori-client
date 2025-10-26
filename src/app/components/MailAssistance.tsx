/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Form, Input, Button, Select, message } from "antd";
import axios from "axios";

export default function MailAssistance({
  user,
  setOpen,
}: {
  user: any;
  setOpen: any;
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  console.log("user", user);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    values.user = user;
    console.log("values", values);

    await axios
      .post("/api/support", values)
      .then((res) => {
        console.log("res", res);
        message.success("Message envoyé avec succès !");
        setLoading(false);
        form.resetFields();
        setOpen(false);
      })
      .catch((error) => {
        console.log("error", error);
        message.error("Échec de l'envoi du message, veuillez réessayer.");
        setLoading(false);
      });
  };

  return (
    <div>
      <h1>Mail d&lsquo;assistance</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ subject: "general" }} // Valeur par défaut
      >
        <Form.Item
          label="Sujet"
          name="subject"
          rules={[
            { required: true, message: "Veuillez sélectionner un sujet !" },
          ]}
        >
          <Select placeholder="Sélectionnez un sujet">
            <Select.Option value="technical">Problème technique</Select.Option>
            <Select.Option value="billing">
              Problème de facturation
            </Select.Option>
            <Select.Option value="general">Question générale</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Message"
          name="message"
          rules={[
            { required: true, message: "Veuillez entrer votre message !" },
            {
              max: 500,
              message: "Le message ne doit pas dépasser 500 caractères.",
            },
          ]}
        >
          <Input.TextArea rows={4} placeholder="Entrez votre message" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Envoyer
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
