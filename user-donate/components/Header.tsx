import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getContributions } from "../utils/functions";
import { formatEther } from "viem";
import Image from "next/image";
import Logo from '../assets/logoEthIndia.png';

/**
 * Generates the header component.
 *
 * @returns {JSX.Element} - Returns the JSX element representing the header component.
 */
const Header = () => {
  const { isConnected, address } = useAccount();
  const [showDonations, setShowDonations] = useState(false);
  const [contributionAmount, setContributionAmount] = useState("");

  useEffect(() => {
    setShowDonations(isConnected);

    /**
     * Retrieves the amount of donations of a given address.
     *
     * @return {Promise<void>} - Returns a promise that resolves to void.
     */
    const getDonationsAmount = async () => {
      const value = await getContributions(address as `0x${string}`);
      setContributionAmount(formatEther(value));
    };

    if (isConnected) getDonationsAmount();
  }, [isConnected, address]);

  return (
    <header className="flex justify-between items-center p-4 border-b-2 align border-gray-300">
      <div className="flex items-center flex-column">
        <Image src={Logo} alt="Logo" width={40} height={40}/>
        <Link
          href="/"
          title="Home"
          className="text-2xl font-mono leading-loose pointer text-center font-semibold"
        >
           CryptoAid
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {showDonations && (
          <p className="bg-green-400 font-mono py-2 px-4 rounded text-xs text-white hidden sm:block">
            You donated: {contributionAmount} ETH
          </p>
        )}
        <ConnectButton />
      </div>
    </header>
  );
};

export default Header;
