import ModalLayout from "@/Layouts/ModalLayout";
import { router } from "@inertiajs/react";

export default function Charts(){
    const chartData = [
  {
    fund: "Fund 13",
    totalProposals: 1620,
    fundedProposals: 200,
    completedProposals: 50,
  },
  {
    fund: "Fund 12",
    totalProposals: 1150,
    fundedProposals: 260,
    completedProposals: 40,
  },
  {
    fund: "Fund 11",
    totalProposals: 920,
    fundedProposals: 300,
    completedProposals: 60,
  },
  {
    fund: "Fund 10",
    totalProposals: 1350,
    fundedProposals: 320,
    completedProposals: 45,
  },
  {
    fund: "Fund 9",
    totalProposals: 1090,
    fundedProposals: 350,
    completedProposals: 100,
  },
  {
    fund: "Fund 8",
    totalProposals: 980,
    fundedProposals: 420,
    completedProposals: 220,
  },
  {
    fund: "Fund 7",
    totalProposals: 823,
    fundedProposals: 525,
    completedProposals: 511,
  },
  {
    fund: "Fund 6",
    totalProposals: 610,
    fundedProposals: 180,
    completedProposals: 100,
  },
  {
    fund: "Fund 5",
    totalProposals: 320,
    fundedProposals: 50,
    completedProposals: 30,
  },
  {
    fund: "Fund 4",
    totalProposals: 290,
    fundedProposals: 40,
    completedProposals: 20,
  },
  {
    fund: "Fund 3",
    totalProposals: 130,
    fundedProposals: 20,
    completedProposals: 10,
  },
];

 function handleChartDetailModalClose() {
        router.reload({ only: ['proposals'] });
        //router.get(localizedRoute);
    }

    return (
        <ModalLayout onModalClosed={handleChartDetailModalClose}>
            <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">Charts</h1>
                <p className="text-sm text-gray-500">Select the charts you want to display.</p>
            </div>
            <div className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold">Chart Options</h2>
                <p className="text-sm text-gray-500">Select the chart options you want to display.</p>
            </div>
        </div>
        </ModalLayout>
    );
}