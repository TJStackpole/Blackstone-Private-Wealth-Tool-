import Link from "next/link";

/** "Built by TJ Stackpole", linking to the About page. In every page footer. */
export default function BuiltBy({ className = "" }: { className?: string }) {
  return (
    <Link href="/about" className={`underline decoration-line underline-offset-2 hover:text-ink ${className}`}>
      Built by TJ Stackpole
    </Link>
  );
}
