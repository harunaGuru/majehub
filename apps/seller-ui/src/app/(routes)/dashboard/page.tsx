import DevicePieChart from '@/shared/components/charts/DevicePieChart';
import SalesChart from '@/shared/components/charts/SalesChart';
import DistributionMap from '@/shared/components/dashboard/DistributionMap';
import RecentOrdersTable from '@/shared/components/dashboard/RecentOrdersTable';

const DashboardPage = () => {
  return (
    <div className="bg-black min-h-screen p-4 space-y-4">
      {/* Top Section */}
      <div className="flex flex-col xl:flex-row gap-4">
        <div className="w-full xl:w-[65%]">
          <SalesChart />
        </div>

        <div className="w-full xl:w-[35%]">
          <DevicePieChart />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col xl:flex-row gap-4">
        <div className="w-full xl:w-[55%]">
          <DistributionMap />
        </div>

        <div className="w-full xl:w-[45%]">
          <RecentOrdersTable />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;