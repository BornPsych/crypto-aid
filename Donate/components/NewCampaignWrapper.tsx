import Link from "next/link";
import { releaseDonation } from "../utils/functions";

const NewCampaignWrapper = () => {
  const handleReleaseFund = async () =>{

        const { result, hash } = await releaseDonation(0);
        console.log(result);
  };
  return (
    <section className="text-center p-8 bottom-14 absolute w-full font-mono bg-green-100">
      <Link
        href="/new"
        title="Create new campaign"
        className="bg-green-400 hover:bg-green-600 py-4 px-8 rounded text-sm font-mono font-semibold  mr-4"
      >
        Create Campaign
      </Link>

      <button
        onClick={
          handleReleaseFund
        }
        className="bg-green-400 hover:bg-green-600 py-4 px-8 rounded text-sm font-mono font-semibold"
      >
        Release Fund
      </button>
    </section>
  );
};

export default NewCampaignWrapper;
