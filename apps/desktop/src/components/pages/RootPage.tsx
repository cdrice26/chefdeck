export default function RootPage() {
  return (
    <>
      <div
        className="w-full h-10 fixed top-0 left-0"
        data-tauri-drag-region
      ></div>
      <div className="w-full h-full flex">
        <h1>Welcome to the Desktop App</h1>
      </div>
    </>
  );
}
