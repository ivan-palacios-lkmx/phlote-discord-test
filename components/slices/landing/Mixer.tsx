import PlayIcon from "@/components/icons/Play";

export default function Mixer() {
  return (
    <div className="border-b border-white p-6">
      <div className="flex flex-row items-center gap-4">
        <button className="w-12 h-12 rounded-full border-2 border-white bg-white flex items-center justify-center hover:bg-white/90 transition-colors">
          <PlayIcon className="w-6 h-6" style={{ fill: "black" }} />
        </button>
        <div className="bg-white rounded-lg flex-1 h-16"></div>
      </div>
    </div>
  );
}
