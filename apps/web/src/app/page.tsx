import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="h-full flex flex-col justify-center items-center gap-y-2">
      <Image
        width={100}
        height={100}
        src="https://flowser.dev/icon.png"
        alt="Flowser logo"
      />

      <div className="text-center flex flex-col">
        <span>Choose a network</span>
        <div className="flex gap-x-2">
          <Link href="/flow-emulator">
            Emulator
          </Link>
          <Link href="/flow-testnet">
            Testnet
          </Link>
          <Link href="/flow-mainnet">
            Mainnet
          </Link>
        </div>
      </div>
    </div>
  )
}
