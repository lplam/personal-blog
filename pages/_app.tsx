import "../styles/globals.scss";
import "../styles/github-theme.scss";
import type { AppProps } from "next/app";
import Link from "next/link";
import { Fragment } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }: AppProps) {
  const page = pageProps?.repo ?? "";
  console.log("pageProps: ", pageProps);
  const router = useRouter();

  return (
    <Fragment>
      <Head>
        <title>lplam-blog</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin={""}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Overpass+Mono&family=Rozha+One&family=Spectral:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://use.typekit.net/nme2fxj.css" />
      </Head>
      <div className="flex justify-center items-center bg-stone-100 h-16 font-serif">
        <div className="container-center justify-between center-horizontal text-stone-500 font-bold font-mono text-sm">
          <div>
            <Link href="/">
              <a className="font-bold text-stone-700">LPL</a>
            </Link>
          </div>
          <button
            className="animate-pulse inline-block"
            type="button"
            onClick={router.back}
          >
            go back
          </button>
        </div>
      </div>
      <Component {...pageProps} />
      <footer className="flex font-mono justify-center items-center h-16 bg-stone-100 text-stone-500 text-sm">
        <div className="container-center center-horizontal flex justify-between">
          <p>Contact me:</p>
          <a
            className="animate-bounce"
            href={"https://www.linkedin.com/in/phuclamle/"}
          >
            Linkedin.com
          </a>
          <a
            className="text-blue-500 animate-pulse"
            href={"https://facebook.com/phuclam534"}
          >
            Facebook.com
          </a>
        </div>
      </footer>
    </Fragment>
  );
}

export default MyApp;
