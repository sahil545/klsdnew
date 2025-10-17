import { redirect } from "next/navigation";

import Link from "next/link";

export default function BlogIndexRedirect() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 text-center">
      <div>
        <p>This page has moved.</p>
        <p className="mt-2">
          <Link className="underline" href="/scuba-diving-blog">
            Go to Scuba Diving Blog
          </Link>
        </p>
      </div>
    </div>
  );
}
