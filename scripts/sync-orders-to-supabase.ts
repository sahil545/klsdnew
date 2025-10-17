import { wooCommerce } from "../client/lib/woocommerce";
import {
  mapWooOrderToSupabaseInput,
  upsertSupabaseOrder,
  type UpsertSupabaseOrderInput,
} from "../lib/supabase-orders";

const DEFAULT_PER_PAGE = 100;
const DEFAULT_MAX_PAGES = 5000;

type SyncArgs = {
  perPage: number;
  pages: number;
  startPage: number;
  status: string[];
  since?: Date;
};

type SyncSummary = {
  total: number;
  skipped: number;
  upserted: number;
  failures: Array<{ orderId: number; error: string }>;
};

function parseArgs(argv: string[]): SyncArgs {
  let perPage = DEFAULT_PER_PAGE;
  let pages = DEFAULT_MAX_PAGES;
  let startPage = 1;
  const status: string[] = [];
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
    } else if (arg.startsWith("--startPage=")) {
      const value = Number.parseInt(arg.slice("--startPage=".length), 10);
      if (Number.isFinite(value) && value > 0) {
        startPage = value;
      }
    } else if (arg.startsWith("--status=")) {
      const tokens = arg
        .slice("--status=".length)
        .split(",")
        .map((token) => token.trim())
        .filter((token) => token.length > 0);
      status.push(...tokens);
    } else if (arg.startsWith("--since=")) {
      const token = arg.slice("--since=".length).trim();
      const parsed = Date.parse(token);
      if (!Number.isFinite(parsed)) {
        throw new Error(`Invalid --since value. Use ISO date format. Received: ${token}`);
      }
      since = new Date(parsed);
    }
  }

  return { perPage, pages, startPage, status: Array.from(new Set(status)), since };
}

function shouldSkipByStatus(statusFilters: string[], payload: UpsertSupabaseOrderInput): boolean {
  if (!statusFilters.length) return false;
  const normalized = payload.status.toLowerCase();
  return !statusFilters.some((status) => status.toLowerCase() === normalized);
}

function shouldSkipBySince(since: Date | undefined, payload: UpsertSupabaseOrderInput): boolean {
  if (!since) return false;

  const candidates = [payload.modified_at, payload.created_at, payload.date_completed, payload.date_paid]
    .map((value) => (typeof value === "string" ? value : null))
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  if (!candidates.length) return false;

  const latest = candidates
    .map((value) => Date.parse(value))
    .filter((value) => Number.isFinite(value))
    .reduce((max, current) => (current > max ? current : max), -Infinity);

  if (!Number.isFinite(latest) || latest === -Infinity) return false;

  return latest < since.getTime();
}

async function runSync(args: SyncArgs): Promise<SyncSummary> {
  let page = args.startPage;
  const summary: SyncSummary = {
    total: 0,
    skipped: 0,
    upserted: 0,
    failures: [],
  };

  while (page <= args.pages) {
    const endpoint = `/orders?per_page=${args.perPage}&page=${page}&orderby=date&order=desc`;

    const orders = await wooCommerce.makeRequest(endpoint);
    if (!orders.length) {
      break;
    }

    for (const order of orders) {
      summary.total += 1;

      try {
        const payload = mapWooOrderToSupabaseInput(order);

        if (shouldSkipByStatus(args.status, payload)) {
          summary.skipped += 1;
          continue;
        }

        if (shouldSkipBySince(args.since, payload)) {
          summary.skipped += 1;
          continue;
        }

        await upsertSupabaseOrder(payload);
        summary.upserted += 1;
      } catch (error) {
        const orderId = typeof order?.id === "number" ? order.id : Number.parseInt(String(order?.id ?? 0), 10) || 0;
        summary.failures.push({
          orderId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    if (orders.length < args.perPage) {
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
