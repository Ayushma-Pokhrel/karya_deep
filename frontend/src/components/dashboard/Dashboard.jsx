import Main from "./Main";

export default function Dashboard() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* --------------Main dashboard--------------- */}
      <div className="bg-secondary w-full p-6 overflow-y-auto">
        <Main />
      </div>
    </div>
  );
}