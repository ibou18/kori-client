/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, Input, Select, message } from "antd";
import { useState } from "react";
import { useSendSms } from "@/app/data/hooks";
import { IUser } from "@/app/interface";

interface FormSendSmsProps {
  users: IUser[];
  usersLoading?: boolean;
  setOpen?: (open: boolean) => void;
}

export default function FormSendSms({
  users,
  usersLoading,
  setOpen,
}: FormSendSmsProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { mutate: sendSms } = useSendSms();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        message: values.message,
        serverType: values.serverType,
        users: values.users.map((userId: string) =>
          users.find((user) => user.id === userId)
        ),
      };

      await sendSms(payload, {
        onSuccess: () => {
          message.success("SMS envoyé avec succès !");
          form.resetFields();
          setOpen?.(false);
        },
        onError: (error: any) => {
          message.error(error.message || "Erreur lors de l'envoi");
        },
      });
    } catch (err: any) {
      message.error(err.response?.data?.error || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        serverType: "MAIN",
      }}
    >
      {/* Message */}
      <Form.Item
        label="Message"
        name="message"
        rules={[{ required: true, message: "Le message est requis" }]}
      >
        <Input.TextArea
          rows={4}
          placeholder="Entrez votre message..."
          maxLength={160}
          showCount
        />
      </Form.Item>

      {/* Server Type */}
      <Form.Item
        label="Type de serveur"
        name="serverType"
        rules={[{ required: true, message: "Le type de serveur est requis" }]}
      >
        <Select
          options={[
            { label: "Principal", value: "MAIN" },
            { label: "Backup", value: "BACKUP" },
          ]}
        />
      </Form.Item>

      {/* Users */}
      <Form.Item
        label="Destinataires"
        name="users"
        rules={[
          { required: true, message: "Sélectionnez au moins un destinataire" },
        ]}
      >
        <Select
          loading={usersLoading}
          mode="multiple"
          placeholder="Sélectionnez les destinataires"
          optionFilterProp="label"
          options={users.map((user) => ({
            label: `${user.firstName} (${user.phone})`,
            value: user.id,
          }))}
          showSearch
        />
      </Form.Item>

      {/* Submit Button */}
      <Form.Item className="mb-0">
        <Button type="primary" htmlType="submit" loading={loading} block>
          Envoyer le SMS
        </Button>
      </Form.Item>
    </Form>
  );
}
