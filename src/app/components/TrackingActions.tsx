/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle,
  MailCheck,
  MoreHorizontal,
  Pencil,
  Trash,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useState } from "react";
import { toast } from "sonner";
import {
  useDeleteTracking,
  useGetTrackings,
  useUpdateTracking,
} from "../data/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { GET_TRACKINGS } from "@/shared/constantes";
import { TrackingForm } from "./form/TrackingForm";
import { ITracking } from "../interface";

interface ITrackingListProps {
  [x: string]: any;
  data: ITracking;
}

export function TrackingActions({ id, data }: ITrackingListProps) {
  const queryClient = useQueryClient();
  const { refetch } = useGetTrackings();
  const [openModal, setOpenModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { mutate: updateTracking } = useUpdateTracking();
  const { mutate: deleteTracking } = useDeleteTracking();

  const handleMarkAsPaid = async () => {
    const payload: any = {
      id,
    };
    try {
      await updateTracking(payload, {
        onSuccess: () => {
          refetch();
        },
      });
      toast.success("Tracking marked as paid");
      setOpenModal(false);
    } catch (error: any) {
      console.log("error", error);
      toast.error("Failed to mark invoice as paid");
    }
  };

  const hanleDeleteTracking = async () => {
    try {
      await deleteTracking(id);
      refetch();
      queryClient.invalidateQueries({ queryKey: [GET_TRACKINGS] });
      toast.success("Tracking deleted successfully");
    } catch (error: any) {
      console.log("error", error);
      toast.error("Failed to delete invoice");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="secondary">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
            <Pencil className="size-4 mr-2" /> Edit Tracking
          </DropdownMenuItem>
          {/* <DropdownMenuItem onClick={handleSendTracking}>
            <MailCheck className="size-4 mr-2" /> Send Tracking
          </DropdownMenuItem> */}
          <DropdownMenuItem asChild className="mt-2">
            <Button
              className="bg-red-500  text-white"
              onClick={hanleDeleteTracking}
            >
              <Trash className="size-4 mr-2" /> Delete Tracking
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Tracking as Paid</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this invoice as paid? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkAsPaid}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tracking</DialogTitle>
          </DialogHeader>
          <TrackingForm
            mode="edit"
            initialData={data}
            onSuccess={() => setIsEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
