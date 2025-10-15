import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <link
          rel="icon"
          href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/favicon.ico`}
        />
      <Head />
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
