"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import {
  useCreateTracking,
  useGetTrackings,
  useUpdateTracking,
} from "@/app/data/hooks";
import { message } from "antd";
import { Textarea } from "@/components/ui/textarea";
import { ITracking } from "@/app/interface";
import queryClient from "@/config/reactQueryConfig";
import { GET_TRACKINGS } from "@/shared/constantes";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Configurer dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

interface TrackingFormProps {
  mode?: "create" | "edit";
  initialData?: ITracking;
  onSuccess?: () => void;
}

export function TrackingForm({
  mode,
  initialData,
  onSuccess,
}: TrackingFormProps) {
  const { data: session }: any = useSession();
  const router = useRouter();
  const { refetch } = useGetTrackings();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [description, setDescription] = useState("");

  const { mutate: createTracking } = useCreateTracking();
  const { mutate: updateTracking } = useUpdateTracking();

  // Initialize form with existing data if in edit mode
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setDate(new Date(initialData.date));

      // Conversion des dates UTC en heure locale (Toronto)
      const startDateTime = dayjs
        .utc(initialData.startTime)
        .tz("America/Toronto");
      const endDateTime = dayjs.utc(initialData.endTime).tz("America/Toronto");

      // Format 24h pour l'affichage local
      setStartTime(startDateTime.format("HH:mm"));
      setEndTime(endDateTime.format("HH:mm"));

      setEndLocation(initialData.endLocation);
      setDistance(initialData.distance.toString());
      setDescription(initialData.description);
    }
  }, [mode, initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const baseDate = dayjs(date).tz("America/Toronto");
      const trackingData = {
        userId: session?.user?.id,
        date: baseDate.toISOString(),
        startTime: baseDate
          .hour(parseInt(startTime.split(":")[0]))
          .minute(parseInt(startTime.split(":")[1]))
          .toISOString(),
        endTime: baseDate
          .hour(parseInt(endTime.split(":")[0]))
          .minute(parseInt(endTime.split(":")[1]))
          .toISOString(),
        endLocation,
        distance: Number(distance),
        description,
      };

      if (mode === "create") {
        await createTracking(trackingData, {
          onSuccess: () => {
            message.success("Tracking created successfully!");
            refetch();
            queryClient.invalidateQueries({ queryKey: [GET_TRACKINGS] });
            onSuccess?.();
          },
          onError: (error: any) => {
            message.error(error.message || "Error creating tracking");
          },
        });
      } else if (mode === "edit") {
        await updateTracking(
          { id: initialData?.id, data: trackingData },
          {
            onSuccess: () => {
              message.success("Tracking updated successfully!");
              queryClient.invalidateQueries({ queryKey: [GET_TRACKINGS] });
              refetch();
              onSuccess?.();
            },
            onError: (error: any) => {
              message.error(error.message || "Error updating tracking");
            },
          }
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                      new Intl.DateTimeFormat("en-CA", {
                        dateStyle: "full",
                      }).format(date)
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => setDate(date || new Date())}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>End Location</Label>
              <Input
                value={endLocation}
                onChange={(e) => setEndLocation(e.target.value)}
                placeholder="Enter end location"
              />
            </div>

            <div>
              <Label>Distance (km)</Label>
              <Input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="Enter distance in kilometers"
                required
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                ? "Create Tracking"
                : "Update Tracking"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
