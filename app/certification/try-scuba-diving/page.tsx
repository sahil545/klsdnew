import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 text-center">
      <div>
        <p>This page has moved.</p>
        <p className="mt-2">
          <Link className="underline" href="/scuba-certification-courses-florida-keys/discover-scuba-diving-key-largo">
            Go to Discover Scuba Diving
          </Link>
        </p>
      </div>
    </div>
  );
}
