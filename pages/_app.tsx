import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { AppProps } from "next/app";
import Head from "next/head";
import { darkTheme } from "../src/theme";
import "../styles/globals.css";

// Client-side cache, shared for the whole session of the user in the browser.

interface MyAppProps extends AppProps {}

export default function MyApp(props: MyAppProps) {
  const { Component, pageProps } = props;
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <meta name="theme-color" content="#121212" />
      </Head>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
