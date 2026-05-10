export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center space-x-6 md:order-2">
            <span className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} 每日英文教練. All rights
              reserved.
            </span>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <h2 className="text-xl font-bold text-gray-900">每日英文教練</h2>
            <p className="text-center text-base text-gray-500">
              由 Antigravity 建立，支援 Vercel 與 Supabase。
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
