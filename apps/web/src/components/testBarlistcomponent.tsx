"use client";

import { useState } from "react";

import { SearchIcon } from "lucide-react";
import { BarList } from "./charts/barList";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Dialog, DialogContent } from "./ui/dialog";
import { Input } from "./ui/input";

const coaches = [
  {
    name: "Sarah Johnson",
    value: 28,
  },
  {
    name: "Michael Chen",
    value: 24,
  },
  {
    name: "Emily Rodriguez",
    value: 22,
  },
  {
    name: "David Thompson",
    value: 19,
  },
  {
    name: "Jessica Williams",
    value: 17,
  },
  {
    name: "Robert Davis",
    value: 15,
  },
  {
    name: "Amanda Brown",
    value: 14,
  },
  {
    name: "Christopher Lee",
    value: 12,
  },
  {
    name: "Nicole Martinez",
    value: 11,
  },
  {
    name: "Kevin Anderson",
    value: 9,
  },
  {
    name: "Rachel Taylor",
    value: 8,
  },
  {
    name: "Brandon Wilson",
    value: 7,
  },
  {
    name: "Stephanie Clark",
    value: 6,
  },
  {
    name: "Timothy Moore",
    value: 5,
  },
  {
    name: "Jennifer Garcia",
    value: 4,
  },
];

const valueFormatter = (number: number) =>
  `${number} client${number !== 1 ? "s" : ""}`;

export default function ExampleBarListComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const filteredItems = coaches.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <Card className="relative px-6 py-6 sm:mx-auto sm:max-w-lg">
      <p className="text-muted-foreground text-sm">Active Clients</p>
      <p className="font-semibold text-2xl text-foreground">247</p>
      <div className="mt-6 flex items-center justify-between">
        <p className="font-medium text-foreground text-sm">Top 5 Coaches</p>
        <p className="font-medium text-muted-foreground text-xs uppercase">
          Clients
        </p>
      </div>
      <BarList
        data={coaches.slice(0, 5)}
        valueFormatter={valueFormatter}
        className="mt-4"
      />
      <div className="absolute inset-x-0 bottom-0 flex justify-center rounded-b-lg bg-gradient-to-t from-background to-transparent py-7">
        <Button type="button" variant="outline" onClick={() => setIsOpen(true)}>
          Show more
        </Button>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="overflow-hidden p-0">
          <div className="px-6 py-6 pb-4">
            <div className="relative">
              <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search coaches..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between pt-4">
              <p className="font-medium text-foreground text-sm">Coaches</p>
              <p className="font-medium text-muted-foreground text-xs uppercase">
                Clients
              </p>
            </div>
          </div>
          <div className="h-96 overflow-y-scroll px-6">
            {filteredItems.length > 0 ? (
              <BarList data={filteredItems} valueFormatter={valueFormatter} />
            ) : (
              <p className="flex h-full items-center justify-center text-foreground text-sm">
                No results.
              </p>
            )}
          </div>
          <div className="mt-4 border-border border-t bg-muted/30 p-6">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              Go back
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
