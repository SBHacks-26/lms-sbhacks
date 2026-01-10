import { Body } from "./components/body/Body";
import { Nav } from "./components/nav/Nav";

export default function Home() {
  return (
    <div className="flex">
      <Nav />
      <Body />
    </div>
  );
}
