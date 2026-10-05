"use client";

import { useState } from "react";

type Props = {
  totalSeats: number;
  bookedSeats: number[];  // seat numbers that are already taken
  maxSelect: number;      // max seats user can select
  onSelectionChange: (selected: number[]) => void;
};

// Layout: Toyota Hiace style — 2+1 seating, driver at front-left
// Row 0: [Driver] [_] [Door]
// Row 1-5: [Seat] [Aisle] [Seat] [Seat]   (2+1 or 2+2)
function getSeatLayout(total: number) {
  const rows: (number | "aisle" | "driver" | "door" | null)[][] = [];

  // Row 0: driver row
  rows.push(["driver", null, "door"]);

  let seatNum = 1;
  const seatsPerRow = total <= 10 ? 3 : 4; // 2+1 for small, 2+2 for large

  while (seatNum <= total) {
    const row: (number | "aisle" | null)[] = [];
    if (seatsPerRow === 3) {
      // 2+1 layout: [seat] [aisle] [seat] ... or just [seat] if last
      row.push(seatNum <= total ? seatNum++ : null);
      row.push("aisle");
      row.push(seatNum <= total ? seatNum++ : null);
      row.push(seatNum <= total ? seatNum++ : null);
    } else {
      // 2+2 layout
      row.push(seatNum <= total ? seatNum++ : null);
      row.push(seatNum <= total ? seatNum++ : null);
      row.push("aisle");
      row.push(seatNum <= total ? seatNum++ : null);
      row.push(seatNum <= total ? seatNum++ : null);
    }
    rows.push(row);
  }

  return rows;
}

export function SeatMap({ totalSeats, bookedSeats, maxSelect, onSelectionChange }: Props) {
  const [selected, setSelected] = useState<number[]>([]);
  const layout = getSeatLayout(totalSeats);

  const toggle = (seatNum: number) => {
    if (bookedSeats.includes(seatNum)) return;

    let next: number[];
    if (selected.includes(seatNum)) {
      next = selected.filter((s) => s !== seatNum);
    } else {
      if (selected.length >= maxSelect) return;
      next = [...selected, seatNum];
    }
    setSelected(next);
    onSelectionChange(next);
  };

  return (
    <div className="inline-flex flex-col items-center gap-1 rounded-2xl border border-brand-dark/10 bg-surface-100 p-4">
      <p className="mb-2 text-xs font-bold text-muted">Pilih kursi (maks {maxSelect})</p>
      {layout.map((row, ri) => (
        <div key={ri} className="flex gap-1">
          {row.map((cell, ci) => {
            if (cell === "driver") {
              return (
                <div key={ci} className="grid h-9 w-9 place-items-center rounded-lg bg-brand-dark text-[10px] font-bold text-white">
                  🚗
                </div>
              );
            }
            if (cell === "door") {
              return (
                <div key={ci} className="grid h-9 w-9 place-items-center rounded-lg border border-dashed border-brand-dark/20 text-[10px] text-muted">
                  🚪
                </div>
              );
            }
            if (cell === "aisle") {
              return <div key={ci} className="w-4" />;
            }
            if (cell === null) {
              return <div key={ci} className="h-9 w-9" />;
            }

            const isBooked = bookedSeats.includes(cell);
            const isSelected = selected.includes(cell);

            return (
              <button
                key={ci}
                type="button"
                disabled={isBooked}
                onClick={() => toggle(cell)}
                aria-label={`Kursi ${cell}${isBooked ? " (terisi)" : isSelected ? " (dipilih)" : ""}`}
                className={`grid h-9 w-9 place-items-center rounded-lg text-xs font-bold transition ${
                  isBooked
                    ? "cursor-not-allowed bg-red-100 text-red-400"
                    : isSelected
                    ? "bg-brand-strong text-white ring-2 ring-brand-strong/30 scale-105"
                    : "bg-white text-brand-dark shadow-sm hover:bg-brand-soft hover:scale-105"
                }`}
              >
                {cell}
              </button>
            );
          })}
        </div>
      ))}

      {/* Legend */}
      <div className="mt-3 flex gap-4 text-[10px] text-muted">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-white border border-brand-dark/15" /> Tersedia
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-brand-strong" /> Dipilih
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-red-100" /> Terisi
        </span>
      </div>
    </div>
  );
}
