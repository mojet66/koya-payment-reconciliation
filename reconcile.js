// Payment reconciliation.
//
// Reads payments.jsonl and works out how much money we actually collected.
// Run:  node reconcile.js

const fs = require("fs");

// let total = 0;
// let count = 0;

// const lines = fs.readFileSync("payments.jsonl", "utf8").split("\n").filter((l) => l.length > 0);
// for (const line of lines) {
//   const event = JSON.parse(line);
//   if (event.status === "success") {
//     total += Number(event.amount);
//     count += 1;
//   }
// }

const latestPayments = new Map();

const lines = fs.readFileSync("payments.jsonl", "utf8").split("\n");

for (const line of lines) {
  if (line.trim().length === 0) {
    continue;
  }
  let event;
  try {
    event = JSON.parse(line);
  } catch {
    continue;
  }
  if (!event.txn_id) {
    continue;
  }
  const existing = latestPayments.get(event.txn_id);
  if (!existing || new Date(event.ts) > new Date(existing.ts)) {
    latestPayments.set(event.txn_id, event);
  }
}

let total = 0;
let count = 0;

for (const event of latestPayments.values()) {
  if (event.status === "success") {
    const amount = Number(String(event.amount).replace(/,/g, ""));

    total += amount;
    count += 1;
  }
}

const expected = parseInt(fs.readFileSync("expected.txt", "utf8").trim(), 10);

if (count !== expected) {
  console.log(
    `Check failed: counted ${count} successful payments, expected ${expected}.`,
  );
  console.log(
    "Something in the data isn't being handled the way the README describes.",
  );
} else {
  console.log(`Check passed: ${count} successful payments.`);
  console.log(`Your code: KOYA-${Math.round(total)}`);
}
