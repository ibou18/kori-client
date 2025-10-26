/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import PageWrapper from "@/app/components/block/PageWrapper";
import FormSendSms from "@/app/components/form/FormSendSms";
import { useGetSms, useGetUsers } from "@/app/data/hooks";
import { Modal, Popover, Table, Tag } from "antd";
import dayjs from "dayjs";
import { PlusCircle, Users } from "lucide-react";

import { useState } from "react";

export default function Sms() {
  const { data: smsData, isLoading } = useGetSms();
  const [open, setOpen] = useState(false);

  const { data: users, isLoading: usersLoading } = useGetUsers();

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (text: string) => (
        <Tag color="cyan" className="text-xs">
          {text.slice(-6)}
        </Tag>
      ),
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: (text: string) => (
        <div className="max-w-md">
          <span className="text-sm">{text}</span>
        </div>
      ),
    },
    {
      title: "Destinataires",
      dataIndex: "users",
      key: "users",
      width: 100,
      render: (_: any, record: any) => (
        <Popover
          content={
            <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
              {record.users.map((user: any) => (
                <div key={user.id} className="flex flex-col">
                  <span className="font-medium text-sm">{user.name}</span>
                  <span className="text-xs text-gray-500">{user.phone}</span>
                </div>
              ))}
            </div>
          }
          title="Liste des destinataires"
          trigger="hover"
        >
          <div className="flex items-center gap-2 cursor-pointer">
            <Users size={16} className="text-gray-500" />
            <span className="text-sm">{record.users.length}</span>
          </div>
        </Popover>
      ),
    },
    {
      title: "Serveur",
      dataIndex: "serverType",
      key: "serverType",
      render: (text: string) => (
        <Tag color="blue" className="text-xs">
          {text}
        </Tag>
      ),
    },
    {
      title: "Date d'envoi",
      dataIndex: "sentAt",
      key: "sentAt",
      render: (date: string) => (
        <div className="text-sm">{dayjs(date).format("DD/MM/YYYY HH:mm")}</div>
      ),
    },
  ];

  // Utilisation dans le composant Table
  <Table
    columns={columns}
    dataSource={smsData}
    rowKey="id"
    pagination={{
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `Total ${total} SMS`,
    }}
    scroll={{ x: "max-content" }}
  />;

  return (
    <PageWrapper
      title="SMS"
      buttonTitle="Envoyer un SMS"
      handleClick={() => setOpen(true)}
      icon={<PlusCircle />}
    >
      <Table
        size="small"
        columns={columns}
        dataSource={smsData || []}
        loading={isLoading}
        rowKey="id"
        pagination={false}
      />

      <Modal
        title="SMS"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={800}
      >
        <FormSendSms
          setOpen={setOpen}
          users={users || []}
          usersLoading={usersLoading}
        />
      </Modal>
    </PageWrapper>
  );
}
