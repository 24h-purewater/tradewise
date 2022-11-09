import * as React from "react";
import Head from "next/head";
import { AppProps } from "next/app";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme, { darkTheme } from "../src/theme";
import "../styles/globals.css";

// Client-side cache, shared for the whole session of the user in the browser.

interface MyAppProps extends AppProps {}

export default function MyApp(props: MyAppProps) {
  const { Component, pageProps } = props;
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
