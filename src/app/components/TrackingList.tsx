/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { EmptyState } from "./EmptyState";

import { TrackingActions } from "./TrackingActions";
import { ITracking } from "../interface";
import { ADMIN } from "@/shared/constantes";

import { Spin } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Configurer dayjs avec les plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export function TrackingList({
  data,
  session,
}: {
  data: ITracking[];
  session: any;
}) {
  if (!data) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin />
      </div>
    );
  }

  return (
    <>
      <div className="">
        {data?.length === 0 ? (
          <EmptyState
            title="No trackings found"
            description="Create a tracking to get started"
            buttontext="Create tracking"
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Distance (km)</TableHead>
                  <TableHead>Description</TableHead>
                  {session.user.role === ADMIN && <TableHead>User</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((tracking: any) => (
                  <TableRow key={tracking.id}>
                    <TableCell>
                      {new Intl.DateTimeFormat("fr-FR", {
                        dateStyle: "medium",
                      }).format(new Date(tracking.date))}
                    </TableCell>
                    <TableCell>
                      {new Intl.DateTimeFormat("fr-FR", {
                        timeStyle: "short",
                      }).format(new Date(tracking.startTime))}
                    </TableCell>
                    <TableCell>
                      {dayjs(tracking.endTime)
                        .tz("America/Toronto")
                        .format("HH:mm")}
                    </TableCell>
                    <TableCell>{tracking.endLocation}</TableCell>
                    <TableCell>{tracking.distance}</TableCell>
                    <TableCell>{tracking.description}</TableCell>
                    {session?.user?.role === ADMIN && (
                      <TableCell>
                        {tracking.user?.firstName} {tracking.user?.lastName}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <TrackingActions id={tracking.id} data={tracking} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </div>
    </>
  );
}
