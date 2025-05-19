// Sets all the routes for the app.

import { Routes } from "react-router";
import { AppContextProvider } from "../../context/AppContext";
import { Route } from "react-router";
import { MainSearch } from ".";

export default function Home() {
  return (
    <>
      <h1>{"Home"}</h1>
      <MainSearch />
    </>
  )
}
