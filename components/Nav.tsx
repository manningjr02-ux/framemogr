import Link from "next/link";
import Image from "next/image";
import Container from "./Container";

export default function Nav() {
  return (
    <nav className="border-b border-zinc-800/80 py-4">
      <Container>
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-white transition-colors hover:text-cyan-300"
          >
            <Image
              src="/logo.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8"
            />
            framrmog
          </Link>
          <Link
            href="/upload"
            className="text-sm font-medium text-zinc-400 hover:text-cyan-300 transition-colors"
          >
            Upload
          </Link>
        </div>
      </Container>
    </nav>
  );
}
