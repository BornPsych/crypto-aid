"use client";

import { NextPageWithLayout } from "./_app";
import Layout from "../components/Layout";
import { ReactElement, useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { Campaign } from "../utils/interfaces-types";
import Card from "../components/Card";
import { getCampaigns } from "../utils/functions";
import NewCampaignWrapper from "../components/NewCampaignWrapper";

const List: NextPageWithLayout = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterOption, setFilterOption] = useState("all");

  useEffect(() => {
    setIsLoading(true);

    /**
     * Fetches data from the server asynchronously.
     *
     * @return {Promise<void>} A promise that resolves when the data is fetched successfully.
     */
    const fetchData = async () => {
      const result: Campaign[] = await getCampaigns(
        "ASC",
        filterOption === "active" ? false : true
      );
      setCampaigns(result);
      console.log('Result',result)
      setIsLoading(false);
    };

    fetchData();
  }, [filterOption]);


  const allowedAddress = "0x88c48F67Ddde182C57273FD60bB662d425AD291a"
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

  return (
    <main>
      {isLoading && <LoadingSpinner />}
      <section className="px-8 py-8">
        <h1 className="text-4xl text-center font-mono font-semibold mb-8">
          List of campaigns
        </h1>
        <div className="flex justify-end text-right mb-4">
          <div className="flex flex-col">
            <label className="mr-2 mb-2">Filter for status:</label>
            <select
              value={filterOption}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 max-w-[200px]"
              onChange={(e) => setFilterOption(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Only active</option>
            </select>
          </div>
        </div>
        {campaigns.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign, index) => (
                <Card key={index} campaign={campaign} />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center italic py-8">No campaigns yet</p>
        )}
      </section>
      {allowedAddress ==userAddress?(<NewCampaignWrapper />):(<></>)};
    </main>
  );
};

List.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default List;
 