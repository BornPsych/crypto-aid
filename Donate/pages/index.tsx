"use client";

import Card from "./../components/Card";
import { ReactElement, useEffect, useState } from "react";

import Link from "next/link";
import { NextPageWithLayout } from "./_app";
import Layout from "../components/Layout";
import { Campaign } from "../utils/interfaces-types";
import LoadingSpinner from "../components/LoadingSpinner";
import { getCampaigns } from "../utils/functions";
import NewCampaignWrapper from "../components/NewCampaignWrapper";
import HomeLandscape from '../assets/homelandscape.png';
import Image from "next/image";
 
const Home: NextPageWithLayout = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const adminAddress = "0x1ED513520fb320765abd2C1982c8FDfE391d8D4A"
  const [userAddress, setUserAddress] = useState("");
  useEffect(() => {
    // Fetch the wagmi.store data from localStorage
    const wagmiData = localStorage.getItem('wagmi.store');
    console.log("wagmi-data", wagmiData );
    if (wagmiData) {
        // Parse the wagmiData to convert it into a JavaScript object
        const parsedData = JSON.parse(wagmiData);

        // Extract the user's address from the parsedData
        // Note: Adjust the following line according to the structure of your wagmi.store data
        const address = parsedData?.state.data.account; 

        if (address) {
            setUserAddress(address);
        }
    }
}, []);

  useEffect(() => {
    setIsLoading(true);

    /**
     * Fetches data asynchronously.
     *
     * @return {Promise<void>} Promise that resolves when data is fetched.
     */
    const fetchData = async () => {
      const result: Campaign[] = await getCampaigns("DESC", false, 3);
      setCampaigns(result);
      setIsLoading(false);
    }; 

    fetchData();
  }, []);

  return (
    <main>
      {isLoading && <LoadingSpinner />}
      <section className="px-8 pt-8">
        <h1 className="text-6xl text-center uppercase font-semibold mb-4 font-mono">⛑️Crypto Aid⛑️</h1>
        <Image src={HomeLandscape} alt="Home Landscape" className="w-full h-72 m-0 p-0"/>
        <p className="text-center text-lg mb-8 font-mono">
          Welcome to Crypto Aid, Donate with believe, trust and transparency.
          <br />
          Crypto Aid harnesses blockchain technology to guarantee transparency for all your loaded funds.
          Eliminating intermediaries, smart contracts autonomously disburse funds to the intended beneficiary as soon
          as the target amount is met.
        </p>
      </section>
      <section className="mb-8 px-8">
        <h2 className="text-lg text-center font-mono font-semibold mb-4">
          Recent Campaigns
        </h2>
        {campaigns.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign, index) => (
                <Card key={index} campaign={campaign} />
              ))}
            </div>
            <p className="text-center mt-4">
              <Link
                href="/list"
                title="View full campaign list"
                className="text-blue-500 font-mono font-semibold hover:underline"
              >
                View Full Campaign List
              </Link>
            </p>
          </div>
        ) : (
          <p className="text-center italic py-8">No campaigns yet</p>
        )}
      </section>
      {adminAddress == userAddress?(<NewCampaignWrapper />):(<></>)}
      {process.env.GOERLI_URL_PROVIDER}
    </main>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Home;
