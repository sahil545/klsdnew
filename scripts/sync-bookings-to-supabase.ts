import { wooCommerce } from "../client/lib/woocommerce";
import {
  mapWooBookingToSupabaseInput,
  upsertSupabaseBooking,
  type UpsertSupabaseBookingInput,
} from "../lib/supabase-bookings";

const DEFAULT_PER_PAGE = 50;
const DEFAULT_MAX_PAGES = 200;

type SyncArgs = {
  perPage: number;
  pages: number;
  since?: Date;
};

type SyncSummary = {
  total: number;
  skipped: number;
  upserted: number;
  failures: Array<{ bookingId: number; error: string }>;
};

function parseArgs(argv: string[]): SyncArgs {
  let perPage = DEFAULT_PER_PAGE;
  let pages = DEFAULT_MAX_PAGES;
  let since: Date | undefined;

  for (const arg of argv) {
    if (arg.startsWith("--perPage=")) {
      const value = Number.parseInt(arg.slice("--perPage=".length), 10);
      if (Number.isFinite(value) && value > 0) {
        perPage = Math.min(100, value);
      }
    } else if (arg.startsWith("--pages=")) {
      const value = Number.parseInt(arg.slice("--pages=".length), 10);
      if (Number.isFinite(value) && value > 0) {
        pages = value;
      }
    } else if (arg.startsWith("--since=")) {
      const token = arg.slice("--since=".length).trim();
      const parsed = Date.parse(token);
      if (Number.isFinite(parsed)) {
        since = new Date(parsed);
      } else {
        throw new Error(`Invalid --since value. Use ISO date format. Received: ${token}`);
      }
    }
  }

  return { perPage, pages, since };
}

function shouldSkipBySince(since: Date | undefined, payload: UpsertSupabaseBookingInput): boolean {
  if (!since) return false;
  const isoCandidates = [payload.modified_at, payload.created_at, payload.start_at, payload.end_at]
    .map((value) => (typeof value === "string" ? value : null))
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  if (!isoCandidates.length) return false;

  const latest = isoCandidates
    .map((value) => Date.parse(value))
    .filter((value) => Number.isFinite(value))
    .reduce((max, current) => (current > max ? current : max), -Infinity);

  if (!Number.isFinite(latest) || latest === -Infinity) return false;

  return latest < since.getTime();
}

async function runSync(args: SyncArgs): Promise<SyncSummary> {
  let page = 1;
  const summary: SyncSummary = {
    total: 0,
    skipped: 0,
    upserted: 0,
    failures: [],
  };

  while (page <= args.pages) {
    const bookings = await wooCommerce.listBookings(page, args.perPage);
    if (!bookings.length) {
      break;
    }

    for (const booking of bookings) {
      summary.total += 1;

      try {
        const payload = mapWooBookingToSupabaseInput(booking);
        if (shouldSkipBySince(args.since, payload)) {
          summary.skipped += 1;
          continue;
        }

        await upsertSupabaseBooking(payload);
        summary.upserted += 1;
      } catch (error) {
        const bookingId = typeof booking?.id === "number" ? booking.id : Number.parseInt(String(booking?.id ?? 0), 10) || 0;
        summary.failures.push({
          bookingId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    if (bookings.length < args.perPage) {
      break;
    }

    page += 1;
  }

  return summary;
}

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const summary = await runSync(args);
    console.log(
      JSON.stringify(
        {
          ok: true,
          summary,
          message: `Total: ${summary.total}, Upserted: ${summary.upserted}, Skipped: ${summary.skipped}, Failures: ${summary.failures.length}`,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
  }
}

void main();
