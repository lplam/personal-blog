import type { NextPage } from "next";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const router = useRouter();
  return (
    <>
      <main className="container-center github-theme my-10 min-h-full flex-1">
        <br></br>
        <br></br>
        <br></br>
        <h1>Hi, I'm Lam</h1>
        <p>
          I'm{" "}
          <strong className="text-blue-500 animate-pulse">
            Backend Developer
          </strong>
        </p>
        <p>
          {"Thank you for your visit my site "}
          <span className="animate-ping">.</span>
          <span className="animate-ping">.</span>
          <span className="animate-ping">.</span>
        </p>
        <br></br>
        <div className="grid grid-cols-2 gap-2">
          <div
            onClick={() => router.push("/portfolio")}
            className="col-span-1 w-full h-12 flex items-center justify-center bg-red-50 rounded-lg cursor-pointer animate-pulse font-semibold"
          >
            My portfolio
          </div>
          <div
            onClick={() => router.push("/blogs")}
            className="col-span-1 w-full h-12 flex items-center justify-center bg-green-200 rounded-lg cursor-pointer animate-pulse font-semibold"
          >
            My Blog
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
